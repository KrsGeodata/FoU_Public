"""
db/queries/chats.py
-------------------
Concrete query module for Chat table operations.

Uses reusable helpers from db.queries.base.
"""
from db.queries.base import fetch_all, fetch_value, fetch_row, insert_rows, update_row, insert_row
from db.connection import get_pool
import asyncpg
from itertools import groupby
from classes import Chat
from typing import Any

# ========================================== #
#                   CREATE                   #
# ========================================== #
async def insert_chat(chat: Chat) -> dict[str, Any] | None:
    """Inserts a chat into the database and returns the created object with ChatId"""

    data = chat.model_dump(exclude={"ChatId"})
    data = {key: value for key, value in data.items() if value is not None and value != 0}

    if not data:
        return None

    fields = list(data.keys())
    values = list(data.values())

    # Build column names and placeholders
    col_names = ", ".join(f'"{field}"' for field in fields)
    placeholders = ", ".join(f"${i + 1}" for i in range(len(fields)))

    sql = f"""
        INSERT INTO public."Chat" ({col_names})
        VALUES ({placeholders})
        RETURNING "ChatId", "CreatedAt"
    """

    row = await insert_row(sql, *values)
    
    return dict(row) if row else None


# ========================================== #
#                   READ                     #
# ========================================== #
async def fetch_active_chat_by_id(chat_id: int) -> dict | None:
    """Fetches a chat from the database based on the ChatId"""
    row = await fetch_row(
        """
        SELECT "ChatId", "CaseId", "UserId", "Title", "Description", "CreatedAt"
        FROM public."Chat"
        WHERE "ChatId" = $1 AND "IsActive" = TRUE
        """, chat_id
    )
    return dict(row) if row else None


async def fetch_active_chats_by_case_id(case_id: int) -> list[dict] | None:
    """Fetches all active chats from the database based on the CaseId"""
    rows = await fetch_all(
        """
        SELECT "ChatId", "CaseId", "UserId", "Title", "Description", "CreatedAt"
        FROM public."Chat"
        WHERE "CaseId" = $1 AND "IsActive" = TRUE
        """, case_id
    )
    return [dict(row) for row in rows] if rows else None


async def fetch_active_chats_for_user(user_id: int) -> list[dict] | None:
    """Fetches all active chats from the database based on the UserId"""
    rows = await fetch_all(
        """
        SELECT "ChatId", "CaseId", "UserId", "Title", "Description", "CreatedAt"
        FROM public."Chat"
        WHERE "UserId" = $1 AND "IsActive" = TRUE
        """, user_id
    )
    return [dict(row) for row in rows] if rows else None



# ========================================== #
#                   UPDATE                   #
# ========================================== #
async def update_chat_record(chat: Chat) -> dict[str, Any] | None:
    """Updates a chat record based on the ChatId and UserId and returns the updated record"""
    data = chat.model_dump(exclude={"ChatId", "UserId"})
    data = {key: value for key, value in data.items() if value is not None}

    if not data:
        return None

    fields = list(data.keys())
    values = list(data.values())

    set_clause = ", ".join(f'"{field}" = ${i + 1}' for i, field in enumerate(fields))

    sql = f"""
        UPDATE public."Chat"
        SET {set_clause}
        WHERE "ChatId" = ${len(fields) + 1} AND "UserId" = ${len(fields) + 2} AND "IsActive" = TRUE
        RETURNING *
    """

    row = await update_row(sql, *values, chat.ChatId, chat.UserId)

    return dict(row) if row else None


# ========================================== #
#                   DELETE                   #
# ========================================== #
async def soft_delete_chat_by_chat_id(chat_id: int) -> dict[str, Any] | None:
   """Sets the IsActive field for a Chat to FALSE based on the chat_id"""
   query = f"""
        UPDATE public."Chat"
        SET "IsActive" = FALSE
        WHERE "ChatId" = $1 AND "IsActive" = TRUE
        RETURNING *
        """

   result = await update_row(query, chat_id)
   return dict(result) if result else None


# ========================================== #