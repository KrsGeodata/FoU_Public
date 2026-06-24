"""
db/queries/cases.py
-------------------
Concrete query module for Cases table operations.

Uses reusable helpers from db.queries.base.
"""
from db.queries.base import update_row, insert_row, fetch_all, fetch_row
from typing import Any
from classes import Case
import asyncpg


# ========================================== #
#                   CREATE                   #
# ========================================== #
async def insert_case(case: Case) -> dict[str, Any] | None:
    """Inserts a case into the database and returns the created object with CaseId"""

    data = case.model_dump(exclude={"CaseId"})
    data = {key: value for key, value in data.items() if value is not None and value != 0}

    if not data:
        return None

    fields = list(data.keys())
    values = list(data.values())

    # Build column names and placeholders
    col_names = ", ".join(f'"{field}"' for field in fields)
    placeholders = ", ".join(f"${i + 1}" for i in range(len(fields)))

    sql = f"""
        INSERT INTO public."Case" ({col_names})
        VALUES ({placeholders})
        RETURNING "CaseId", "CreatedAt"
    """

    row = await insert_row(sql, *values)
    
    return dict(row) if row else None


# ========================================== #
#                   READ                     #
# ========================================== #
async def fetch_case_by_id(case_id: int) -> dict[str, Any] | None:
    """Fetches a case based on the CaseId"""
    row = await fetch_row("""
                SELECT *
                FROM public."Case"
                WHERE "CaseId" = $1 AND "IsActive" = TRUE
            """, case_id)
    
    return dict(row) if row else None


async def fetch_active_cases_for_user(user_id: int) -> list[dict[str, Any]] | None:
    """Fetches all active cases for a given user"""
    rows = await fetch_all("""
                SELECT *
                FROM public."Case"
                WHERE "UserId" = $1 AND "IsActive" = TRUE
            """, user_id)
    
    return [dict(row) for row in rows] if rows else None



# ========================================== #
#                   UPDATE                   #
# ========================================== #
async def update_case_record(case: Case) -> dict[str, Any] | None:
    """Updates a case record based on the CaseId and UserId and returns the updated record"""
    data = case.model_dump(exclude={"CaseId", "UserId"})
    data = {key: value for key, value in data.items() if value is not None}

    if not data:
        return None

    fields = list(data.keys())
    values = list(data.values())

    set_clause = ", ".join(f'"{field}" = ${i + 1}' for i, field in enumerate(fields))

    sql = f"""
        UPDATE public."Case"
        SET {set_clause}
        WHERE "CaseId" = ${len(fields) + 1} AND "UserId" = ${len(fields) + 2} AND "IsActive" = TRUE
        RETURNING *
    """

    row = await update_row(sql, *values, case.CaseId, case.UserId)

    return dict(row) if row else None


# ========================================== #
#                   DELETE                   #
# ========================================== #
async def soft_delete_case_by_case_id(case_id: int) -> dict[str, Any] | None:
   """Sets the IsActive field for a Case to FALSE based on the case_id"""
   query = f"""
        UPDATE public."Case"
        SET "IsActive" = FALSE
        WHERE "CaseId" = $1 AND "IsActive" = TRUE
        RETURNING *
        """

   result = await update_row(query, case_id)
   return dict(result) if result else None


# ========================================== #