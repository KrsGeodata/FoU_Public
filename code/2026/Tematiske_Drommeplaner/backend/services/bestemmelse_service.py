from collections import defaultdict

from fastapi import HTTPException

from database.database import dict_cursor
from schemas.bestemmelse import BestemmelseItem, BestemmelseScopeItem, BestemmelseUpsertRequest, GalleriItemRef
from services.plan_queries import ensure_plan_exists


def get_galleri_items_for_bestemmelse(conn, bestemmelse_id: int) -> list[GalleriItemRef]:
    """Get all gallery items linked to a bestemmelse, ordered by sortering"""
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT
                bg.id,
                bg.tema_tittel_galleri_id,
                tg.forklaring,
                tg.overskrift,
                tg.bildefilnavn,
                tg.forklaringstekst,
                bg.sortering
            FROM bestemmelse_galleri bg
            JOIN tema_tittel_galeri tg ON tg.id = bg.tema_tittel_galleri_id
            WHERE bg.bestemmelse_id = %s
            ORDER BY bg.sortering, bg.id
            """,
            (bestemmelse_id,)
        )
        rows = cur.fetchall()
    
    return [
        GalleriItemRef(
            id=int(row["id"]),
            tema_tittel_galleri_id=int(row["tema_tittel_galleri_id"]),
            forklaring=row["forklaring"],
            overskrift=row["overskrift"],
            bildefilnavn=row["bildefilnavn"],
            forklaringstekst=row["forklaringstekst"],
            sortering=int(row["sortering"])
        )
        for row in rows
    ]


def link_galleri_items_to_bestemmelse(conn, bestemmelse_id: int, galleri_item_ids: list[int]) -> None:
    """Link multiple gallery items to a bestemmelse"""
    if not galleri_item_ids:
        return
    
    with dict_cursor(conn) as cur:
        # Verify all galleri items exist
        cur.execute(
            """
            SELECT id FROM tema_tittel_galeri
            WHERE id = ANY(%s)
            """,
            (galleri_item_ids,)
        )
        found_ids = {int(row["id"]) for row in cur.fetchall()}
        
        missing_ids = set(galleri_item_ids) - found_ids
        if missing_ids:
            raise HTTPException(status_code=400, detail=f"Galleri-elementer ikke funnet: {missing_ids}")
        
        # Insert links
        for sortering, galleri_id in enumerate(galleri_item_ids):
            cur.execute(
                """
                INSERT INTO bestemmelse_galleri (bestemmelse_id, tema_tittel_galleri_id, sortering)
                VALUES (%s, %s, %s)
                ON CONFLICT (bestemmelse_id, tema_tittel_galleri_id) DO UPDATE
                SET sortering = %s, updated_at = NOW()
                """,
                (bestemmelse_id, galleri_id, sortering, sortering)
            )



def get_bestemmelser_for_plan(conn, planregister_id: int) -> list[BestemmelseItem]:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
                        SELECT
                            b.id,
                            b.tema_tittel_id,
                            tt.navn AS title_label,
                            b.hensynssone_kode,
                            hs.navn AS hensynssone_navn,
                            b.innhold,
                            b.sortering
            FROM bestemmelse b
            LEFT JOIN tema_tittel tt ON tt.id = b.tema_tittel_id
                        LEFT JOIN hensynssone_type hs ON hs.kode = b.hensynssone_kode
            WHERE b.planregister_id = %s
            ORDER BY b.tema_tittel_id, b.sortering, b.id
            """,
            (planregister_id,),
        )
        base_rows = cur.fetchall()

    if not base_rows:
        return []

    bestemmelse_ids = [int(row["id"]) for row in base_rows]

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT bestemmelse_id, tiltaktype_id
            FROM bestemmelse_tiltaktype
            WHERE bestemmelse_id = ANY(%s)
            """,
            (bestemmelse_ids,),
        )
        bt_rows = cur.fetchall()

        cur.execute(
            """
            SELECT
              bs.bestemmelse_id,
              bs.scope_type,
              bs.scope_ref_id,
              f.id AS field_id,
              f.navn AS field_name,
              t.id AS plot_id,
              t.navn AS plot_name
            FROM bestemmelse_scope bs
            LEFT JOIN felt f
              ON bs.scope_type = 'felt' AND f.id = bs.scope_ref_id
            LEFT JOIN tomt t
              ON bs.scope_type = 'tomt' AND t.id = bs.scope_ref_id
            WHERE bs.bestemmelse_id = ANY(%s)
            """,
            (bestemmelse_ids,),
        )
        scope_rows = cur.fetchall()

    building_by_best: dict[int, list[str]] = defaultdict(list)
    for row in bt_rows:
        building_by_best[int(row["bestemmelse_id"])].append(str(row["tiltaktype_id"]))

    field_map: dict[int, tuple[int, str]] = {}
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT t.id AS tomt_id, f.id AS felt_id, f.navn AS felt_navn
            FROM tomt t
            JOIN felt f ON f.id = t.felt_id
            WHERE f.planregister_id = %s
            """,
            (planregister_id,),
        )
        for row in cur.fetchall():
            field_map[int(row["tomt_id"])] = (int(row["felt_id"]), row["felt_navn"])

    scope_by_best: dict[int, list[BestemmelseScopeItem]] = defaultdict(list)
    for row in scope_rows:
        bid = int(row["bestemmelse_id"])
        scope_type = row["scope_type"]
        if scope_type == "plan":
            continue
        if scope_type == "felt" and row["field_id"]:
            scope_by_best[bid].append(
                BestemmelseScopeItem(
                    fieldId=int(row["field_id"]),
                    fieldName=row["field_name"],
                    plotId=None,
                    plotName=None,
                )
            )
        elif scope_type == "tomt" and row["plot_id"]:
            plot_id = int(row["plot_id"])
            field_info = field_map.get(plot_id)
            if not field_info:
                continue
            scope_by_best[bid].append(
                BestemmelseScopeItem(
                    fieldId=field_info[0],
                    fieldName=field_info[1],
                    plotId=plot_id,
                    plotName=row["plot_name"],
                )
            )

    items: list[BestemmelseItem] = []
    for row in base_rows:
        bid = int(row["id"])
        items.append(
            BestemmelseItem(
                id=bid,
                titleId=row["tema_tittel_id"],
                titleLabel=row["title_label"],
                hensynssoneKode=row["hensynssone_kode"],
                hensynssoneNavn=row["hensynssone_navn"],
                content=row["innhold"],
                sortering=row["sortering"],
                scope=scope_by_best.get(bid, []),
                buildingTypeCodes=building_by_best.get(bid, []),
                galleriItems=get_galleri_items_for_bestemmelse(conn, bid),
            )
        )

    return items


