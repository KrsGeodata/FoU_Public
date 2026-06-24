# Database Query Template Guide

This document explains the current database query template in `Backend/db/queries` and how to extend it safely.
https://magicstack.github.io/asyncpg/current/api/index.html#asyncpg.connection.Connection.fetch
---

## 1) Purpose

The query template is a thin abstraction over `asyncpg`.

It exists to keep query code consistent by centralizing:

- connection pool access (`get_pool()`)
- async connection acquire/release pattern
- error mapping to a project-level exception (`DatabaseQueryError`)

You still write raw SQL, but with less repeated boilerplate.

---

## 2) Current structure

- `db/connection.py`
  - owns pool lifecycle (`connect`, `disconnect`, `get_pool`)
- `db/queries/base.py`
  - reusable generic query helpers
- `db/queries/chats.py`
  - domain-specific query module for `Chat`
- `db/queries/__init__.py`
  - exports helper functions/modules

---

## 3) Query pipeline (end-to-end)

Example: `get_recent_chats(limit=5)` in `db/queries/chats.py`.

1. `get_recent_chats` calls `fetch_all(sql, limit)`
2. `fetch_all` calls `get_pool()`
3. helper acquires a connection: `async with pool.acquire() as conn`
4. helper executes query: `await conn.fetch(sql, *args)`
5. helper returns `list[asyncpg.Record]`
6. domain module converts rows to plain dicts: `[dict(row) for row in rows]`

If DB call fails, helper catches `asyncpg.PostgresError` and raises `DatabaseQueryError`.

---

## 4) Base helpers and when to use them

In `db/queries/base.py`:

- `fetch_all(sql, *args) -> list[asyncpg.Record]`
  - use for many rows (`SELECT ...`)
- `fetch_row(sql, *args) -> asyncpg.Record | None`
  - use when expecting first row (or no row)
- `fetch_value(sql, *args) -> Any`
  - use for first column of first row (`COUNT(*)`, scalar lookups)

---

## 5) SQL parameters (`$1`, `$2`, ...)

Use placeholders in SQL and pass values as extra arguments.

Example:

```python
rows = await fetch_all(
    'SELECT "Chatid", "ChatName" FROM public."Chat" WHERE "Casesid" = $1 LIMIT $2',
    case_id,
    limit,
)
```

Mapping:

- `$1` -> first argument (`case_id`)
- `$2` -> second argument (`limit`)

Important: `$10` means 10th argument, not value 10.

---

## 6) How to add a new query module

### Step 1: create module

Create `db/queries/<domain>.py`, e.g. `cases.py`.

### Step 2: import helpers

```python
from db.queries.base import fetch_all, fetch_row, fetch_value
```

### Step 3: add domain functions

```python
async def get_case_by_id(case_id: int) -> dict | None:
    row = await fetch_row('SELECT "Casesid", "CaseName" FROM public."Case" WHERE "Casesid" = $1', case_id)
    return dict(row) if row else None
```

### Step 4: export module (optional but recommended)

In `db/queries/__init__.py` add module import and `__all__` entry.

---

## 7) API integration pattern

`main.py` currently includes:

- `/health/db` for basic connectivity (`SELECT 1`)
- `/health/db/mock` for query-helper smoke test (`chat_count` + recent chats)

For new domains, follow the same pattern:

- call query module function
- catch `DatabaseQueryError`
- return `HTTPException(500, ...)` with useful context

---

## 8) Runtime requirements

- `db.connect()` must run during startup before queries
- `db.disconnect()` should run during shutdown
- `.env` must contain valid `SUPABASE_DB_URL`
- for Supabase pooler, include `?sslmode=require` in DSN

---

## 9) Conventions for contributors

- Keep SQL in domain query modules, not in route handlers
- Keep helpers generic in `base.py`
- Use parameterized SQL (`$1`, `$2`, ...) never string interpolation for values
- Raise/propagate `DatabaseQueryError` from helper layer

---

## 10) Known improvement candidates

- Add `execute(...)` helper when write operations are needed broadly
- Add optional lightweight logging per query helper for debugging
- Add unit/integration tests for helper behavior and error mapping

---

## 11) Quick smoke-test checklist

1. Start backend -- `python -m uvicorn main:app --reload`
2. Call `GET /health/db` either using CURL or going to `http://localhost:8000/health/db` in your browser
3. Call `GET /health/db/mock`
4. Confirm response includes `chat_count` and `recent_chats`

If these pass, the template + pool + query module wiring is working.
