"""
db/queries/file_text.py
------------------------
Query module for the FileText table.
Stores parsed, chunked text extracted from uploaded files.
Each file may have one or more ordered chunks if its content exceeds CHUNK_CHAR_SIZE.
"""
from typing import Any
from db.queries.base import insert_row, fetch_all, execute


# Inserts a single text chunk for a file
async def insert_file_text_chunk(file_id: str, chunk_index: int, content: str) -> dict[str, Any]:
    row = await insert_row(
        """
        INSERT INTO public."FileText" ("FileId", "ChunkIndex", "Content")
        VALUES ($1, $2, $3)
        ON CONFLICT ("FileId", "ChunkIndex") DO UPDATE SET "Content" = EXCLUDED."Content"
        RETURNING "FileId", "ChunkIndex"
        """,
        file_id,
        chunk_index,
        content,
    )
    return dict(row) if row else {}


# Returns all text chunks for a file ordered. Orders it by the index of the chunk
async def get_file_text_chunks(file_id: str) -> list[dict[str, Any]]:
    rows = await fetch_all(
        """
        SELECT "ChunkIndex", "Content"
        FROM public."FileText"
        WHERE "FileId" = $1
        ORDER BY "ChunkIndex" ASC
        """,
        file_id,
    )
    return [dict(row) for row in rows] if rows else []


# Deletes all stored text chunks for a file
async def delete_file_text(file_id: str) -> None:
    await execute(
        'DELETE FROM public."FileText" WHERE "FileId" = $1',
        file_id,
    )
