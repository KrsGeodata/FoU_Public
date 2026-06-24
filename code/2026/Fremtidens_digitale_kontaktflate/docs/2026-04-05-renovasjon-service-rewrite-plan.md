# Renovasjon-Service Rewrite: Technical Implementation Plan

Goal: Rewrite `renovasjon-service/` to follow the same architectural pattern as `matrikkel-service/` — layered `app/` package with `routes/`, `repositories/`, `schema/`, explicit FastAPI app module, externalized config, and a consistent Dockerfile naming convention.

**Cross-system verification (2026-04-05):** This plan was verified against the rest of the repo before publication. Confirmed findings:
- Only `backend/app/clients/renovasjon_client.py` consumes `/hentedager`. Frontend, cms-service, and wagtail-cms all go through the backend. No direct callers of port 8004 outside backend.
- `docker-compose.prod.yml` pulls a pre-built image from GHCR and has **no `build:` directive** for renovasjon-service — so the Dockerfile rename only affects `docker-compose.yml` (dev). `.github/workflows/ci.yml` already references `Dockerfile.renovasjon-service.prod` (unchanged by this rewrite) and its test step doesn't invoke `uvicorn main:app` — so CI needs **no edits**. See Sub-issue 8.4.
- `renovasjon_norge.json` is **not loaded at runtime**. Only referenced in a comment in `kommune_map.py`. Keep it as a reference file; no code changes needed.
- Only `providers/norkart.py` and `providers/oslo.py` call `kartverket.lookup_adresse`. `stavanger.py`, `avfallsor.py`, and `bir.py` do **not** — they have their own address APIs or are stubs. Sub-issues 4.4 and 4.5 were corrected accordingly.
- `providers/stavanger.py` is the **only** consumer of `beautifulsoup4` in the entire repo.
- `Dockerfile.renovasjon-service.prod` is a **multi-stage build** with `CMD uvicorn main:app --workers 2` (no `--reload`). Sub-issue 8.2 updated with the exact current contents.
- `scripts/find_missing_kommuner.py` uses `from kommune_map import _MAP` and the `requests` library. Sub-issue 10.2 updated to reflect this.
- Verified pinned versions from `backend/requirements.txt` + `backend/.venv/.../site-packages/`: `fastapi==0.128.0`, `uvicorn[standard]==0.40.0`, `httpx==0.28.1`, `pydantic==2.12.5`, `python-dotenv==1.2.1`. `beautifulsoup4` is unpinned everywhere — capture from the running container before committing.

Unlike `matrikkel-service`, `renovasjon-service` has **no database** (it is a stateless aggregator that calls external municipal APIs). So `database.py`, `models.py`, and SQLAlchemy dependencies are intentionally omitted. The `repositories/` layer is kept because it is the idiomatic place for the provider-dispatch logic that currently lives in `renovasjon_api.py`.

Current layout (flat, 11 files at the root):

```
renovasjon-service/
  main.py
  renovasjon_api.py
  kartverket.py
  kommune_map.py
  renovasjon_norge.json
  providers/
    __init__.py
    base.py
    norkart.py
    oslo.py
    stavanger.py
    avfallsor.py
    bir.py
  scripts/find_missing_kommuner.py
  Dockerfile
  Dockerfile.renovasjon-service.prod
  requirements.txt
  requirements-dev.txt
```

Target layout (matches `matrikkel-service/app/` layout):

```
renovasjon-service/
  app/
    __init__.py
    main.py                      # FastAPI app, router registration, /health
    config.py                    # Env loading, constants (CORS, kommune map path)
    clients/
      __init__.py
      kartverket.py              # External: Kartverket/Geonorge address lookup
    routes/
      __init__.py
      renovasjon.py              # GET /hentedager
    repositories/
      __init__.py
      renovasjon.py              # RenovasjonRepository — provider dispatch + orchestration
    providers/
      __init__.py
      base.py                    # Provider ABC
      norkart.py
      oslo.py
      stavanger.py
      avfallsor.py
      bir.py
    schema/
      __init__.py
      renovasjon.py              # HentedagerResponse, Hentedag, ErrorResponse
    kommune_map.py               # Static data: kommunenr → provider name
  scripts/
    find_missing_kommuner.py
  Dockerfile.renovasjon-service
  Dockerfile.renovasjon-service.prod
  renovasjon-service.env
  requirements.txt
  requirements-dev.txt
  renovasjon_norge.json
```

