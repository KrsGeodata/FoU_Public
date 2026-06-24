# Proposal: Arkiv-service — Mock archive microservice

## Background

Issue #430. Our byggesak data currently lives as `vedtak` arrays inside the matrikkel JSONB mock, and the documents endpoint (`GET /case/{case_id}/documents`) returns an empty list. In the real world, archive systems (Public 360, WebSak, Elements) are **separate systems from the matrikkel** — they own both cases and documents together.

This proposal extracts byggesak/vedtak/document data into a dedicated arkiv-service microservice, mirroring how municipalities actually work while following our existing matrikkel-service pattern.

## Why

- **Realistic architecture**: Municipalities use separate archive systems (Public 360, BKSAK, Elements) that are distinct from the matrikkel. Our mock should reflect this.
- **Unblock document display**: The frontend byggesak pages (#165, #166) are blocked because `get_dokumenter()` returns `[]`. This gives them real mock data.
- **Future-proof**: When we eventually integrate with Fiks Arkiv or a real archive system, we only swap the arkiv-service — the backend and frontend don't change.
- **Follows existing patterns**: Same architecture as matrikkel-service and renovasjon-service. No new concepts to learn.

## Current vs proposed architecture

### Today

```
Frontend
  → GET /property/{id}/building-cases  → backend → MatrikkelClient → matrikkel-service (vedtak from JSONB)
  → GET /case/{id}/documents           → backend → MatrikkelClient → matrikkel-service (returns [])
```

### Proposed

```
Frontend
  → GET /property/{id}/building-cases  → backend → ArkivClient → arkiv-service (NEW)
  → GET /case/{id}/documents           → backend → ArkivClient → arkiv-service (NEW)
```

## NOARK 5 archive structure

Norwegian archive systems follow the NOARK 5 hierarchical model. Our mock simplifies this but stays compatible with the concepts:

```
Arkiv                          (Archive — e.g. "Kristiansand kommune byggesaksarkiv")
 └── Arkivdel                  (Archive section — e.g. "Byggesaker 2020–")
      └── Klassifikasjonssystem (Classification — e.g. by municipality plan code)
           └── Mappe            (Case folder — e.g. "2021-14567 Utvidelse garasje")
                └── Registrering (Record/journal entry — e.g. incoming letter, outgoing vedtak)
                     └── Dokumentbeskrivelse  (Document description — metadata)
                          └── Dokumentobjekt  (Document object — the actual file)
```

### What we model

| NOARK level | Our mock | Table |
|-------------|----------|-------|
| Mappe (saksmappe) | `arkiv_saker` | One row per byggesak, JSONB with saksnummer, tittel, status, dato |
| Registrering + Dokumentbeskrivelse + Dokumentobjekt | `arkiv_dokumenter` | One row per document, JSONB with tittel, type, filformat, dato |

### Why we skip the upper levels

The upper three levels (Arkiv, Arkivdel, Klassifikasjon) serve archive *administration* — they organize how an arkivar structures and manages the archive internally. For example:

- **Arkiv**: "Kristiansand kommune sentralarkiv" — identifies which organization owns the archive
- **Arkivdel**: "Byggesaker 2020–" vs "Byggesaker 2004–2019" — splits the archive by time period or system migration. This is how Kristiansand separates their pre- and post-merger archives
- **Klassifikasjonssystem**: Organizes cases by plan code, area, or regulation — used for internal retrieval and reporting

None of these levels contain data that an end user (property owner) needs to see. When a citizen looks up their property, they want to see *cases and documents* — not which arkivdel the case was filed under.

A real integration via Fiks Arkiv would return data at the **Mappe** (case) and **Registrering** (document) level, which maps directly to our `arkiv_saker`/`arkiv_dokumenter` structure. The adapter would handle the upper-level navigation internally — the backend and frontend never need to know about it.

## What changes

### New: arkiv-service microservice

A new FastAPI service on port 8005, following the exact same structure as matrikkel-service:

```
arkiv-service/
├── Dockerfile
├── Dockerfile.arkiv-service.prod
├── arkiv-service.env
├── requirements.txt
└── app/
    ├── main.py
    ├── database.py
    ├── models.py
    ├── routes/arkiv.py
    ├── repositories/arkiv.py
    └── schema/arkiv.py
```

**Endpoints:**
- `GET /eiendom/{gnr}/{bnr}/{fnr}/{snr}/saker` — list cases for a property
- `GET /sak/{saksnummer}/dokumenter` — list documents for a case
- `GET /health` — healthcheck

### New: database tables in eiendom_db

Two new tables (no new database needed):

**`arkiv_saker`** — one row per byggesak
- `id`, `gnr`, `bnr`, `fnr`, `snr` (property link)
- `saksnummer` (e.g. "2021-14567")
- `data` JSONB (tittel, status, sakstype, dato, saksbehandler, etc.)

**`arkiv_dokumenter`** — one row per document, FK to arkiv_saker
- `id`, `sak_id` (FK)
- `data` JSONB (tittel, dokumenttype, filformat, dato)

Seed data is extracted from the existing matrikkel vedtak mock, with 2-4 mock documents added per case (soknad, tegning, vedtak, nabovarsel).

### Modified: backend

- New `ArkivClient` in `backend/app/clients/arkiv_client.py` (same pattern as MatrikkelClient)
- `byggesak.py` routes and repository switch from `matrikkel_client` to `arkiv_client`
- New env var `ARKIV_SERVICE_URL=http://arkiv-service:8005`

### Modified: matrikkel-service

- `vedtak` arrays in matrikkel seed JSONB updated to reflect what those documents actually represent in the matrikkel context
- Byggesak cases and documents are also added to the new arkiv tables (`arkiv_saker`, `arkiv_dokumenter`), matching how real municipalities store archive data separately while the matrikkel retains its own references

### Modified: Docker + CI

- arkiv-service added to `docker-compose.yml` and `docker-compose.prod.yml`
- Build and test steps added to `.github/workflows/ci.yml`

## What does NOT change

- Frontend — same endpoints, same response shapes
- Other services (renovasjon, cms, wagtail, matrikkel core) — untouched
- Database container — same PostgreSQL instance, just new tables

## Real-world context

Based on the research in issue #430:

| Aspect | Real world | Our mock |
|--------|-----------|----------|
| Archive system | Public 360, WebSak, Elements | arkiv-service |
| Separate from matrikkel? | Yes — different system, different vendor | Yes — different microservice |
| Cases + documents together? | Yes — NOARK structure | Yes — arkiv_saker + arkiv_dokumenter |
| Integration point | Fiks Arkiv (KS) / GeoIntegrasjon | HTTP REST (ArkivClient) |
| Swappable? | Depends on municipality | Yes — change ARKIV_SERVICE_URL |

## Effort estimate

This follows patterns we've done twice before (matrikkel-service, renovasjon-service). The work is:

- Database schema + seed: 2 SQL files
- arkiv-service: ~8 small Python files (copied and adapted from matrikkel-service)
- Backend changes: 3 files modified, 1 new client
- Docker/CI: 3 config files updated
- Matrikkel cleanup: 4 files removed/modified

## Risk

| Risk | Level | Mitigation |
|------|-------|------------|
| Database needs rebuild (new tables) | Low | Init scripts run automatically on fresh `docker compose up` |
| Frontend breaks | Low | Response shapes stay the same |
| Merge conflicts with other sprint 3 work | Medium | Coordinate with frontend team on timing |
