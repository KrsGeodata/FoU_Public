# Shared test fixtures for all backend tests.
# pytest loads this file automatically before running any test.
# Mock clients replace real services so tests never hit the database or external APIs.

import os
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")

import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.dependencies import get_matrikkel_client, get_cms_client, get_renovasjon_client
from app.database import get_db


@pytest.fixture
def mock_db():
    return MagicMock()


@pytest.fixture
def mock_matrikkel_client():
    return AsyncMock()


@pytest.fixture
def mock_cms_client():
    return AsyncMock()


@pytest.fixture
def mock_renovasjon_client():
    return AsyncMock()


@pytest.fixture
def client(mock_db, mock_matrikkel_client, mock_cms_client, mock_renovasjon_client):
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_matrikkel_client] = lambda: mock_matrikkel_client
    app.dependency_overrides[get_cms_client] = lambda: mock_cms_client
    app.dependency_overrides[get_renovasjon_client] = lambda: mock_renovasjon_client

    with TestClient(app) as c:
        yield c

    del app.dependency_overrides[get_db]
    del app.dependency_overrides[get_matrikkel_client]
    del app.dependency_overrides[get_cms_client]
    del app.dependency_overrides[get_renovasjon_client]


@pytest.fixture
def error_client(mock_db, mock_matrikkel_client, mock_cms_client, mock_renovasjon_client):
    """TestClient that returns 500 responses instead of raising exceptions."""
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_matrikkel_client] = lambda: mock_matrikkel_client
    app.dependency_overrides[get_cms_client] = lambda: mock_cms_client
    app.dependency_overrides[get_renovasjon_client] = lambda: mock_renovasjon_client

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c

    del app.dependency_overrides[get_db]
    del app.dependency_overrides[get_matrikkel_client]
    del app.dependency_overrides[get_cms_client]
    del app.dependency_overrides[get_renovasjon_client]
