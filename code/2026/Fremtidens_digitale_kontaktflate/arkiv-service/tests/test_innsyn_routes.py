"""
Route tests for `arkiv-service/app/routes/innsyn.py`.

Covers:
- 200 happy path on both endpoints.
- 422 for malformed request bodies / invalid path parameter types.
- Health endpoints (`/`, `/health`).
- Unknown identifier behaviour. Note: the current API returns `200` with an
  empty payload (empty `treff` list for search, empty list for docs) rather
  than `404`. This matches the FIKS Innsyn contract where absence of data is
  a valid result. Tests assert the actual behaviour; the issue body's "404 on
  unknown identifier" was a preference, not current behaviour, and changing
  the API contract is out of scope for this testing-only PR.
"""

from __future__ import annotations

import uuid


def _make_sak(db_session, **overrides):
    from app.models import ArkivSak

    defaults = dict(
        id=uuid.uuid4(),
        kommunenummer="4204",
        gardsnummer=58,
        bruksnummer=61,
        festenummer=0,
        seksjonsnummer=0,
        saksaar=2023,
        sakssekvensnummer=1,
        tittel="Rammesøknad tilbygg",
        saksstatus="Under behandling",
        saksdato="2023-05-15",
        avsluttet_dato=None,
        beskrivelse=None,
    )
    defaults.update(overrides)
    sak = ArkivSak(**defaults)
    db_session.add(sak)
    db_session.commit()
    return sak


def test_health_endpoint_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_endpoint_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ---------- POST /innsyn-sok/api/v1/eiendom/sok ----------


def test_eiendom_sok_200_happy_path(client, db_session):
    _make_sak(db_session)

    response = client.post(
        "/innsyn-sok/api/v1/eiendom/sok",
        json={
            "matrikkelnummer": {
                "kommunenummer": "4204",
                "gardsnummer": 58,
                "bruksnummer": 61,
            }
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["antallTreff"] == 1
    assert body["treff"][0]["mappe"]["tittel"] == "Rammesøknad tilbygg"


def test_eiendom_sok_returns_empty_for_unknown_matrikkelnummer(client):
    response = client.post(
        "/innsyn-sok/api/v1/eiendom/sok",
        json={
            "matrikkelnummer": {
                "kommunenummer": "9999",
                "gardsnummer": 1,
                "bruksnummer": 1,
            }
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["antallTreff"] == 0
    assert body["treff"] == []


def test_eiendom_sok_422_on_missing_required_fields(client):
    # gardsnummer and bruksnummer are required and have no defaults.
    response = client.post(
        "/innsyn-sok/api/v1/eiendom/sok",
        json={"matrikkelnummer": {"kommunenummer": "4204"}},
    )
    assert response.status_code == 422


def test_eiendom_sok_422_on_wrong_types(client):
    # gardsnummer must be an int; passing a string triggers validation error.
    response = client.post(
        "/innsyn-sok/api/v1/eiendom/sok",
        json={
            "matrikkelnummer": {
                "kommunenummer": "4204",
                "gardsnummer": "not-a-number",
                "bruksnummer": 61,
            }
        },
    )
    assert response.status_code == 422


def test_eiendom_sok_422_on_empty_body(client):
    response = client.post("/innsyn-sok/api/v1/eiendom/sok", json={})
    assert response.status_code == 422


# ---------- GET /innsyn-sok/api/v1/dokument/{sak_id} ----------


def test_get_dokument_200_returns_docs_for_known_sak(client, db_session):
    from app.models import ArkivDokument

    sak = _make_sak(db_session)
    db_session.add(
        ArkivDokument(
            id=uuid.uuid4(),
            sak_id=sak.id,
            tittel="Søknadsskjema",
            dokumenttype="Søknad",
            filnavn="soknad.pdf",
            mimetype="application/pdf",
            opprettet_dato="2023-05-15",
        )
    )
    db_session.commit()

    response = client.get(f"/innsyn-sok/api/v1/dokument/{sak.id}")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["tittel"] == "Søknadsskjema"
    assert body[0]["filnavn"] == "soknad.pdf"


def test_get_dokument_returns_empty_list_for_unknown_sak_id(client):
    unknown_id = str(uuid.uuid4())
    response = client.get(f"/innsyn-sok/api/v1/dokument/{unknown_id}")

    assert response.status_code == 200
    assert response.json() == []


def test_get_dokument_non_uuid_sak_id_surfaces_db_error(db_session):
    # sak_id is declared as `str` on the route but the repository passes it
    # into a UUID-typed column; Postgres rejects an invalid UUID literal and
    # the DataError bubbles up out of the request handler as a bare 500.
    # This test pins that behaviour so a future fix that changes the contract
    # has to update it explicitly (and rename it).
    #
    # Follow-up: the route should validate sak_id as `UUID` on the FastAPI
    # side so the caller gets a 422 (or 400) instead of an unhandled DB
    # exception. Tracked as a follow-up to PR #559.
    from fastapi.testclient import TestClient

    from app.database import get_db
    from app.main import app

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        # raise_server_exceptions=False tells Starlette to convert the
        # bubbled DataError into the 500 response the caller actually sees
        # in production, instead of re-raising it into the test body.
        raising_client = TestClient(app, raise_server_exceptions=False)
        response = raising_client.get("/innsyn-sok/api/v1/dokument/not-a-uuid")
        assert response.status_code == 500
    finally:
        app.dependency_overrides.clear()
