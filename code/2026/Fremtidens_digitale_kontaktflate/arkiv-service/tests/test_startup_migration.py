"""
Regression test for commit 181ec2b.

On 2026-04-21 we shipped `fix(arkiv-service): migrate avsluttet_dato column on
startup` because the production database had an `arkiv_saker` table that
pre-dated the `avsluttet_dato` column addition, and the app crashed at startup
when seeding tried to write rows with that field. The fix added a tiny
runtime migration inside `seed.py::_migrate_schema` that detects the missing
column and adds it with `ALTER TABLE`.

This test simulates the pre-migration state on a clean Postgres instance and
asserts that (a) `seed_database()` does not raise and (b) the column exists
after the call. If someone deletes or breaks `_migrate_schema`, this test
catches it.
"""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import text


def _snapshot_seed_rows():
    """Capture the seed data as plain attribute dicts so we can rebuild
    fresh ORM instances per test."""
    from app import seed as seed_module
    from app.models import ArkivSak, ArkivDokument

    sak_cols = [c.name for c in ArkivSak.__table__.columns]
    dok_cols = [c.name for c in ArkivDokument.__table__.columns]

    sak_rows = [
        {col: getattr(s, col) for col in sak_cols} for s in seed_module.SEED_SAKER
    ]
    dok_rows = [
        {col: getattr(d, col) for col in dok_cols} for d in seed_module.SEED_DOKUMENTER
    ]
    return sak_rows, dok_rows


_SEED_SNAPSHOT = None


@pytest.fixture(autouse=True)
def _fresh_seed_instances():
    """Replace `seed.SEED_SAKER` / `seed.SEED_DOKUMENTER` with freshly
    constructed ORM instances before each test, and dispose the engine
    connection pool afterwards.

    Why we need this:
    - `seed.py` builds SEED_* lists once at import time. After any test that
      commits them, SQLAlchemy's `expire_on_commit=True` wipes those
      instances' attribute values. A later test that drops the tables and
      re-runs `seed_database()` would re-add the same instances, but their
      attributes are now NULL, triggering `NotNullViolation`.
    - `engine.dispose()` between tests makes sure no stale pooled
      connections sit on aborted transactions or table locks from the
      previous test, which was causing subsequent `drop_all` calls to hang.
    """
    global _SEED_SNAPSHOT
    from app import seed as seed_module
    from app.database import engine
    from app.models import ArkivSak, ArkivDokument

    # Take the snapshot exactly once per session, from the pristine module
    # instances before any test has had a chance to commit them.
    if _SEED_SNAPSHOT is None:
        _SEED_SNAPSHOT = _snapshot_seed_rows()

    sak_rows, dok_rows = _SEED_SNAPSHOT
    seed_module.SEED_SAKER = [ArkivSak(**row) for row in sak_rows]
    seed_module.SEED_DOKUMENTER = [ArkivDokument(**row) for row in dok_rows]

    try:
        yield
    finally:
        engine.dispose()


def test_seed_database_adds_avsluttet_dato_to_legacy_table():
    # Build the pre-avsluttet_dato schema by hand. We deliberately omit the
    # avsluttet_dato column to mimic a database snapshot from before the fix.
    from app.database import Base, engine
    from app.seed import seed_database

    Base.metadata.drop_all(bind=engine)

    with engine.connect() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE arkiv_saker (
                    id UUID PRIMARY KEY,
                    kommunenummer VARCHAR(4) NOT NULL,
                    gardsnummer INTEGER NOT NULL,
                    bruksnummer INTEGER NOT NULL,
                    festenummer INTEGER NOT NULL DEFAULT 0,
                    seksjonsnummer INTEGER NOT NULL DEFAULT 0,
                    saksaar INTEGER NOT NULL,
                    sakssekvensnummer INTEGER NOT NULL,
                    tittel VARCHAR(500) NOT NULL,
                    saksstatus VARCHAR(100) NOT NULL,
                    saksdato VARCHAR(10) NOT NULL,
                    beskrivelse TEXT
                )
                """
            )
        )
        conn.commit()

        # Sanity check: the column really is absent before we run the migration.
        before = conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'arkiv_saker' AND column_name = 'avsluttet_dato'"
            )
        ).fetchone()
        assert before is None, "pre-migration table should not have avsluttet_dato"

    # Drop the legacy table and let seed_database() recreate it cleanly OR
    # keep it and force _migrate_schema to do its job. We want the latter,
    # so leave the legacy table in place. seed_database calls create_all which
    # is a no-op for an existing table, then _migrate_schema adds the column.
    seed_database()

    # Assert the column exists now.
    with engine.connect() as conn:
        after = conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'arkiv_saker' AND column_name = 'avsluttet_dato'"
            )
        ).fetchone()
        assert after is not None, "seed_database must add avsluttet_dato to legacy tables"


def test_seed_database_is_idempotent():
    """Calling seed_database twice must not raise or duplicate rows."""
    from app.database import Base, SessionLocal, engine
    from app.models import ArkivSak
    from app.seed import seed_database

    Base.metadata.drop_all(bind=engine)

    seed_database()
    with SessionLocal() as s:
        first_count = s.query(ArkivSak).count()

    # Second call: should be a no-op for data (skips seeding because rows exist),
    # and the migration check should find the column already present.
    seed_database()
    with SessionLocal() as s:
        second_count = s.query(ArkivSak).count()

    assert first_count == second_count
    assert first_count > 0, "fixture data should have been seeded once"


def test_migration_does_not_create_duplicate_column_on_already_migrated_table():
    """If the table already has avsluttet_dato, _migrate_schema must not raise."""
    from app.database import Base, engine
    from app.seed import _migrate_schema

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)  # models already include the column

    # Calling _migrate_schema twice should be a no-op both times.
    _migrate_schema()
    _migrate_schema()

    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT COUNT(*) FROM information_schema.columns "
                "WHERE table_name = 'arkiv_saker' AND column_name = 'avsluttet_dato'"
            )
        ).scalar()
    assert result == 1, "avsluttet_dato must exist exactly once"
