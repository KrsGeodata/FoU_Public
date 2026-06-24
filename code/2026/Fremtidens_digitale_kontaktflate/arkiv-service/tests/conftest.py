"""
Test fixtures for arkiv-service.

A Postgres container is started once per pytest session (inside
`pytest_configure`) and torn down at the end. We do this before collection so
that `app.database`, which reads DATABASE_URL at module import time, finds a
valid URL when any test module imports from the app.

Every test function gets a clean schema: `db_session` drops and recreates all
tables before yielding, so repository and route tests never leak state into
each other.
"""

from __future__ import annotations

import os
from typing import Generator

import pytest


_container = None


def pytest_configure(config):  # noqa: D401
    """Start the Postgres container and expose its connection URL to the app."""
    global _container
    # Local import so testcontainers isn't required at collection time if
    # someone runs `pytest --help` or similar without dev deps installed.
    from testcontainers.postgres import PostgresContainer

    _container = PostgresContainer("postgres:15-alpine")
    _container.start()
    # testcontainers returns a SQLAlchemy-style URL (postgresql+psycopg2://...),
    # which matches what the app expects.
    os.environ["DATABASE_URL"] = _container.get_connection_url()


def pytest_unconfigure(config):  # noqa: D401
    """Stop the Postgres container when the pytest session ends."""
    global _container
    if _container is not None:
        _container.stop()
        _container = None


@pytest.fixture
def db_session() -> Generator:
    """Fresh schema for every test.

    Drops and recreates all tables against the session-wide Postgres container
    so tests are independent. Yields a SQLAlchemy session.
    """
    # Importing the models module registers its tables on Base.metadata;
    # otherwise the first test to hit this fixture finds an empty metadata
    # (create_all is a no-op) and subsequent inserts crash with
    # "relation ... does not exist".
    from app import models  # noqa: F401
    from app.database import Base, SessionLocal, engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session) -> Generator:
    """FastAPI TestClient wired to the test db_session.

    We override the `get_db` dependency so route handlers see the same session
    the test is manipulating, and we do NOT enter the app's lifespan — the
    lifespan calls `seed_database()`, which would re-populate tables with
    production seed data and defeat our empty-schema invariant.
    """
    from fastapi.testclient import TestClient

    from app.database import get_db
    from app.main import app

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass  # db_session fixture handles its own close

    app.dependency_overrides[get_db] = _override_get_db
    try:
        # Note: constructing TestClient without `with` skips the app lifespan.
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