Key structural rules (matching `matrikkel-service`):
- Routes are thin — they only validate input, call a repository, handle HTTP errors, return a Pydantic model.
- All response shapes live in `app/schema/` as Pydantic models (no dict returns from routes).
- Business logic (address resolution + provider routing + normalization) lives in `app/repositories/`.
- External HTTP clients (Kartverket) live in `app/clients/` — mirrors `backend/app/clients/`.
- Providers remain their own layer (`app/providers/`) because the repository dispatches to them; they are not called directly from routes.
- `config.py` centralizes `os.getenv` lookups. No module-level `os.getenv` calls in providers/clients.
- Dockerfile is renamed `Dockerfile.renovasjon-service` to match `Dockerfile.matrikkel-service` naming.
- Env file is added at `renovasjon-service/renovasjon-service.env` and wired via `env_file:` in compose.

---

## Issue 1: Scaffold new `app/` package structure

### Sub-issue 1.1: Create directory skeleton and `__init__.py` files

Create empty files so the package is importable:

```
renovasjon-service/app/__init__.py
renovasjon-service/app/clients/__init__.py
renovasjon-service/app/routes/__init__.py
renovasjon-service/app/repositories/__init__.py
renovasjon-service/app/providers/__init__.py
renovasjon-service/app/schema/__init__.py
```

**Acceptance:** `python -c "import app"` succeeds from `renovasjon-service/`.

---

### Sub-issue 1.2: Create `app/config.py`

Centralize environment variables and constants that are currently scattered across `main.py` and `providers/norkart.py`:

```python
# renovasjon-service/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Norkart proxy
NORKART_APP_KEY = os.getenv(
    "NORKART_APP_KEY", "AE13DEEC-804F-4615-A74E-B4FAC11F0A30"
)
NORKART_PROXY = "https://norkartrenovasjon.azurewebsites.net/proxyserver.ashx"
NORKART_API_BASE = "https://komteksky.norkart.no/MinRenovasjon.Api/api"

# Kartverket
KARTVERKET_SOK_URL = "https://ws.geonorge.no/adresser/v1/sok"

# Oslo
OSLO_URL = "https://www.oslo.kommune.no/actions/snap-lib-waste-complaint/search-by-address"

# HTTP timeout (seconds) for all outbound calls
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "10"))

# Error code → HTTP status mapping (was inline in main.py)
ERROR_STATUS_MAP: dict[str, int] = {
    "address_not_found": 404,
    "unsupported_municipality": 422,
}
```

Also create `renovasjon-service/renovasjon-service.env`:

```
CORS_ORIGINS=http://localhost:5001,http://127.0.0.1:5001,http://localhost:8000
NORKART_APP_KEY=AE13DEEC-804F-4615-A74E-B4FAC11F0A30
HTTP_TIMEOUT=10
```

Add `python-dotenv` to `requirements.txt` (see Issue 5).

**Acceptance:** `from app.config import CORS_ORIGINS, NORKART_APP_KEY` works. Env file loads on service start.

---

### Sub-issue 1.3: Move `kommune_map.py` → `app/kommune_map.py`

This is static data (438 lines, a single `_MAP` dict). It is neither a schema nor a repository — leave it as a module next to `app/`. Just relocate it:

- Move `renovasjon-service/kommune_map.py` → `renovasjon-service/app/kommune_map.py`
- No code changes inside the file.
- Update imports at all call sites (covered in later sub-issues).

**Acceptance:** `from app.kommune_map import get_provider_for_kommune` works.

---

## Issue 2: Port `kartverket.py` into `app/clients/kartverket.py`

### Sub-issue 2.1: Move and refactor Kartverket client

Move `renovasjon-service/kartverket.py` → `renovasjon-service/app/clients/kartverket.py`.

