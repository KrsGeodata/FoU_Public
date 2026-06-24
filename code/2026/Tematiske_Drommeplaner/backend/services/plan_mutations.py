from database.database import dict_cursor
from fastapi import HTTPException
from schemas.plan import FieldInput, PlanUpsertRequest
from services.plan_queries import ensure_plan_exists, get_planregister_by_plan_id


def _normalize_formal_value(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


def replace_fields(conn, planregister_id: int, fields: list[FieldInput]) -> None:
    with dict_cursor(conn) as cur:
        cur.execute("DELETE FROM felt WHERE planregister_id = %s", (planregister_id,))

        for idx, field in enumerate(fields):
            formal_1 = _normalize_formal_value(field.formal_1)
            formal_2 = _normalize_formal_value(field.formal_2)

            if (formal_1 is None) != (formal_2 is None):
                raise HTTPException(
                    status_code=422,
                    detail="Felt må ha både formål_1 og formål_2, eller ingen av dem.",
                )

            if formal_1 and formal_2:
                cur.execute(
                    """
                    SELECT 1
                    FROM formal_kode
                    WHERE formal_1 = %s AND formal_2 = %s
                    LIMIT 1
                    """,
                    (formal_1, formal_2),
                )
                if not cur.fetchone():
                    raise HTTPException(
                        status_code=422,
                        detail=f"Ugyldig formål-kombinasjon: {formal_1} -> {formal_2}",
                    )

            cur.execute(
                """
                INSERT INTO felt (planregister_id, navn, formal_1, formal_2, sortering)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    planregister_id,
                    field.name.strip(),
                    formal_1,
                    formal_2,
                    idx,
                ),
            )
            field_id = cur.fetchone()["id"]

            for pidx, plot in enumerate(field.plots):
                if not plot.name.strip():
                    continue
                cur.execute(
                    """
                    INSERT INTO tomt (felt_id, navn, sortering)
                    VALUES (%s, %s, %s)
                    """,
                    (field_id, plot.name.strip(), pidx),
                )


def create_plan(conn, payload: PlanUpsertRequest) -> int:
    plan_row = get_planregister_by_plan_id(conn, payload.plan_id)
    if not plan_row:
        raise HTTPException(status_code=404, detail="Plan-ID finnes ikke i planregister")

    planregister_id = int(plan_row["id"])

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            UPDATE planregister
            SET
                is_active = TRUE,
                map_url = %s,
                regulations_url = %s,
                description_url = %s,
                updated_at = NOW()
            WHERE id = %s
            """,
            (
                payload.map_url,
                payload.regulations_url,
                payload.description_url,
                planregister_id,
            ),
        )

    replace_fields(conn, planregister_id, payload.fields)
    return planregister_id


def update_plan(conn, planregister_id: int, payload: PlanUpsertRequest) -> None:
    ensure_plan_exists(conn, planregister_id)

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            UPDATE planregister
            SET
                map_url = %s,
                regulations_url = %s,
                description_url = %s,
                updated_at = NOW()
            WHERE id = %s
            """,
            (
                payload.map_url,
                payload.regulations_url,
                payload.description_url,
                planregister_id,
            ),
        )

    replace_fields(conn, planregister_id, payload.fields)


def delete_plan(conn, planregister_id: int) -> None:
    ensure_plan_exists(conn, planregister_id)

    with dict_cursor(conn) as cur:
        cur.execute("DELETE FROM bestemmelse WHERE planregister_id = %s", (planregister_id,))
        cur.execute("DELETE FROM felt WHERE planregister_id = %s", (planregister_id,))
        cur.execute(
            """
            UPDATE planregister
            SET
                is_active = FALSE,
                map_url = NULL,
                regulations_url = NULL,
                description_url = NULL,
                updated_at = NOW()
            WHERE id = %s
            """,
            (planregister_id,),
        )
