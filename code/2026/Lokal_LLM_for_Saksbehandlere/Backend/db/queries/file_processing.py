"""
db/queries/file_processing.py
------------------------------
Query module for the FileProcessing table.
Tracks the parsing status of each uploaded file:
  UPLOADED -> PROCESSING -> READY or FAILED
"""
from typing import Any
from db.queries.base import insert_row, fetch_row, fetch_all, update_row


# Creates a FileProcessing record with UPLOADED status after upload
async def insert_file_processing(file_id: str) -> dict[str, Any]:
    row = await insert_row(
        """
        INSERT INTO public."FileProcessing" ("FileId", "Status")
        VALUES ($1, 'UPLOADED')
        ON CONFLICT ("FileId") DO NOTHING
        RETURNING "FileId", "Status", "UpdatedAt"
        """,
        file_id,
    )
    return dict(row) if row else {}


# Updates the processing status for a file, i.e (UPLOADED / PROCESSING / READY / FAILED)
async def update_file_processing_status(
    file_id: str, status: str, error_message: str | None = None
) -> dict[str, Any]:
    row = await update_row(
        """
        UPDATE public."FileProcessing"
        SET "Status" = $2, "ErrorMessage" = $3, "UpdatedAt" = now()
        WHERE "FileId" = $1
        RETURNING "FileId", "Status", "ErrorMessage", "UpdatedAt"
        """,
        file_id,
        status,
        error_message,
    )
    return dict(row) if row else {}


# Gets the current processing status for a file
async def get_file_processing_status(file_id: str) -> dict[str, Any]:
    row = await fetch_row(
        """
        SELECT "FileId", "Status", "ErrorMessage", "UpdatedAt"
        FROM public."FileProcessing"
        WHERE "FileId" = $1
        """,
        file_id,
    )
    return dict(row) if row else {}

# Returns all files linked to a chat with their current processing status
async def get_files_for_chat(chat_id: int) -> list[dict[str, Any]]:
    rows = await fetch_all(
        """
        SELECT fp."FileId", fp."Status", fp."ErrorMessage", f."OriginalFilename", f."FileExtension"
        FROM public."FileProcessing" fp
        JOIN public."File" f ON f."FileId" = fp."FileId"
        WHERE f."ChatId" = $1
        """,
        chat_id,
    )
    return [dict(row) for row in rows] if rows else []


# Returns all files linked to a case with their current processing status
async def get_files_for_case(case_id: int) -> list[dict[str, Any]]:
    rows = await fetch_all(
        """
        SELECT fp."FileId", fp."Status", fp."ErrorMessage", f."OriginalFilename", f."FileExtension"
        FROM public."FileProcessing" fp
        JOIN public."File" f ON f."FileId" = fp."FileId"
        WHERE f."CaseId" = $1
        """,
        case_id,
    )
    return [dict(row) for row in rows] if rows else []