Two refactor changes:
1. Replace hard-coded `SOK_URL = "https://ws.geonorge.no/adresser/v1/sok"` with `from app.config import KARTVERKET_SOK_URL`.
2. Replace hard-coded `timeout=10` in `_search()` with `from app.config import HTTP_TIMEOUT`.

Signature and public API unchanged:
```python
async def lookup_adresse(adresse: str) -> dict: ...
```

**Acceptance:** `from app.clients.kartverket import lookup_adresse` works and returns the same shape as before (`kommunenummer, kommunenavn, adressenavn, husnummer, postnummer, poststed, raw`).

---

## Issue 3: Create Pydantic schemas

### Sub-issue 3.1: Create `app/schema/renovasjon.py`

Today the service returns raw dicts from `get_hentedager()`. Match the `matrikkel-service` pattern where every response is a typed Pydantic model.

```python
# renovasjon-service/app/schema/renovasjon.py
from pydantic import BaseModel


class Hentedag(BaseModel):
    """A single fraction's collection schedule."""
    fraksjon: str
    neste_henting: str | None = None
    kommende_datoer: list[str] = []


class HentedagerResponse(BaseModel):
    """Successful waste collection lookup response."""
    adresse: str
    kommune: str | None = None
    kommunenummer: str | None = None
    provider: str | None = None
    hentedager: list[Hentedag] = []


class RenovasjonErrorResponse(BaseModel):
    """Error response used for address_not_found / unsupported_municipality."""
    adresse: str
    kommune: str | None = None
    kommunenummer: str | None = None
    provider: str | None = None
    error: str
    message: str | None = None
```

**Acceptance:** Schemas serialize matching the current JSON shape produced by `providers/*.py`. Existing `backend/app/repositories/renovasjon.py` (lines 46–58) deserializes unchanged — field names are identical (`adresse`, `kommune`, `kommunenummer`, `provider`, `hentedager[].fraksjon/neste_henting/kommende_datoer`).

---

## Issue 4: Move and refactor providers into `app/providers/`

The provider pattern (ABC + subclasses) is already good — it just needs to live under `app/providers/`, import from `app.config` and `app.clients.kartverket` instead of top-level modules, and have any stray `os.getenv()` calls removed.

### Sub-issue 4.1: Move `providers/base.py` → `app/providers/base.py`

No content changes. Reconfirm the contract in the docstring — providers return a plain dict that the repository wraps into `HentedagerResponse` / `RenovasjonErrorResponse`.

**Acceptance:** `from app.providers.base import Provider` works.

---

### Sub-issue 4.2: Port `NorkartProvider` — `app/providers/norkart.py`

Move `providers/norkart.py` → `app/providers/norkart.py`. Required edits:

1. Remove top-level `os.getenv("NORKART_APP_KEY", ...)`. Import from config:
   ```python
   from app.config import NORKART_APP_KEY, NORKART_PROXY, NORKART_API_BASE, HTTP_TIMEOUT, KARTVERKET_SOK_URL
   ```
2. Replace inline `from kartverket import lookup_adresse` (line 46) with module-level import:
   ```python
   from app.clients.kartverket import lookup_adresse
   ```
3. Replace `httpx.AsyncClient(timeout=10)` with `httpx.AsyncClient(timeout=HTTP_TIMEOUT)`.
4. Replace hard-coded `PROXY` / `API_BASE` constants with imports from `app.config`.
5. Replace hard-coded Geonorge URL with `KARTVERKET_SOK_URL` constant.

No behavior change. `_parse_norkart_date()` and `NORSK_MAANEDER` stay as module-private helpers.

**Acceptance:** `NorkartProvider().get_hentedager("Storgata 1, Sarpsborg", "3105")` returns the same structure as before.

---

### Sub-issue 4.3: Port `OsloProvider` — `app/providers/oslo.py`

Move `providers/oslo.py` → `app/providers/oslo.py`. Required edits:

