from contextlib import contextmanager
from fastapi import HTTPException
import psycopg2
from psycopg2.extras import RealDictCursor
from database.config import get_required_env


@contextmanager
def get_db():
    """Context manager for database connections — closes automatically."""
    conn = None
    try:
        conn = psycopg2.connect(
            host=get_required_env("POSTGRES_HOST"),
            database=get_required_env("POSTGRES_DB"),
            user=get_required_env("POSTGRES_USER"),
            password=get_required_env("POSTGRES_PASSWORD"),
            port=get_required_env("POSTGRES_PORT"),
        )
        yield conn
        conn.commit()
    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        if conn:
            conn.close()


def dict_cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)
