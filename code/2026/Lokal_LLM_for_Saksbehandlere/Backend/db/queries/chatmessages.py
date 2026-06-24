"""
db/queries/chatmessages.py
-------------------
Concrete query module for ChatMessage table operations.

Uses reusable helpers from db.queries.base.
"""
from db.queries.base import fetch_all, insert_row
from classes import ChatMessage
import asyncpg
from typing import Any

# ========================================== #
#                   CREATE                   #
# ========================================== #
async def insert_chat_message(chat_message: ChatMessage) -> dict[str, Any] | None:
    """Inserts a chat message into the database and returns the created object with ChatMessageId"""

    data = chat_message.model_dump(exclude={"ChatMessageId"})
    data = {key: value for key, value in data.items() if value is not None and value != 0}

    if not data:
        return None

    fields = list(data.keys())
    values = list(data.values())

    # Build column names and placeholders
    col_names = ", ".join(f'"{field}"' for field in fields)
    placeholders = ", ".join(f"${i + 1}" for i in range(len(fields)))

    sql = f"""
        INSERT INTO public."ChatMessage" ({col_names})
        VALUES ({placeholders})
        RETURNING "ChatMessageId", "CreatedAt"
    """

    row = await insert_row(sql, *values)
    
    return dict(row) if row else None


# ========================================== #
#                   READ                     #
# ========================================== #
async def fetch_chat_messages_for_active_chat(chat_id: int) -> list[dict] | None:
    """Fetches all chatmessages for a given chat_id"""
    query = """
        SELECT "ChatMessageId", "ChatId", "CreatedAt", "MessageText", "IsUserMessage"
        FROM public."ChatMessage"
        WHERE "ChatId" = $1
        ORDER BY "ChatMessageId" ASC
    """
    query2 = """
        SELECT
            cm."ChatMessageId",
            cm."ChatId",
            cm."CreatedAt",
            cm."MessageText",
            cm."IsUserMessage"
        FROM public."ChatMessage" cm
        JOIN public."Chat" c
            ON c."ChatId" = cm."ChatId"
        WHERE
            cm."ChatId" = $1
            AND c."IsActive" = TRUE
        ORDER BY cm."ChatMessageId" ASC
    """
    rows = await fetch_all(query2, chat_id)

    return [dict(row) for row in rows] if rows else None



# ========================================== #
#                   UPDATE                   #
# ========================================== #

# ========================================== #
#                   DELETE                   #
# ========================================== #



# ========================================== #