"""Gallery service - handles all gallery-related database operations"""

from fastapi import HTTPException
from psycopg2.extras import RealDictCursor
from schemas.galleri import GalleriItem, GalleriItemCreate, GalleriItemUpdate, DatafeltTypeOption


def dict_cursor(conn):
    """Context manager for dictionary cursor"""
    class DictCursorContext:
        def __enter__(self):
            self.cursor = conn.cursor(cursor_factory=RealDictCursor)
            return self.cursor
        def __exit__(self, *args):
            self.cursor.close()
    return DictCursorContext()


def get_datafelt_types(conn) -> list[DatafeltTypeOption]:
    """Get all available datafelt types (units)"""
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT id, navn
            FROM datafelt_type
            ORDER BY sortering
            """
        )
        rows = cur.fetchall()
    
    return [DatafeltTypeOption(id=int(row["id"]), navn=row["navn"]) for row in rows]


def get_all_galleri_items(conn) -> list[GalleriItem]:
    """Get all gallery items across all tema_tittel"""
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT 
                tg.id,
                tg.tema_tittel_id,
                tg.forklaring,
                tg.overskrift,
                tg.bildefilnavn,
                tg.forklaringstekst,
                tg.datafelt_type_id,
                dt.navn AS datafelt_type_navn,
                tg.sortering,
                tg.created_at,
                tg.updated_at
            FROM tema_tittel_galeri tg
            LEFT JOIN datafelt_type dt ON tg.datafelt_type_id = dt.id
            ORDER BY tg.sortering, tg.id
            """
        )
        rows = cur.fetchall()
    
    return [
        GalleriItem(
            id=int(row["id"]),
            tema_tittel_id=int(row["tema_tittel_id"]),
            forklaring=row["forklaring"],
            overskrift=row["overskrift"],
            bildefilnavn=row["bildefilnavn"],
            forklaringstekst=row["forklaringstekst"],
            datafelt_type_id=int(row["datafelt_type_id"]) if row["datafelt_type_id"] else None,
            datafelt_type_navn=row["datafelt_type_navn"],
            sortering=int(row["sortering"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
        for row in rows
    ]


def get_galleri_for_tema_tittel(conn, tema_tittel_id: int) -> list[GalleriItem]:
    """Get all gallery items for a specific tema_tittel"""
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT 
                tg.id,
                tg.tema_tittel_id,
                tg.forklaring,
                tg.overskrift,
                tg.bildefilnavn,
                tg.forklaringstekst,
                tg.datafelt_type_id,
                dt.navn AS datafelt_type_navn,
                tg.sortering,
                tg.created_at,
                tg.updated_at
            FROM tema_tittel_galeri tg
            LEFT JOIN datafelt_type dt ON tg.datafelt_type_id = dt.id
            WHERE tg.tema_tittel_id = %s
            ORDER BY tg.sortering, tg.id
            """,
            (tema_tittel_id,)
        )
        rows = cur.fetchall()
    
    return [
        GalleriItem(
            id=int(row["id"]),
            tema_tittel_id=int(row["tema_tittel_id"]),
            forklaring=row["forklaring"],
            overskrift=row["overskrift"],
            bildefilnavn=row["bildefilnavn"],
            forklaringstekst=row["forklaringstekst"],
            datafelt_type_id=int(row["datafelt_type_id"]) if row["datafelt_type_id"] else None,
            datafelt_type_navn=row["datafelt_type_navn"],
            sortering=int(row["sortering"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
        for row in rows
    ]


def get_galleri_item(conn, item_id: int) -> GalleriItem:
    """Get a single gallery item by ID"""
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT 
                tg.id,
                tg.tema_tittel_id,
                tg.forklaring,
                tg.overskrift,
                tg.bildefilnavn,
                tg.forklaringstekst,
                tg.datafelt_type_id,
                dt.navn AS datafelt_type_navn,
                tg.sortering,
                tg.created_at,
                tg.updated_at
            FROM tema_tittel_galeri tg
            LEFT JOIN datafelt_type dt ON tg.datafelt_type_id = dt.id
            WHERE tg.id = %s
            """,
            (item_id,)
        )
        row = cur.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Galleri-element ikke funnet")
    
    return GalleriItem(
        id=int(row["id"]),
        tema_tittel_id=int(row["tema_tittel_id"]),
        forklaring=row["forklaring"],
        overskrift=row["overskrift"],
        bildefilnavn=row["bildefilnavn"],
        forklaringstekst=row["forklaringstekst"],
        datafelt_type_id=int(row["datafelt_type_id"]) if row["datafelt_type_id"] else None,
        datafelt_type_navn=row["datafelt_type_navn"],
        sortering=int(row["sortering"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def create_galleri_item(conn, payload: GalleriItemCreate) -> GalleriItem:
    """Create a new gallery item"""
    # Verify tema_tittel exists
    with dict_cursor(conn) as cur:
        cur.execute("SELECT id FROM tema_tittel WHERE id = %s", (payload.tema_tittel_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=400, detail="Tema tittel ikke funnet")
    
    # Verify datafelt_type exists if specified
    if payload.datafelt_type_id:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT id FROM datafelt_type WHERE id = %s", (payload.datafelt_type_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=400, detail="Datafelt type ikke funnet")
    
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            INSERT INTO tema_tittel_galeri 
            (tema_tittel_id, forklaring, overskrift, bildefilnavn, forklaringstekst, datafelt_type_id, sortering)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                payload.tema_tittel_id,
                payload.forklaring.strip(),
                payload.overskrift.strip(),
                payload.bildefilnavn.strip() if payload.bildefilnavn else None,
                payload.forklaringstekst.strip() if payload.forklaringstekst else None,
                payload.datafelt_type_id,
                payload.sortering,
            ),
        )
        item_id = int(cur.fetchone()["id"])
    
    conn.commit()
    return get_galleri_item(conn, item_id)


def update_galleri_item(conn, item_id: int, payload: GalleriItemUpdate) -> GalleriItem:
    """Update a gallery item"""
    # Verify item exists
    existing = get_galleri_item(conn, item_id)
    
    # Verify datafelt_type if specified
    if payload.datafelt_type_id:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT id FROM datafelt_type WHERE id = %s", (payload.datafelt_type_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=400, detail="Datafelt type ikke funnet")
    
    updates = {}
    if payload.forklaring is not None:
        updates["forklaring"] = payload.forklaring.strip()
    if payload.overskrift is not None:
        updates["overskrift"] = payload.overskrift.strip()
    if payload.bildefilnavn is not None:
        updates["bildefilnavn"] = payload.bildefilnavn.strip() or None
    if payload.forklaringstekst is not None:
        updates["forklaringstekst"] = payload.forklaringstekst.strip() or None
    if payload.datafelt_type_id is not None:
        updates["datafelt_type_id"] = payload.datafelt_type_id
    if payload.sortering is not None:
        updates["sortering"] = payload.sortering
    
    if not updates:
        return existing
    
    updates["updated_at"] = "NOW()"
    set_clause = ", ".join([f"{k} = %s" for k in updates.keys() if k != "updated_at"])
    set_clause += ", updated_at = NOW()"
    
    values = [v for k, v in updates.items() if k != "updated_at"]
    values.append(item_id)
    
    with dict_cursor(conn) as cur:
        cur.execute(
            f"""
            UPDATE tema_tittel_galeri
            SET {set_clause}
            WHERE id = %s
            """,
            values,
        )
    
    conn.commit()
    return get_galleri_item(conn, item_id)


def delete_galleri_item(conn, item_id: int) -> None:
    """Delete a gallery item"""
    # Verify item exists
    get_galleri_item(conn, item_id)
    
    with dict_cursor(conn) as cur:
        cur.execute("DELETE FROM tema_tittel_galeri WHERE id = %s", (item_id,))
    
    conn.commit()
