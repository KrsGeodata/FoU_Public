"""
db/queries/files.py
-------------------
Concrete query module for Files table operations.

Uses reusable helpers from db.queries.base.
"""
from typing import Any
from datetime import datetime
from db.queries.base import insert_row, fetch_row, delete_row, fetch_all, update_row
from classes import FilesInfo
import asyncpg

# ========================================== #
#                   CREATE                   #
# ========================================== #
async def insert_file(file_info: FilesInfo, storage_environment: str) -> dict[str, Any] | None:
  """Uploads the metadata for a new file"""
  if file_info is None or storage_environment is None:
    return None
  
  data = file_info.model_dump()
  data["StorageEnvironment"] = storage_environment

  data = {key: value for key, value in data.items() if value is not None and value != 0}

  if not data:
    return None


  fields = list(data.keys())
  values = list(data.values())

  # Build column names and placeholders
  col_names = ", ".join(f'"{field}"' for field in fields)
  placeholders = ", ".join(f"${i + 1}" for i in range(len(fields)))
  
  sql = f"""
      INSERT INTO public."File" ({col_names})
      VALUES ({placeholders})
      ON CONFLICT ("FileId") DO NOTHING
      RETURNING *
  """

  row = await insert_row(sql, *values)

  return dict(row) if row else None

# ========================================== #
#                   READ                     #
# ========================================== #
async def fetch_file_info_by_uuid(uuid: str, storage_environment: str) -> dict[str, Any] | None:
  """Get data related to a file based on UUID, UserId and StorageEnvironment"""
  row = await fetch_row(
    """
    SELECT *
    From public."File"
    WHERE "FileId" = $1 AND "StorageEnvironment" = $2 AND "IsActive" = TRUE
    LIMIT 1
    """, uuid, storage_environment
  )
  return dict(row) if row else None

async def fetch_file_info_by_chat_id(chat_id: int, storage_environment: str) -> list[dict] | None:
  """Returns info of all files related to a chat at the current storage_environment"""
  rows = await fetch_all(
    """
    SELECT *
    FROM public."File"
    WHERE "ChatId" = $1 AND "StorageEnvironment" = $2 AND "IsActive" = TRUE
    """, chat_id, storage_environment
  )
  return [dict(row) for row in rows] if rows else None


async def fetch_file_info_by_case_id(case_id: int, storage_environment: str) -> list[dict] | None:
  """Returns info of all files related to a case at the current storage_environment"""
  rows = await fetch_all(
    """
    SELECT *
    FROM public."File"
    WHERE "CaseId" = $1 AND "StorageEnvironment" = $2 AND "IsActive" = TRUE
    """, case_id, storage_environment
  )
  return [dict(row) for row in rows] if rows else None



# ========================================== #
#                   UPDATE                   #
# ========================================== #

# ========================================== #
#                   DELETE                   #
# ========================================== #
async def soft_delete_file_by_file_id(uuid: str, user_id: int, storage_environment: str) -> dict[str, Any] | None:
   """Sets the IsActive field for a File to FALSE based on the uuid"""
   query = f"""
        UPDATE public."File"
        SET "IsActive" = FALSE
        WHERE "FileId" = $1 
        AND "UserId" = $2 
        AND "StorageEnvironment" = $3
        AND "IsActive" = TRUE
        RETURNING *
        """

   result = await update_row(query, uuid, user_id, storage_environment)
   return dict(result) if result else None


# ========================================== #
