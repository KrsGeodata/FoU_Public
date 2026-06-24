# FIKS Integration: Implementation Plan for Min Eiendom (My Property)

## Context

The Min Eiendom (My Property) POC currently has a microservice architecture with a FastAPI backend orchestrator, a `matrikkel-service` (mocking Kartverket's Matrikkel), and a shared PostgreSQL database. Building case data (vedtak) currently lives inside the matrikkel as JSONB, but in the real world, full building cases with documents come from the municipal archive system, exposed via KS FIKS Innsyn.

We want to extend the architecture with a FIKS Innsyn mock service that mirrors KS's actual API contract. The core architectural principle is that Min Eiendom is data-source agnostic — the abstraction layers (client, repository, schema) allow the system to connect to any data source. FIKS is the preferred integration path as it is already designed for national use, but the architecture does not depend on it. The mock uses POST-based endpoints matching the real FIKS API specification so that connecting to FIKS in production only requires swapping the URL and adding Maskinporten authentication — no changes to repositories, schemas, or frontend.

Additionally, we add FIKS Matrikkel Eier endpoints (owner/property lookup by fodselsnummer and matrikkelnummer) to the existing `matrikkel-service`, since it already holds the same national matrikkel data that the real FIKS Matrikkel Eier queries.

Documentation: https://developers.fiks.ks.no/tjenester/minkommune/innsyn/
Documentation: https://developers.fiks.ks.no/tjenester/minkommune/matrikkel/

## What We Mock and Why

### 1. FIKS Innsyn — Archive Cases and Documents (NEW SERVICE)
FIKS Innsyn provides search across municipal archive messages (byggesaker, vedtak, documents) indexed by cadastral unit (matrikkelnummer). In the real world, this data comes from the municipality's archive system (e.g., Public 360, ePhorte) via FIKS Arkiv, and is searchable through FIKS Innsyn.

**What we mock:** A new `arkiv-service` FastAPI service that exposes POST-based FIKS Innsyn endpoints returning byggesaker and documents for a given matrikkelnummer. Own tables in the shared PostgreSQL database (`arkiv_saker`, `arkiv_dokumenter`). Response format matches the real FIKS Innsyn `mappe.v1` contract.

**What stays in matrikkel-service:** Vedtak remain in the matrikkel JSONB data — these are administrative decisions recorded in the national cadastre (Kartverket), not archive cases.

### 2. FIKS Matrikkel Eier — Property/Owner Lookup (EXISTING SERVICE)
FIKS Matrikkel Eier provides owner lookup (find properties by fodselsnummer) and owner lookup (find owners by matrikkelnummer). The underlying data is the national matrikkel — the same data our `matrikkel-service` already holds.

**What we mock:** New POST-based FIKS-style routes added to the existing `matrikkel-service`. No new service needed — it already has the data. The backend gets a `FiksMatrikkelClient` that speaks the FIKS contract but points at `matrikkel-service`.

## Current Architecture

```
Frontend (Vite + React/TS)
  |
  └→ Backend (FastAPI, port 8000) ─→ orchestrates all service calls
       |
       ├→ MatrikkelClient      → matrikkel-service (FastAPI, port 8001)
       |                          └→ PostgreSQL (matrikkel_eiendommer table, JSONB)
       ├→ CmsClient            → cms-service (port 8003) → wagtail-cms (port 8002)
       └→ RenovasjonClient     → renovasjon-service (port 8004)
```

Docker Compose with 6 services: database, frontend, backend, matrikkel-service, cms-service, wagtail-cms, renovasjon-service.

Backend uses FastAPI with APIRouter, httpx.AsyncClient, and dependency injection via `Depends()`.

## Proposed New Architecture

```
Frontend (Vite + React/TS)
  |
  └→ Backend (FastAPI orchestrator)
       |
       ├→ MatrikkelClient         → matrikkel-service    (existing, unchanged)
       |    • property data, vedtak, bygg, eiere, naboer, avgifter
       |
       ├→ FiksMatrikkelClient     → matrikkel-service    (new FIKS-style POST routes)
       |    • POST finn-eiendommer (by fodselsnummer → list of matrikkelnummer)
       |    • POST finn-eiere (by matrikkelnummer → list of owners)
       |
       ├→ FiksInnsynClient        → arkiv-service        (NEW service)
       |    • POST byggesak search (by matrikkelnummer)
       |    • GET documents for a case
       |
       ├→ CmsClient               → cms-service          (existing, unchanged)
       └→ RenovasjonClient        → renovasjon-service   (existing, unchanged)
```

### Abstraction Strategy

The system uses three abstraction layers to ensure production-readiness:

1. **Client layer** (`backend/app/clients/`) — HTTP clients that speak the external API contract (FIKS POST endpoints). Configured via environment variables (`FIKS_INNSYN_URL`, `FIKS_MATRIKKEL_URL`). In production: swap URL + add Maskinporten JWT auth header.

2. **Repository layer** (`backend/app/repositories/`) — Translates external response formats into the internal domain model. Shields the frontend from API contract changes.

3. **Schema layer** (`backend/app/schema/`) — Pydantic models defining the internal API contract between backend and frontend. Stable regardless of which external service provides the data.

### Environment Variables

| Variable | Dev (mock) | Production |
|----------|-----------|------------|
| `FIKS_INNSYN_URL` | `http://arkiv-service:8005` | `https://api.fiks.ks.no` (or other archive source) |
| `FIKS_MATRIKKEL_URL` | `http://matrikkel-service:8001` | `https://api.fiks.ks.no` |
| `MATRIKKEL_SERVICE_URL` | `http://matrikkel-service:8001` | Kartverket API URL |

### Remove Artificial Serial IDs from Public API

The database table `matrikkel_eiendommer` already uses `PRIMARY KEY (gnr, bnr, fnr, snr)` — the real-world composite cadastral key. However, the table also has a serial `id` column, and this artificial ID has leaked into the entire API surface. The backend auth repository already returns gnr, bnr, fnr, snr alongside the serial ID, and personnummer is already used for login and property lookup (`get_properties_by_personnr`). But the frontend only picks up `id` and ignores the cadastral numbers.

In the real world, there is no central serial ID for properties. Properties are identified by matrikkelnummer (kommunenummer + gardsnummer + bruksnummer + festenummer + seksjonsnummer). For the system to work in production, the serial ID must be removed from the public API surface entirely. Migration approach:

1. Update backend routes to accept matrikkelnummer instead of serial ID (`/property/{gnr}/{bnr}/{fnr}/{snr}/buildings` instead of `/property/{id}/buildings`)
2. Update backend clients (MatrikkelClient) to use cadastral key methods instead of ID-based methods
3. Frontend switches from `selectedPropertyId: number` to matrikkelnummer (the data is already in the auth response, just unused)
4. Remove serial ID from API responses — the `id` field should not appear in any public endpoint
5. The serial `id` column can remain in the database for internal joins if needed, but nothing outside the database should reference it

String format used in URLs: `"{kommunenr}-{gnr}/{bnr}/{fnr}/{snr}"` (e.g., `"4204-58/61/0/0"`)

Structured format used in FIKS POST bodies:
```json
{
  "kommunenummer": "4204",
  "gardsnummer": 58,
  "bruksnummer": 61,
  "festenummer": 0,
  "seksjonsnummer": 0
}
```

## Issues for GitHub Backlog

### Issue 1: Create `arkiv-service` FastAPI Service (FIKS Innsyn mock)
**Type:** Feature
**Description:** Create a new FastAPI service that mocks FIKS Innsyn — the archive/case search API. This service handles byggesaker (building cases) and documents, which in the real world come from the municipal archive system via FIKS.

**Database tables** (in shared PostgreSQL):
- `arkiv_saker` — building cases with matrikkelnummer reference, title, status, dates, parties
- `arkiv_dokumenter` — documents linked to a case (metadata + mock file references)

**Endpoints to implement (matching real FIKS Innsyn contract):**
- `POST /innsyn-sok/api/v1/eiendom/sok` — Search byggesaker by matrikkelnummer. Request body includes matrikkelnummer object and `akseptertMeldingVersjon`. Returns paginated results with `treff` array.
- `GET /innsyn-sok/api/v1/dokument/{dokumentId}` — Get document metadata for a specific document.

**Response format** should follow FIKS Innsyn `mappe.v1` structure:
```json
{
  "antallTreff": 2,
  "treff": [
    {
      "meldingId": "uuid",
      "meldingType": "byggesak",
      "versjon": "byggesakV1",
      "mappe": {
        "saksnummer": { "saksaar": 2023, "sakssekvensnummer": 1234 },
        "tittel": "Rammesoeknad - tilbygg",
        "saksstatus": "Under behandling",
        "saksdato": "2023-05-15",
        "matrikkelnummer": [
          { "kommunenummer": "4204", "gardsnummer": 58, "bruksnummer": 61, "festenummer": 0, "seksjonsnummer": 0 }
        ]
      }
    }
  ]
}
```

**Seed data:** Create realistic mock byggesaker linked to the existing matrikkel seed properties (GNR 58/BNR 61 and GNR 37/BNR 119) with sample documents.

**Acceptance Criteria:**
- [ ] FastAPI app with Dockerfile
- [ ] Added to docker-compose.yml on port 8005
- [ ] Database migration creates `arkiv_saker` and `arkiv_dokumenter` tables
- [ ] Seed data with realistic byggesaker linked to existing properties
- [ ] POST endpoints match FIKS Innsyn request/response contract
- [ ] Health check endpoint
- [ ] README documenting endpoints and response format

---

### Issue 2: Add FIKS Matrikkel Eier Routes to matrikkel-service
**Type:** Feature
**Description:** Add POST-based FIKS Matrikkel Eier endpoints to the existing `matrikkel-service`. These endpoints provide owner-property lookup using fodselsnummer and matrikkelnummer, matching the real FIKS Matrikkel Eier API contract.

**Note:** Personnummer already exists in the JSONB eiere data (`PERSONNR` field in `eierforhold`). The backend auth flow already uses it for login and property lookup. No new data needs to be added.

**Endpoints to implement:**
- `POST /matrikkel-eier/api/v1/{fiksOrgId}/finn-eiendommer` — Find properties owned by a person. Request body: `{"type": "FYSISK_PERSON", "verdi": "12345678901"}`. Returns list of matrikkelnummer objects with address.
- `POST /matrikkel-eier/api/v1/{fiksOrgId}/finn-eiere` — Find owners of a property. Request body: array of matrikkelnummer objects. Returns owner info per property.

**Note:** `fiksOrgId` is a UUID identifying the municipality in FIKS. Use a static mock value for the POC.

**Acceptance Criteria:**
- [ ] POST endpoints match FIKS Matrikkel Eier request/response contract
- [ ] Seed data includes fake fodselsnummer for existing mock owners
- [ ] Existing GET-based routes remain unchanged (no breaking changes)
- [ ] fiksOrgId accepted but not validated (any UUID works in mock)

---

### Issue 3: Implement FiksInnsynClient in Backend
**Type:** Feature
**Depends on:** Issue 1
**Description:** Create a client class in the backend that communicates with the FIKS Innsyn mock (or real FIKS in production). Follows the same async httpx pattern as the existing MatrikkelClient.

- Client class uses `FIKS_INNSYN_URL` from environment variable
- Method: `async def sok_byggesaker(matrikkelnummer: dict) -> list` — POST-based search
- Method: `async def get_dokument(dokument_id: str) -> dict` — document metadata

**Backend integration:**
- New repository: `ByggesakRepository` rewired to use `FiksInnsynClient` instead of `MatrikkelClient`
- New route: `POST /api/byggesaker/sok` (backend's own API for the frontend)
- Backend transforms FIKS `mappe.v1` response → internal `BuildingCaseResponse` schema

**Acceptance Criteria:**
- [ ] Client class following MatrikkelClient pattern (httpx.AsyncClient, dependency injection)
- [ ] Repository transforms FIKS response into internal domain model
- [ ] New backend route registered and functional
- [ ] Error handling for service unavailability

---

### Issue 4: Implement FiksMatrikkelClient in Backend
**Type:** Feature
**Depends on:** Issue 2
**Description:** Create a client class that communicates with the FIKS Matrikkel Eier endpoints on matrikkel-service (or real FIKS in production).

- Client class uses `FIKS_MATRIKKEL_URL` from environment variable
- Method: `async def finn_eiendommer(fodselsnummer: str) -> list` — properties by person
- Method: `async def finn_eiere(matrikkelnummer: dict) -> list` — owners by property

**Backend integration:**
- New route: `POST /api/eiendommer/sok` — frontend calls this to get property list for logged-in user
- Repository transforms FIKS response → internal `PropertyInfoResponse` schema

**Acceptance Criteria:**
- [ ] Client class following MatrikkelClient pattern
- [ ] Backend route for property lookup by fodselsnummer
- [ ] Response includes matrikkelnummer that frontend uses for subsequent lookups

---

### Issue 5: Remove Serial ID from Public API — Use Matrikkelnummer Throughout
**Type:** Refactor
**Depends on:** Issues 3 and 4
**Description:** Remove the artificial serial `id` from all public API surfaces. The system should use matrikkelnummer (gnr/bnr/fnr/snr) as the sole property identifier, matching real-world infrastructure.

The backend auth response already returns gnr, bnr, fnr, snr — the frontend just ignores them and uses `id` instead. This issue fixes that disconnect end-to-end.

**Backend changes:**
- Update all `/property/{id}/...` routes to use cadastral key: `/property/{gnr}/{bnr}/{fnr}/{snr}/...` (buildings, neighbors, municipal-fees, renovasjon, etc.)
- Update MatrikkelClient methods that use serial ID (`get_eiendom_by_id`, `get_byggesaker(property_id)`) to use cadastral key
- Remove `id` field from API responses (auth/properties, property info, etc.)
- `/map/{id}` → `/map/{gnr}/{bnr}/{fnr}/{snr}`

**Frontend changes:**
- `selectedPropertyId: number` → `selectedMatrikkelnummer` (structured object or string)
- `PropertyOption` type: `{ id, label }` → `{ gnr, bnr, fnr, snr, label }`
- All API calls switch from `/property/{id}/...` to matrikkelnummer-based routes
- `ByggesakPage` fetches from new FIKS Innsyn route using matrikkelnummer
- localStorage key updated from serial ID to matrikkelnummer string

**Acceptance Criteria:**
- [ ] No serial `id` appears in any public API response
- [ ] All property-scoped API calls use matrikkelnummer
- [ ] Frontend property selection and caching works with matrikkelnummer
- [ ] ByggesakPage displays archive cases from arkiv-service
- [ ] All existing pages functional with the new identifier

---

### Issue 6: Migrate Byggesak Data from matrikkel-service to arkiv-service
**Type:** Chore
**Depends on:** Issues 1, 3, 5 verified working
**Description:** Once the FIKS Innsyn flow is working end-to-end, clean up the old byggesak routes from the backend that pointed at matrikkel-service. The vedtak data stays in matrikkel-service (it belongs in the matrikkel), but the backend's byggesak routes now exclusively use FiksInnsynClient.

**Changes:**
- Remove `get_byggesaker()` and `get_case_documents()` from `MatrikkelClient`
- Remove old `/property/{id}/building-cases` route from backend (replaced by matrikkelnummer-based route in Issue 5)
- Verify no remaining serial ID references for byggesaker anywhere in the stack

**Acceptance Criteria:**
- [ ] No byggesak data flows through MatrikkelClient
- [ ] Old serial ID-based byggesak routes removed
- [ ] All byggesak data comes from FiksInnsynClient → arkiv-service
- [ ] Vedtak still visible in matrikkel property details (unchanged)

## Implementation Order and Dependencies

```
Issue 1 (arkiv-service)        ──→  Issue 3 (FiksInnsynClient)    ──→  Issue 5 (frontend)  ──→  Issue 6 (cleanup)
Issue 2 (matrikkel FIKS routes)──→  Issue 4 (FiksMatrikkelClient) ──↗
```

Issues 1 and 2 can be worked in parallel (no dependencies).
Issues 3 and 4 can be worked in parallel after their respective dependencies.
Issue 5 depends on both 3 and 4.
Issue 6 is cleanup after everything works.