1. Replace inline `from kartverket import lookup_adresse` (line 37) with module-level `from app.clients.kartverket import lookup_adresse`.
2. Replace hard-coded `OSLO_URL` with `from app.config import OSLO_URL, HTTP_TIMEOUT`.
3. Replace `httpx.AsyncClient(timeout=10)` with `httpx.AsyncClient(timeout=HTTP_TIMEOUT)`.

`_parse_date`, `_project_dates`, and `_FREQUENCY_DAYS` stay as module-private helpers.

**Acceptance:** `OsloProvider().get_hentedager("Storgata 1, Oslo", "0301")` returns the same shape.

---

### Sub-issue 4.4: Port `StavangerProvider` — `app/providers/stavanger.py`

Move `providers/stavanger.py` → `app/providers/stavanger.py`.

**Verified:** Stavanger does **not** call `kartverket.lookup_adresse`. It has its own address lookup via the Stavanger kommune API. So the `from kartverket import ...` edit does not apply here. Only these edits:

1. Replace any `httpx.AsyncClient(timeout=10)` literals with `httpx.AsyncClient(timeout=HTTP_TIMEOUT)` — `from app.config import HTTP_TIMEOUT`.
2. Keep `BASE_URL = "https://www.stavanger.kommune.no"`, the `HEADERS` dict, and the `NORSK_MAANEDER` dict as module-level constants inside `stavanger.py` (provider-specific, don't move to `app.config`).
3. `bs4` import stays unchanged — `from bs4 import BeautifulSoup` is the only consumer of beautifulsoup4 in the repo.

The two Stavanger endpoints (`/api/renovasjonservice/GroupedAddressSearch` and `/renovasjon-og-miljo/tommekalender/finn-kalender/show`) stay as string literals in the provider module.

**Acceptance:** Stavanger provider returns the same shape for e.g. kommunenr `1103` (Stavanger).

---

### Sub-issue 4.5: Port `AvfallSorProvider` — `app/providers/avfallsor.py`

Move `providers/avfallsor.py` → `app/providers/avfallsor.py`.

**Verified:** Avfall Sør does **not** call `kartverket.lookup_adresse` either and does **not** use `bs4`. It hits its own WordPress JSON API. Only edit required:

1. Replace any `timeout=10` literals with `HTTP_TIMEOUT` from `app.config`.

Keep the two module-level URL constants as-is:
```python
ADDRESS_API = "https://avfallsor.no/wp-json/addresses/v1/address"
CALENDAR_API = "https://avfallsor.no/wp-json/pickup-calendar/v1/collections/property-id/{property_id}"
```
These are provider-specific and stay inside `avfallsor.py`.

**Acceptance:** AvfallSor provider returns the same shape for kommunenr `4204`.

---

### Sub-issue 4.6: Port `BirProvider` — `app/providers/bir.py`

Pure rename — BIR is a stub that always returns `unsupported_municipality`. No imports to rewrite.

**Acceptance:** `BirProvider().get_hentedager("...", "4601")` returns the unsupported-municipality error dict unchanged.

---

### Sub-issue 4.7: Update `app/providers/__init__.py`

Re-export provider classes so the repository can import them from one place:

```python
# renovasjon-service/app/providers/__init__.py
from app.providers.base import Provider
from app.providers.norkart import NorkartProvider
from app.providers.oslo import OsloProvider
from app.providers.stavanger import StavangerProvider
from app.providers.avfallsor import AvfallSorProvider
from app.providers.bir import BirProvider

__all__ = [
    "Provider",
    "NorkartProvider",
    "OsloProvider",
    "StavangerProvider",
    "AvfallSorProvider",
    "BirProvider",
]
```

**Acceptance:** `from app.providers import NorkartProvider, OsloProvider, StavangerProvider, AvfallSorProvider, BirProvider` works.

---

## Issue 5: Create `RenovasjonRepository`

The current `renovasjon_api.py` (53 lines) mixes three concerns: address resolution, provider routing, and response normalization. In the `matrikkel-service` pattern this all belongs in a repository class.

### Sub-issue 5.1: Create `app/repositories/renovasjon.py`

```python
# renovasjon-service/app/repositories/renovasjon.py
import logging

from app.clients.kartverket import lookup_adresse
from app.kommune_map import get_provider_for_kommune
from app.providers import (
    Provider,
    NorkartProvider,
    OsloProvider,
    StavangerProvider,
    AvfallSorProvider,
    BirProvider,
)
from app.schema.renovasjon import HentedagerResponse, Hentedag, RenovasjonErrorResponse

logger = logging.getLogger(__name__)


class RenovasjonRepository:
    """Resolves an address to a municipality and dispatches to the correct provider."""

    def __init__(self):
        self._providers: dict[str, Provider] = {
            "norkart": NorkartProvider(),
            "stavanger": StavangerProvider(),
            "avfallsor": AvfallSorProvider(),
            "oslo": OsloProvider(),
            "bir": BirProvider(),
        }
        self._supported_public = [name for name in self._providers if name != "bir"]

    async def get_hentedager(
        self, adresse: str
    ) -> HentedagerResponse | RenovasjonErrorResponse:
        """Look up waste collection data for an address.

        Returns:
            HentedagerResponse on success; RenovasjonErrorResponse on
            address-not-found or unsupported-municipality.
        """
        try:
            geo = await lookup_adresse(adresse)
        except ValueError as e:
            return RenovasjonErrorResponse(
                adresse=adresse,
                error="address_not_found",
                message=str(e),
            )

        kommunenummer = geo["kommunenummer"]
        provider_name = get_provider_for_kommune(kommunenummer)

        if provider_name is None:
            return RenovasjonErrorResponse(
                adresse=adresse,
                kommune=geo["kommunenavn"],
                kommunenummer=kommunenummer,
                error="unsupported_municipality",
                message=(
                    f"Kommune {geo['kommunenavn']} ({kommunenummer}) is not yet "
                    f"supported. Supported providers: {', '.join(self._supported_public)}"
                ),
            )

        raw = await self._providers[provider_name].get_hentedager(adresse, kommunenummer)

        # Providers may still return an error dict (e.g. BIR stub, or a provider
        # that failed its internal Kartverket gatekode lookup).
        if "error" in raw:
            return RenovasjonErrorResponse(
                adresse=raw.get("adresse", adresse),
                kommune=raw.get("kommune"),
                kommunenummer=raw.get("kommunenummer", kommunenummer),
                provider=raw.get("provider"),
                error=raw["error"],
                message=raw.get("message"),
            )

        return HentedagerResponse(
            adresse=raw["adresse"],
            kommune=raw.get("kommune"),
            kommunenummer=raw.get("kommunenummer"),
            provider=raw.get("provider"),
            hentedager=[
                Hentedag(
                    fraksjon=h.get("fraksjon", ""),
                    neste_henting=h.get("neste_henting"),
                    kommende_datoer=h.get("kommende_datoer", []),
                )
                for h in raw.get("hentedager", [])
            ],
        )
```

Design notes:
- No database session dependency → no `__init__(db: Session)`. Unlike `matrikkel-service` repositories which take `db`, this repository is stateless and instantiated per-request in the route via `Depends`.
- Provider instances are constructed in `__init__` and reused across calls. If we later want to share a single `httpx.AsyncClient` across providers, this is the place to inject it.
- Return type is a union `HentedagerResponse | RenovasjonErrorResponse` — the route disambiguates via `isinstance`.

**Acceptance:** Repository returns typed models for both success and error paths. Existing behavior preserved for all 5 providers.

---

## Issue 6: Create `app/routes/renovasjon.py`

### Sub-issue 6.1: Port the `/hentedager` route

Replace the current `main.py` handler with a route module in the matrikkel pattern.

```python
# renovasjon-service/app/routes/renovasjon.py
import logging

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.config import ERROR_STATUS_MAP
from app.repositories.renovasjon import RenovasjonRepository
from app.schema.renovasjon import HentedagerResponse, RenovasjonErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()


def get_renovasjon_repository() -> RenovasjonRepository:
    """FastAPI dependency — constructs a fresh repository per request."""
    return RenovasjonRepository()


@router.get("/hentedager", response_model=HentedagerResponse)
async def get_hentedager(
    adresse: str = Query(..., description="Full Norwegian address"),
    repo: RenovasjonRepository = Depends(get_renovasjon_repository),
):
    """Get waste collection dates for a Norwegian address.

    Args:
        adresse: Free-text address (e.g. "Storgata 1, 3269 LARVIK").

    Returns:
        HentedagerResponse on success. On known errors returns a JSON error
        body with status 404 (address_not_found) or 422 (unsupported_municipality).
    """
    try:
        result = await repo.get_hentedager(adresse)
    except Exception:
        logger.exception("Unexpected error processing renovasjon request for %s", adresse)
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "message": "An unexpected error occurred"},
        )

    if isinstance(result, RenovasjonErrorResponse):
        status = ERROR_STATUS_MAP.get(result.error, 400)
        return JSONResponse(status_code=status, content=result.model_dump())

    return result
```

Notes:
- `response_model=HentedagerResponse` covers the happy path. Error responses bypass the response model by returning `JSONResponse` directly — same pattern as the current `main.py`.
- Backend compatibility: `backend/app/clients/renovasjon_client.py:39-44` checks `r.status_code == 404` and `r.status_code in (400, 422)`. Keeping the same status codes (via `ERROR_STATUS_MAP`) means no backend changes are required.

**Acceptance:** `GET /hentedager?adresse=...` returns the same status codes and JSON bodies as the current service. `backend/app/repositories/renovasjon.py` works unchanged.

---

## Issue 7: Create new `app/main.py`

### Sub-issue 7.1: FastAPI app factory

```python
# renovasjon-service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.routes.renovasjon import router as renovasjon_router

app = FastAPI(title="RenovasjonAPI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(renovasjon_router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}
```

Matches `matrikkel-service/app/main.py` structure exactly (router registration + `/` + `/health`).

**Acceptance:** Service starts via `uvicorn app.main:app`. `GET /health` → `{"status": "ok"}`. `GET /hentedager?adresse=...` routes through the new pipeline.

---

## Issue 8: Update Dockerfiles and docker-compose

### Sub-issue 8.1: Rename and update Dockerfile

Rename `renovasjon-service/Dockerfile` → `renovasjon-service/Dockerfile.renovasjon-service` and update its CMD to point at the new module path:

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004", "--reload"]
```

This mirrors `matrikkel-service/Dockerfile.matrikkel-service` byte-for-byte (same base image, same layer order, same CMD style — only the port differs).

### Sub-issue 8.2: Update prod Dockerfile

`renovasjon-service/Dockerfile.renovasjon-service.prod` exists and uses a multi-stage build. Full current contents:

```dockerfile
FROM python:3.11 AS builder
WORKDIR /app
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
COPY --from=builder /venv /venv
ENV PATH="/venv/bin:$PATH"
WORKDIR /app
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8004", "--workers", "2"]
```

Only change: update the final CMD from `main:app` to `app.main:app`. Keep multi-stage layout, keep `--workers 2`, no `--reload`.

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004", "--workers", "2"]
```

### Sub-issue 8.3: Update `docker-compose.yml`

In `docker-compose.yml:86-102`, update the renovasjon-service block:

```yaml
renovasjon-service:
  build:
    context: ./renovasjon-service
    dockerfile: Dockerfile.renovasjon-service        # CHANGED from Dockerfile
  restart: always
  ports:
    - "8004:8004"
  volumes:
    - ./renovasjon-service:/app
  env_file:                                           # NEW — matches matrikkel pattern
    - ./renovasjon-service/renovasjon-service.env
  healthcheck:
    test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8004/health')\""]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 15s
  networks:
    - frontend
```

**Verified:** `docker-compose.prod.yml` does **not** have a `build:` directive for renovasjon-service — it pulls the pre-built image from `ghcr.io/krsgeodata/801_26_fremt-dig-kont/renovasjon-service:latest`. So renaming the dev Dockerfile does **not** require any edit to `docker-compose.prod.yml`. The prod image is built by CI (see Sub-issue 8.4 below).

**Acceptance:** `docker compose up --build` starts renovasjon-service on port 8004. Healthcheck passes. Backend can still reach `http://renovasjon-service:8004/hentedager`.

---

### Sub-issue 8.4: Verify CI workflow — no edits expected

**Verified after reading `.github/workflows/ci.yml` in full:**

- The build step (lines 82-90) already uses `./renovasjon-service/Dockerfile.renovasjon-service.prod`. That filename is **unchanged** by this rewrite — only the dev Dockerfile is renamed (`Dockerfile` → `Dockerfile.renovasjon-service`), and CI doesn't reference the dev one. No edit needed here.
- The test step (lines 155-163) runs `pytest` from `renovasjon-service/` with a `find ... || echo "No tests found"` guard. It does **not** invoke `uvicorn main:app`. The rewrite has no tests either, so this step keeps passing through the rewrite unchanged.

Conclusion: **`ci.yml` requires no edits for this rewrite.** The prod image CI builds will run `app.main:app` automatically once Sub-issue 8.2 updates the CMD inside `Dockerfile.renovasjon-service.prod`.

**Acceptance:** CI passes on the rewrite PR with zero changes to `.github/workflows/ci.yml`. Published image at `ghcr.io/krsgeodata/801_26_fremt-dig-kont/renovasjon-service:latest` runs `uvicorn app.main:app --workers 2`.

---

## Issue 9: Update `requirements.txt` to pinned versions

### Sub-issue 9.1: Pin dependencies like `matrikkel-service`

Current `renovasjon-service/requirements.txt`:
```
fastapi
uvicorn[standard]
httpx
beautifulsoup4
```

**Verified versions** (pulled from `backend/requirements.txt` and `backend/.venv/lib/python3.13/site-packages/*.dist-info/`):

```
fastapi==0.128.0
uvicorn[standard]==0.40.0
python-dotenv==1.2.1
httpx==0.28.1
pydantic==2.12.5
beautifulsoup4==<verify>     # not pinned anywhere in the repo — see note below
```

`beautifulsoup4` is currently unpinned everywhere and is used only by `providers/stavanger.py`. Before committing, run this in the running renovasjon-service container to capture the installed version and pin it:

```bash
docker compose exec renovasjon-service pip show beautifulsoup4 | grep Version
```

Do **not** invent a version for beautifulsoup4.

`requirements-dev.txt` stays as-is (`-r requirements.txt` + `pytest`).

**Acceptance:** Fresh `docker compose build renovasjon-service` succeeds. Service runs identically to current deployment.

---

## Issue 10: Delete old files

### Sub-issue 10.1: Remove the now-unused flat-layout files

Once all sub-issues above land and `docker compose up` verifies the new service, delete:

- `renovasjon-service/main.py`
- `renovasjon-service/renovasjon_api.py`
- `renovasjon-service/kartverket.py`
- `renovasjon-service/kommune_map.py` (moved to `app/kommune_map.py`)
- `renovasjon-service/providers/` (entire top-level directory — moved to `app/providers/`)
- `renovasjon-service/Dockerfile` (renamed)

**Do NOT delete:**
- `renovasjon-service/renovasjon_norge.json` — **Verified:** not loaded at runtime anywhere in the service. Only referenced in a single comment in `kommune_map.py` ("Source: Kartverket kommunenummer register + renovasjon_norge.json"). Keep as a reference data file. It can optionally move to `renovasjon-service/app/` or stay at the package root; leave it at the service root for now.
- `renovasjon-service/scripts/find_missing_kommuner.py` — dev tool, needs imports updated (see Sub-issue 10.2).

Before deletion, grep for lingering imports of the old module paths:

```
grep -rn "from kartverket" renovasjon-service/
grep -rn "from kommune_map" renovasjon-service/
grep -rn "from providers" renovasjon-service/
grep -rn "from renovasjon_api" renovasjon-service/
```

All hits should be inside the files being deleted. If any hit is inside `app/` or `scripts/`, fix before deleting.

**Acceptance:** Zero hits for old module paths outside deleted files. Service still starts and responds identically.

---

### Sub-issue 10.2: Fix `scripts/find_missing_kommuner.py` imports

**Verified:** The script currently does `from kommune_map import _MAP` (line 14) and uses the `requests` library (not `httpx`) to call `https://ws.geonorge.no/kommuneinfo/v1/kommuner`.

Required edits:

1. Change `from kommune_map import _MAP` → `from app.kommune_map import _MAP`.
2. Run it as a module from the `renovasjon-service/` directory:
   ```bash
   cd renovasjon-service/
   python -m scripts.find_missing_kommuner
   ```
   This puts `renovasjon-service/` on `sys.path`, making `app.kommune_map` importable.
3. `requests` is a dev-only dependency for this script. Add `requests` to `requirements-dev.txt` (currently only has `pytest`) so the script runs in a fresh dev environment. Do **not** add it to `requirements.txt` — runtime code uses `httpx`.

**Acceptance:** `python -m scripts.find_missing_kommuner` (from `renovasjon-service/`) runs without ImportError and prints the diff of missing kommunenumre.

---

## Issue 11: Verification

After all issues land:

1. `docker compose up --build renovasjon-service` — service starts on port 8004.
2. `curl http://localhost:8004/health` → `{"status": "ok"}`.
3. `curl "http://localhost:8004/hentedager?adresse=Dronningens%20gate%202,%204610%20Kristiansand"` → valid `HentedagerResponse` with Avfall Sør data.
4. `curl "http://localhost:8004/hentedager?adresse=Storgata%201,%20Oslo"` → Oslo provider response.
5. `curl "http://localhost:8004/hentedager?adresse=bogusstreet%20999"` → 404 with `address_not_found` error body.
6. `curl "http://localhost:8004/hentedager?adresse=Strandgaten%201,%20Bergen"` → 422 with `unsupported_municipality` error body (BIR stub).
7. Full stack: log into frontend → select property in kommune 4204 → Avfall page populates with seed data via `backend → renovasjon-service`.
8. Grep check: zero hits for `from kartverket`, `from kommune_map`, `from providers`, `from renovasjon_api` outside `app/`.
9. Directory structure under `renovasjon-service/` matches the target layout in the Issue 1 diagram.

---

## Implementation Order

```
Phase 1 — Scaffold (no behavior change yet, old files still in place):
  1.1 → 1.2 → 1.3        # directories, config, move kommune_map
  2.1                     # move kartverket → app/clients/

Phase 2 — Schemas and providers:
  3.1                     # Pydantic schemas
  4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7   # port providers one at a time

Phase 3 — Repository + route + app:
  5.1                     # RenovasjonRepository
  6.1                     # routes/renovasjon.py
  7.1                     # app/main.py

Phase 4 — Docker + deps (service now runs via new entrypoint):
  8.1 → 8.2 → 8.3 → 8.4   # Dockerfile rename, dev compose update, CI workflow update
  9.1                     # requirements.txt pinning

Phase 5 — Cleanup (only after Phase 4 verified end-to-end):
  10.1 → 10.2             # delete old files, fix scripts
  11                      # full verification
```

Each phase is independently testable. After Phase 3 the service runs from `app.main:app` but the old `main.py` is still on disk (harmless — nothing imports it). Phase 4 flips the Dockerfile CMD. Phase 5 is pure cleanup.

---

## Out of Scope

These are intentional non-goals for this rewrite:

- **No database.** `renovasjon-service` remains stateless. Do not add SQLAlchemy, `models.py`, or `database.py`.
- **No shared `httpx.AsyncClient`.** Each provider currently opens its own `AsyncClient` per call. Moving to a shared client (like `backend/app/main.py` lifespan does) is a valid follow-up but changes behavior (connection pooling, timeout semantics) and is not part of the structural rewrite.
- **No API contract change.** `GET /hentedager?adresse=...` with identical status codes and field names. The backend client (`backend/app/clients/renovasjon_client.py`) must continue to work without modification.
- **No provider logic changes.** Provider bodies are moved, not rewritten. Bug fixes and new providers are separate issues.
- **No `kommune_map.py` refactor.** The 438-line static dict stays as-is — migrating it to a JSON file or a different data structure is orthogonal to the layout rewrite.
