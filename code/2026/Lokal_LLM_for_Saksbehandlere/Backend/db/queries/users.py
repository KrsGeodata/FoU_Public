"""
db/queries/users.py
-------------------
Query helpers for User authentication lookups and large data retrieval.
"""

from __future__ import annotations

from typing import Any

from db.connection import get_pool
from db.queries.base import fetch_all
from classes.apidata import APIData
from classes.case import Case
from classes.user import UserData
from classes.chat import Chat
from classes.chatmessage import ChatMessage
from classes.filesinfo import FilesInfo


async def get_user_by_email(email: str) -> dict[str, Any] | None:
    """Return user row by email, or None if not found."""
    pool = get_pool()
    query = (
        'SELECT "UserId", "Name", "Email", "IsActive", "Password_hash" '
        'FROM public."User" WHERE "Email" = $1 LIMIT 1'
    )

    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, email)

    return dict(row) if row else None


async def fetch_user_cases_and_chats_by_userid(user_id: int) -> list[dict[str, Any]] | None:
    """Fetches all cases and chats for a user based on the UserId"""
    query = """
        SELECT
            c."CaseId",
            c."UserId",
            c."Title" AS "CaseTitle",
            c."Description" AS "CaseDescription",
            c."Status",
            c."CreatedAt" AS "CaseCreatedAt",
            c."IsActive" AS "CaseIsActive",

            ch."ChatId",
            ch."CaseId" AS "ChatCaseId",
            ch."UserId" AS "ChatUserId",
            ch."Title" AS "ChatTitle",
            ch."Description" AS "ChatDescription",
            ch."CreatedAt" AS "ChatCreatedAt",
            ch."IsActive" AS "ChatIsActive"

        FROM public."Case" c
        LEFT JOIN public."Chat" ch ON ch."CaseId" = c."CaseId" AND ch."IsActive" = TRUE
        WHERE c."UserId" = $1 AND c."IsActive" = TRUE

        UNION

        SELECT
            c."CaseId",
            c."UserId",
            c."Title" AS "CaseTitle",
            c."Description" AS "CaseDescription",
            c."Status",
            c."CreatedAt" AS "CaseCreatedAt",
            c."IsActive" AS "CaseIsActive",

            ch."ChatId",
            ch."CaseId" AS "ChatCaseId",
            ch."UserId" AS "ChatUserId",
            ch."Title" AS "ChatTitle",
            ch."Description" AS "ChatDescription",
            ch."CreatedAt" AS "ChatCreatedAt",
            ch."IsActive" AS "ChatIsActive"

        FROM public."Chat" ch
        LEFT JOIN public."Case" c ON c."CaseId" = ch."CaseId" AND c."IsActive" = TRUE
        WHERE ch."UserId" = $1 AND ch."IsActive" = TRUE

        ORDER BY "CaseId", "ChatId"
    """
    rows = await fetch_all(query, user_id)

    return [dict(row) for row in rows] if rows else None

