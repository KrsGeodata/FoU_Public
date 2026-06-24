from collections import defaultdict
from typing import Any

from fastapi import HTTPException

from database.database import dict_cursor
from schemas.bestemmelse import (
    BestemmelseCategory,
    BestemmelseTitle,
    BuildingTypeOption,
    PlanDetail,
)
from schemas.plan import (
    FieldOut,
    FormalCodeGroup,
    HensynssoneOption,
    PlanListItem,
    PlanregisterSuggestion,
    PlotOut,
)


def list_active_plans(conn) -> list[PlanListItem]:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT
              p.id,
              p.plan_id,
              p.plannavn AS name,
              p.ikraft AS adopted_date,
              COALESCE(f.field_count, 0) AS field_count,
              COALESCE(t.plot_count, 0) AS plot_count,
              p.updated_at
            FROM planregister p
            LEFT JOIN (
              SELECT planregister_id, COUNT(*) AS field_count
              FROM felt
              GROUP BY planregister_id
            ) f ON f.planregister_id = p.id
            LEFT JOIN (
              SELECT f.planregister_id, COUNT(t.id) AS plot_count
              FROM felt f
              LEFT JOIN tomt t ON t.felt_id = f.id
              GROUP BY f.planregister_id
            ) t ON t.planregister_id = p.id
            WHERE p.is_active = TRUE
            ORDER BY p.updated_at DESC, p.plan_id ASC
            """
        )
        rows = cur.fetchall()

    return [PlanListItem(**row) for row in rows]


def search_planregister(conn, query: str, limit: int = 10) -> list[PlanregisterSuggestion]:
    q = query.strip()
    if not q:
        return []

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT id, plan_id, plannavn AS name, ikraft AS adopted_date
            FROM planregister
            WHERE plan_id ILIKE %s
            ORDER BY plan_id ASC
            LIMIT %s
            """,
            (f"{q}%", limit),
        )
        rows = cur.fetchall()

    return [PlanregisterSuggestion(**row) for row in rows]


def get_planregister_by_plan_id(conn, plan_id: str) -> dict[str, Any] | None:
    with dict_cursor(conn) as cur:
        cur.execute(
            "SELECT id, plan_id, plannavn, ikraft FROM planregister WHERE plan_id = %s",
            (plan_id,),
        )
        return cur.fetchone()


def ensure_plan_exists(conn, planregister_id: int) -> dict[str, Any]:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT id, plan_id, plannavn, ikraft, map_url, regulations_url, description_url
            FROM planregister
            WHERE id = %s
            """,
            (planregister_id,),
        )
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Plan not found")
    return row


def get_fields(conn, planregister_id: int) -> list[FieldOut]:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT id, navn AS field_name, formal_1, formal_2
            FROM felt
            WHERE planregister_id = %s
            ORDER BY sortering, id
            """,
            (planregister_id,),
        )
        field_rows = cur.fetchall()

        cur.execute(
            """
            SELECT id, felt_id, navn
            FROM tomt
            WHERE felt_id IN (
              SELECT id FROM felt WHERE planregister_id = %s
            )
            ORDER BY sortering, id
            """,
            (planregister_id,),
        )
        plot_rows = cur.fetchall()

    plots_by_field: dict[int, list[PlotOut]] = defaultdict(list)
    for plot in plot_rows:
        plots_by_field[int(plot["felt_id"])].append(
            PlotOut(id=int(plot["id"]), plotName=plot["navn"])
        )

    result: list[FieldOut] = []
    for field in field_rows:
        fid = int(field["id"])
        result.append(
            FieldOut(
                id=fid,
                fieldName=field["field_name"],
                formal_1=field["formal_1"],
                formal_2=field["formal_2"],
                plots=plots_by_field.get(fid, []),
            )
        )
    return result


def list_formal_codes_grouped(conn) -> list[FormalCodeGroup]:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT formal_1, formal_2
            FROM formal_kode
            ORDER BY formal_1, formal_2
            """
        )
        rows = cur.fetchall()

    grouped: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        formal_1 = row["formal_1"]
        formal_2 = row["formal_2"]
        grouped[formal_1].append(formal_2)

    return [
        FormalCodeGroup(formal_1=formal_1, formal_2_options=formal_2_options)
        for formal_1, formal_2_options in grouped.items()
    ]


def get_categories(conn) -> list[BestemmelseCategory]:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT id, tema_kategori_id, navn, sortering
            FROM tema_tittel
            ORDER BY tema_kategori_id, sortering, id
            """
        )
        titles = cur.fetchall()

        cur.execute(
            """
            SELECT id, navn, sortering
            FROM tema_kategori
            ORDER BY sortering, id
            """
        )
        categories = cur.fetchall()

    titles_by_cat: dict[int, list[BestemmelseTitle]] = defaultdict(list)
    for title in titles:
        titles_by_cat[int(title["tema_kategori_id"])].append(
            BestemmelseTitle(id=int(title["id"]), label=title["navn"])
        )

    return [
        BestemmelseCategory(
            id=int(cat["id"]),
            name=cat["navn"],
            titles=titles_by_cat.get(int(cat["id"]), []),
        )
        for cat in categories
    ]


def get_building_types(conn) -> list[BuildingTypeOption]:
    with dict_cursor(conn) as cur:
        cur.execute("SELECT id, navn FROM tiltaktype ORDER BY sortering, id")
        rows = cur.fetchall()

    return [BuildingTypeOption(code=str(row["id"]), name=row["navn"]) for row in rows]


def get_hensynssoner(conn) -> list[HensynssoneOption]:
    with dict_cursor(conn) as cur:
        cur.execute("SELECT kode, navn FROM hensynssone_type ORDER BY sortering, kode")
        rows = cur.fetchall()

    return [HensynssoneOption(kode=int(row["kode"]), navn=row["navn"]) for row in rows]


def list_hensynssoner(conn) -> list[HensynssoneOption]:
    return get_hensynssoner(conn)


def get_plan_detail(conn, planregister_id: int) -> PlanDetail:
    from services.bestemmelse_service import get_bestemmelser_for_plan

    row = ensure_plan_exists(conn, planregister_id)

    return PlanDetail(
        id=int(row["id"]),
        planId=row["plan_id"],
        name=row["plannavn"],
        adoptedDate=row["ikraft"],
        mapUrl=row["map_url"],
        regulationsUrl=row["regulations_url"],
        descriptionUrl=row["description_url"],
        fields=get_fields(conn, planregister_id),
        categories=get_categories(conn),
        buildingTypes=get_building_types(conn),
        hensynssoner=get_hensynssoner(conn),
        bestemmelser=get_bestemmelser_for_plan(conn, planregister_id),
    )
