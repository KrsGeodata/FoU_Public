# FIKS Integration: Implementation Plan for Min Eiendom (My Property)

## Context

The Min Eiendom (My Property) POC currently has a local PostgreSQL database with mocked property and building case data. We want to extend the architecture with mocked FIKS services that mirror KS's (Association of Norwegian Municipalities) actual APIs. The purpose is to demonstrate that Min Eiendom can connect to national infrastructure (FIKS Innsyn, FIKS Matrikkel) without having access to sandbox/production environments. The mocks should return data in formats that match FIKS's actual API specifications.

Documentation: https://developers.fiks.ks.no/tjenester/minkommune/innsyn/
Documentation: https://developers.fiks.ks.no/tjenester/minkommune/matrikkel/

## What We Mock and Why

### 1. FIKS Innsyn (Insight) — Building Case Search by Property
FIKS Innsyn has a Property Search API where you can search for messages (building cases, decisions, documents) linked to a cadastral unit. The message type `byggesak` (building case) is already defined in FIKS Innsyn and is indexed by cadastral number.

**What we mock:** A FastAPI service that exposes an endpoint returning building cases for a given cadastral unit (GNR/BNR — municipality/title number), in a format matching FIKS Innsyn's search results.

### 2. FIKS Matrikkel (Cadastre) — Property Lookup
FIKS Matrikkel offers a Cadastre Owner API that lets you look up properties a person owns, or who owns a specific property. Data is loaded nationally.

**What we mock:** Endpoints that return property data based on cadastral unit, in a format matching FIKS Matrikkel's response.

## Current Architecture

```
Frontend (Vite + HTML/JS) → Backend (Django REST) → PostgreSQL
                                                      ↓
                                                 Tables: properties, cases, documents,
                                                 neighbour_list, regulation_plans
```

Docker Compose with 4 services: db, backend (port 8002), cms (port 8001), frontend (port 5001).

Backend uses Django REST Framework with ViewSets for Property and Case.

## Proposed New Architecture

```
Frontend (Vite + HTML/JS) → Backend (Django REST) → PostgreSQL (local data)
                                    ↓
                              FiksInnsynClient → Mock FIKS Innsyn (new FastAPI service)
                              FiksMatrikkelClient → Mock FIKS Matrikkel (new FastAPI service)
```

### New Service: `fiks-mock` (FastAPI)
A separate containerized FastAPI service that mocks FIKS Innsyn and FIKS Matrikkel. This follows the same pattern as the existing cadastre mock service described in the report (the MatrikkelClient pattern).

Configurable via environment variables:
- `FIKS_INNSYN_URL` — points to mock in dev, would point to real FIKS in prod
- `FIKS_MATRIKKEL_URL` — same principle

## Issues for GitHub Backlog

### Issue 1: Create `fiks-mock` FastAPI Service
**Type:** Feature
**Description:** Create a new FastAPI application that mocks FIKS Innsyn and FIKS Matrikkel. The service should run as its own Docker container.

Endpoints to implement:
- `GET /innsyn/sok/eiendom/{matrikkelnummer}` — Returns building cases linked to a cadastral unit
- `GET /matrikkel/eiendom/{matrikkelnummer}` — Returns property info (address, owner, area, etc.)
- `GET /matrikkel/eier/{fodselsnummer}` — Returns list of properties owned by a person

Responses should follow FIKS's documented formats (see developers.fiks.ks.no).

Mock data: Use existing seed data from `seed.sql` as a starting point, but structure the responses as FIKS would.

**Acceptance Criteria:**
- [ ] FastAPI app with Dockerfile
- [ ] Added to docker-compose.dev.yml
- [ ] Endpoints return realistic mock data
- [ ] Response format documented in README

---

### Issue 2: Implement FiksInnsynClient in Backend
**Type:** Feature
**Description:** Create a client class in the Django backend that communicates with the mock FIKS Innsyn service. Follows the same pattern as the existing MatrikkelClient concept.

- Client class uses `FIKS_INNSYN_URL` from environment variable
- Method: `get_byggesaker(matrikkelnummer: str) -> list`
- New route in backend: `GET /api/fiks/innsyn/{gnr_bnr}/`
- Backend abstracts the FIKS response into a format the frontend can use

**Acceptance Criteria:**
- [ ] Client class implemented
- [ ] New URL route registered
- [ ] Frontend can fetch building cases via backend

---

### Issue 3: Implement FiksMatrikkelClient in Backend
**Type:** Feature
**Description:** Create a client class that communicates with the mock FIKS Matrikkel service.

- Client class uses `FIKS_MATRIKKEL_URL` from environment variable
- Method: `get_eiendom(matrikkelnummer: str) -> dict`
- Method: `get_eiendommer_for_eier(fodselsnummer: str) -> list`
- New route: `GET /api/fiks/matrikkel/{gnr_bnr}/`

**Acceptance Criteria:**
- [ ] Client class implemented
- [ ] New URL route registered
- [ ] Can fetch property data via FIKS mock instead of local DB

---

### Issue 4: Frontend — Display FIKS Building Cases
**Type:** Feature
**Description:** Extend the building case page to fetch and display data from the FIKS Innsyn endpoint (via backend). Display case number, title, date, type, and link to documents.

**Acceptance Criteria:**
- [ ] Building case page fetches data from `/api/fiks/innsyn/{gnr_bnr}/`
- [ ] Displays metadata for each case
- [ ] Displays associated documents (metadata + links)