def validate_and_build_scopes(
    conn,
    planregister_id: int,
    scope_payload: list[dict[str, int | None]],
) -> list[tuple[str, int]]:
    scopes: set[tuple[str, int]] = set()

    for item in scope_payload:
        field_id_raw = item.get("fieldId")
        plot_id_raw = item.get("plotId")

        if plot_id_raw is not None:
            plot_id = int(plot_id_raw)
            with dict_cursor(conn) as cur:
                cur.execute(
                    """
                    SELECT t.id
                    FROM tomt t
                    JOIN felt f ON f.id = t.felt_id
                    WHERE t.id = %s AND f.planregister_id = %s
                    """,
                    (plot_id, planregister_id),
                )
                if not cur.fetchone():
                    raise HTTPException(status_code=400, detail="Tomt finnes ikke for valgt plan")
            scopes.add(("tomt", plot_id))
            continue

        if field_id_raw is not None:
            field_id = int(field_id_raw)
            with dict_cursor(conn) as cur:
                cur.execute(
                    "SELECT id FROM felt WHERE id = %s AND planregister_id = %s",
                    (field_id, planregister_id),
                )
                if not cur.fetchone():
                    raise HTTPException(status_code=400, detail="Felt finnes ikke for valgt plan")
            scopes.add(("felt", field_id))

    if not scopes:
        scopes.add(("plan", planregister_id))

    return sorted(scopes)


def validate_tiltaktypes(conn, codes: list[str]) -> list[int]:
    if not codes:
        return []

    try:
        ids = sorted({int(code) for code in codes})
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Ugyldig tiltaktype") from exc

    with dict_cursor(conn) as cur:
        cur.execute("SELECT id FROM tiltaktype WHERE id = ANY(%s)", (ids,))
        found = {int(row["id"]) for row in cur.fetchall()}

    missing = [tid for tid in ids if tid not in found]
    if missing:
        raise HTTPException(status_code=400, detail=f"Ugyldig tiltaktype-id: {missing}")

    return ids


def validate_hensynssone(conn, kode: int | None) -> int | None:
    if kode is None:
        return None

    with dict_cursor(conn) as cur:
        cur.execute("SELECT kode FROM hensynssone_type WHERE kode = %s", (kode,))
        if not cur.fetchone():
            raise HTTPException(status_code=400, detail="Ugyldig hensynssone")

    return kode


