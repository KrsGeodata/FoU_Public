# Query modules go here � one file per domain.
#
# Example structure when you add queries:
#   queries/cases.py   � CRUD for cases table
#   queries/users.py   � user lookups
#
# Each module imports get_pool() from db.connection and runs SQL directly.

from db.queries import chats, users, cases, chatmessages, files
from db.queries.base import (
    DatabaseQueryError,
    fetch_all,
    fetch_row,
    fetch_value,
)

__all__ = [
    "DatabaseQueryError",
    "fetch_all",
    "fetch_row",
    "fetch_value",
    "chats",
    "users",
    "cases",
    "chatmessages"
]
