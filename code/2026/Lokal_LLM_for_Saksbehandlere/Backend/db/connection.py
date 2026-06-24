"""
db/connection.py
----------------
Manages the asyncpg connection pool to Supabase Postgres.

The pool is created once on app startup and shared across all requests.
All queries should use get_pool() to acquire a connection.
"""

import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

# Module-level pool instance — initialized on startup via connect()
_pool: asyncpg.Pool | None = None


async def connect() -> None:
    """Create the connection pool. Called once on app startup."""
    global _pool
    _pool = await asyncpg.create_pool(
        dsn=os.getenv("SUPABASE_DB_URL"),
        min_size=1,                             # keep 1 connection warm
        max_size=5,                             # scale up to 5 under load
        max_inactive_connection_lifetime=30.0,  # release idle connections
        command_timeout=60.0                    # timeout for hung queries
    )
    print("Database pool connected")


async def disconnect() -> None:
    """Close the connection pool. Called on app shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        print("Database pool disconnected")


def get_pool() -> asyncpg.Pool:
    """Return the active connection pool. Raises if not yet initialized."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialized. Was connect() called?")
    return _pool