def create_bestemmelse(conn, planregister_id: int, payload: BestemmelseUpsertRequest) -> BestemmelseItem:
    ensure_plan_exists(conn, planregister_id)
    scopes = validate_and_build_scopes(conn, planregister_id, payload.scope)
    tiltaktyper = validate_tiltaktypes(conn, payload.buildingTypeCodes)
    hensynssone_kode = validate_hensynssone(conn, payload.hensynssoneKode)

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            INSERT INTO bestemmelse (planregister_id, tema_tittel_id, hensynssone_kode, innhold, sortering)
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s
            )
            RETURNING id
            """,
            (planregister_id, payload.titleId, hensynssone_kode, payload.content.strip(), payload.sortering),
        )
        bestemmelse_id = int(cur.fetchone()["id"])

        for scope_type, scope_ref_id in scopes:
            cur.execute(
                """
                INSERT INTO bestemmelse_scope (bestemmelse_id, scope_type, scope_ref_id)
                VALUES (%s, %s, %s)
                """,
                (bestemmelse_id, scope_type, scope_ref_id),
            )

        for tiltaktype_id in tiltaktyper:
            cur.execute(
                """
                INSERT INTO bestemmelse_tiltaktype (bestemmelse_id, tiltaktype_id)
                VALUES (%s, %s)
                """,
                (bestemmelse_id, tiltaktype_id),
            )

        cur.execute("UPDATE planregister SET updated_at = NOW() WHERE id = %s", (planregister_id,))

    # Link gallery items to the bestemmelse
    link_galleri_items_to_bestemmelse(conn, bestemmelse_id, payload.galleriItemIds)
    conn.commit()

    rows = get_bestemmelser_for_plan(conn, planregister_id)
    for row in rows:
        if row.id == bestemmelse_id:
            return row

    raise HTTPException(status_code=500, detail="Kunne ikke hente opprettet bestemmelse")


def update_bestemmelse(conn, bestemmelse_id: int, payload: BestemmelseUpsertRequest) -> BestemmelseItem:
    with dict_cursor(conn) as cur:
        cur.execute("SELECT id, planregister_id FROM bestemmelse WHERE id = %s", (bestemmelse_id,))
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Bestemmelse ikke funnet")

    planregister_id = int(row["planregister_id"])
    scopes = validate_and_build_scopes(conn, planregister_id, payload.scope)
    tiltaktyper = validate_tiltaktypes(conn, payload.buildingTypeCodes)
    hensynssone_kode = validate_hensynssone(conn, payload.hensynssoneKode)

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            UPDATE bestemmelse
            SET tema_tittel_id = %s,
                hensynssone_kode = %s,
                innhold = %s,
                sortering = %s,
                oppdatert = NOW()
            WHERE id = %s
            """,
            (payload.titleId, hensynssone_kode, payload.content.strip(), payload.sortering, bestemmelse_id),
        )

        cur.execute("DELETE FROM bestemmelse_scope WHERE bestemmelse_id = %s", (bestemmelse_id,))
        for scope_type, scope_ref_id in scopes:
            cur.execute(
                """
                INSERT INTO bestemmelse_scope (bestemmelse_id, scope_type, scope_ref_id)
                VALUES (%s, %s, %s)
                """,
                (bestemmelse_id, scope_type, scope_ref_id),
            )

        cur.execute("DELETE FROM bestemmelse_tiltaktype WHERE bestemmelse_id = %s", (bestemmelse_id,))
        for tiltaktype_id in tiltaktyper:
            cur.execute(
                """
                INSERT INTO bestemmelse_tiltaktype (bestemmelse_id, tiltaktype_id)
                VALUES (%s, %s)
                """,
                (bestemmelse_id, tiltaktype_id),
            )

        cur.execute("DELETE FROM bestemmelse_galleri WHERE bestemmelse_id = %s", (bestemmelse_id,))

        cur.execute("UPDATE planregister SET updated_at = NOW() WHERE id = %s", (planregister_id,))

    # Link new gallery items
    link_galleri_items_to_bestemmelse(conn, bestemmelse_id, payload.galleriItemIds)
    conn.commit()

    rows = get_bestemmelser_for_plan(conn, planregister_id)
    for item in rows:
        if item.id == bestemmelse_id:
            return item

    raise HTTPException(status_code=500, detail="Kunne ikke hente oppdatert bestemmelse")


def delete_bestemmelse(conn, bestemmelse_id: int) -> None:
    with dict_cursor(conn) as cur:
        cur.execute("SELECT planregister_id FROM bestemmelse WHERE id = %s", (bestemmelse_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Bestemmelse ikke funnet")

        planregister_id = int(row["planregister_id"])
        cur.execute("DELETE FROM bestemmelse WHERE id = %s", (bestemmelse_id,))
        cur.execute("UPDATE planregister SET updated_at = NOW() WHERE id = %s", (planregister_id,))