# Loads a lot of data. Called once at login and populates the application. 
# Tries to catch and chats cases the user owns
# It skips duplicates and returns everything packed into the APIData object
# Sent to frontend on login
async def get_user_cases_chats_chatmessages_by_userid(user: UserData, storage_environment: str) -> APIData | None:
    """Get all cases, chats, chatmessages and files by userid where IsActive = TRUE"""
    pool = get_pool()
    query = """
        SELECT
            c."CaseId", c."UserId",
            c."Title" AS "CaseTitle", c."Description" AS "CaseDescription",
            c."Status", c."CreatedAt" AS "CaseCreatedAt", c."IsActive" AS "CaseIsActive",
            ch."ChatId", ch."CaseId" AS "ChatCaseId", ch."UserId" AS "ChatUserId",
            ch."Title" AS "ChatTitle", ch."Description" AS "ChatDescription",
            ch."CreatedAt" AS "ChatCreatedAt", ch."IsActive" AS "ChatIsActive",
            cm."ChatMessageId", cm."ChatId" AS "ChatMessageChatId",
            cm."MessageText", cm."IsUserMessage", cm."CreatedAt" AS "MessageCreatedAt",
            f."FileId", f."UserId" AS "FileUserId", f."CaseId" AS "FileCaseId",
            f."ChatId" AS "FileChatId", f."OriginalFilename", f."FileExtension",
            f."UploadedAt" AS "FileUploadedAt"
        FROM "Case" c
        LEFT JOIN "Chat" ch ON ch."CaseId" = c."CaseId" AND ch."IsActive" = TRUE
        LEFT JOIN "ChatMessage" cm ON cm."ChatId" = ch."ChatId"
        LEFT JOIN "File" f ON (f."CaseId" = c."CaseId" OR f."ChatId" = ch."ChatId")
            AND f."StorageEnvironment" = $2 AND f."IsActive" = TRUE
        WHERE c."UserId" = $1 AND c."IsActive" = TRUE

        UNION

        SELECT
            c."CaseId", c."UserId",
            c."Title" AS "CaseTitle", c."Description" AS "CaseDescription",
            c."Status", c."CreatedAt" AS "CaseCreatedAt", c."IsActive" AS "CaseIsActive",
            ch."ChatId", ch."CaseId" AS "ChatCaseId", ch."UserId" AS "ChatUserId",
            ch."Title" AS "ChatTitle", ch."Description" AS "ChatDescription",
            ch."CreatedAt" AS "ChatCreatedAt", ch."IsActive" AS "ChatIsActive",
            cm."ChatMessageId", cm."ChatId" AS "ChatMessageChatId",
            cm."MessageText", cm."IsUserMessage", cm."CreatedAt" AS "MessageCreatedAt",
            f."FileId", f."UserId" AS "FileUserId", f."CaseId" AS "FileCaseId",
            f."ChatId" AS "FileChatId", f."OriginalFilename", f."FileExtension",
            f."UploadedAt" AS "FileUploadedAt"
        FROM "Chat" ch
        LEFT JOIN "Case" c ON c."CaseId" = ch."CaseId" AND c."IsActive" = TRUE
        LEFT JOIN "ChatMessage" cm ON cm."ChatId" = ch."ChatId"
        LEFT JOIN "File" f ON (f."CaseId" = c."CaseId" OR f."ChatId" = ch."ChatId")
            AND f."StorageEnvironment" = $2 AND f."IsActive" = TRUE
        WHERE ch."UserId" = $1 AND ch."IsActive" = TRUE

        ORDER BY "CaseId", "ChatId", "ChatMessageId", "FileId"
        """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, user.UserId, storage_environment)

        cases = {}
        chats = {}
        messages = {}
        files = {}

        for row in rows:
            row = dict(row)

            if row["CaseId"] and row["CaseId"] not in cases:
                cases[row["CaseId"]] = Case(
                    CaseId=row["CaseId"], UserId=row["UserId"],
                    Title=row["CaseTitle"], Description=row["CaseDescription"],
                    Status=row["Status"], CreatedAt=row["CaseCreatedAt"],
                    IsActive=row["CaseIsActive"],
                )

            if row["ChatId"] and row["ChatId"] not in chats:
                chats[row["ChatId"]] = Chat(
                    ChatId=row["ChatId"], CaseId=row["ChatCaseId"],
                    UserId=row["ChatUserId"], Title=row["ChatTitle"],
                    Description=row["ChatDescription"], CreatedAt=row["ChatCreatedAt"],
                    IsActive=row["ChatIsActive"],
                )

            if row["ChatMessageId"] and row["ChatMessageId"] not in messages:
                messages[row["ChatMessageId"]] = ChatMessage(
                    ChatMessageId=row["ChatMessageId"], ChatId=row["ChatMessageChatId"],
                    MessageText=row["MessageText"],
                    IsUserMessage=(False if row["IsUserMessage"] is None else bool(row["IsUserMessage"])),
                    CreatedAt=row["MessageCreatedAt"],
                )

            if row["FileId"] and row["FileId"] not in files:
                files[row["FileId"]] = FilesInfo(
                    FileId=row["FileId"], UserId=row["FileUserId"],
                    CaseId=row["FileCaseId"], ChatId=row["FileChatId"],
                    OriginalFilename=row["OriginalFilename"],
                    FileExtension=row["FileExtension"], UploadedAt=row["FileUploadedAt"],
                )

        return APIData(
            User=user,
            Cases=list(cases.values()),
            Chats=list(chats.values()),
            Messages=list(messages.values()),
            Files=list(files.values()),
        )
