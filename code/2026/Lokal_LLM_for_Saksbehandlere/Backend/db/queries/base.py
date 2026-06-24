"""
db/queries/base.py
------------------
Reusable async query helpers for Postgres access via asyncpg.

Purpose:
- keep SQL execution flow consistent across query modules
- centralize pool acquisition and basic error handling
"""


from typing import Any
import asyncpg

from db.connection import get_pool


class DatabaseQueryError(RuntimeError):
    """Raised when a database query fails."""


async def fetch_all(sql: str, *args: Any) -> list[asyncpg.Record] | None:
    """Return all rows for a SELECT query."""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetch(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in fetch_all: {ex}") from ex


async def fetch_row(sql: str, *args: Any) -> asyncpg.Record | None:
    """Return first row of result set, or None if no row exists."""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetchrow(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in fetch_row: {ex}") from ex


async def fetch_value(sql: str, *args: Any) -> Any:
    """Return first column of first row."""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetchval(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in fetch_value: {ex}") from ex
    

async def insert_row(sql: str, *args) -> Any:
    """Insert a singular row in a table"""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetchrow(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in insert_row {ex}") from ex


async def insert_rows(sql: str, *args) -> Any:
    """Insert multiple rows in a table"""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetchmany(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in insert_rows {ex}") from ex

async def update_row(sql: str, *args) -> Any:
    """Update a single row in a table"""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetchrow(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in update_row {ex}") from ex

async def delete_row(sql: str, *args) -> Any:
    """Delete a singular row from a table"""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            return await conn.fetchrow(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in delete_row {ex}") from ex


async def execute(sql: str, *args: Any) -> None:
    """Execute a SQL statement that produces no rows (e.g. DELETE without RETURNING)."""
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            await conn.execute(sql, *args)
    except asyncpg.PostgresError as ex:
        raise DatabaseQueryError(f"Query failed in execute_statement: {ex}") from ex