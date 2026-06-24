# FIKS Integration: Technical Implementation Plan

Parent issue plan: [docs/fiks-integration-plan.md](../fiks-integration-plan.md)

This document breaks each issue into sub-issues with exact file paths, function signatures, and code changes required.

Pre-existing security and code quality issues (not caused by this plan) are tracked separately in [docs/plans/pre-existing-issues.md](plans/pre-existing-issues.md).

**Known limitation:** The matrikkel-service `GET /eiendom` endpoint and `MatrikkelClient.get_eiendom()` do not filter by `kommunenummer` — only gnr/bnr/fnr/snr. This works for the POC (single municipality) but will need updating for multi-municipality deployment.

---

## Issue 1: Create `arkiv-service` FastAPI Service

### Sub-issue 1.1: Scaffold arkiv-service project structure

Create `arkiv-service/` directory mirroring `matrikkel-service/` structure:

```
arkiv-service/
  app/
    __init__.py
    main.py              # FastAPI app, router registration, health endpoints
    database.py          # SQLAlchemy engine, SessionLocal, get_db dependency
    models.py            # ArkivSak, ArkivDokument SQLAlchemy models
    routes/
      __init__.py
      innsyn.py          # FIKS Innsyn POST endpoints
    repositories/
      __init__.py
      innsyn.py          # Query logic for arkiv tables
    schema/
      __init__.py
      innsyn.py          # Pydantic request/response models matching FIKS contract
  Dockerfile.arkiv-service
  Dockerfile.arkiv-service.prod
  arkiv-service.env
  requirements.txt
```

**requirements.txt** (copy exact versions from `matrikkel-service/requirements.txt` to ensure compatibility):

**arkiv-service.env:**
```
DATABASE_URL=postgresql+psycopg2://<user>:<password>@database:5432/eiendom_db
CORS_ORIGINS=http://localhost:5001,http://127.0.0.1:5001
```

**Dockerfile.arkiv-service** (copy pattern from `matrikkel-service/Dockerfile.matrikkel-service`):
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8005", "--reload"]
```

**Acceptance:** Service starts, `GET /health` returns `{"status": "ok"}`.

---

### Sub-issue 1.2: Database schema and models for arkiv tables

Create SQL migration file `database/prod_data/004_arkiv_schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS arkiv_saker (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saksnummer_aar  INTEGER NOT NULL,
    saksnummer_sekv INTEGER NOT NULL,
    tittel          TEXT NOT NULL,
    saksstatus      TEXT NOT NULL,
    saksdato        DATE,
    kommunenummer   TEXT NOT NULL,
    gnr             INTEGER NOT NULL,
    bnr             INTEGER NOT NULL,
    fnr             INTEGER NOT NULL DEFAULT 0,
    snr             INTEGER NOT NULL DEFAULT 0,
    saksansvarlig   TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (saksnummer_aar, saksnummer_sekv)
);

CREATE INDEX idx_arkiv_saker_matrikkel ON arkiv_saker (kommunenummer, gnr, bnr, fnr, snr);

CREATE TABLE IF NOT EXISTS arkiv_dokumenter (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sak_id          UUID NOT NULL REFERENCES arkiv_saker(id) ON DELETE CASCADE,
    tittel          TEXT NOT NULL,
    dokumenttype    TEXT,
    filnavn         TEXT,
    mimetype        TEXT DEFAULT 'application/pdf',
    opprettet_dato  DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_arkiv_dokumenter_sak ON arkiv_dokumenter (sak_id);
```

**SQLAlchemy models** in `arkiv-service/app/models.py`.
Must use `Mapped`/`mapped_column` style (SQLAlchemy 2.x) to match `matrikkel-service/app/models.py`. Use `UUID(as_uuid=True)` from `sqlalchemy.dialects.postgresql`:

```python
import uuid
from sqlalchemy import Integer, Text, Date, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

class ArkivSak(Base):
    __tablename__ = "arkiv_saker"
    id:              Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    saksnummer_aar:  Mapped[int]       = mapped_column(Integer, nullable=False)
    saksnummer_sekv: Mapped[int]       = mapped_column(Integer, nullable=False)
    tittel:          Mapped[str]       = mapped_column(Text, nullable=False)
    saksstatus:      Mapped[str]       = mapped_column(Text, nullable=False)
    saksdato:        Mapped[str | None] = mapped_column(Date, nullable=True)
    kommunenummer:   Mapped[str]       = mapped_column(Text, nullable=False)
    gnr:             Mapped[int]       = mapped_column(Integer, nullable=False)
    bnr:             Mapped[int]       = mapped_column(Integer, nullable=False)
    fnr:             Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    snr:             Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    saksansvarlig:   Mapped[str | None] = mapped_column(Text, nullable=True)
    dokumenter:      Mapped[list["ArkivDokument"]] = relationship(back_populates="sak")

class ArkivDokument(Base):
    __tablename__ = "arkiv_dokumenter"
    id:             Mapped[uuid.UUID]  = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    sak_id:         Mapped[uuid.UUID]  = mapped_column(PG_UUID(as_uuid=True), ForeignKey("arkiv_saker.id"), nullable=False)
    tittel:         Mapped[str]        = mapped_column(Text, nullable=False)
    dokumenttype:   Mapped[str | None] = mapped_column(Text, nullable=True)
    filnavn:        Mapped[str | None] = mapped_column(Text, nullable=True)
    mimetype:       Mapped[str | None] = mapped_column(Text, default="application/pdf")
    opprettet_dato: Mapped[str | None] = mapped_column(Date, nullable=True)
    sak:            Mapped["ArkivSak"] = relationship(back_populates="dokumenter")
```

**Acceptance:** Tables created when database container initializes. Models import without error.

---

### Sub-issue 1.3: Seed data for arkiv tables

Create `database/prod_data/005_arkiv_seed.sql` with realistic byggesaker linked to existing seed properties:

**Property 1** (GNR 58, BNR 61, kommunenr 4204 - Soeam terrasse 3):
- Sak 1: "Rammesoeknad - tilbygg enebolig" (status: Godkjent, 2023)
  - Dok 1: "Soeknad om rammetillatelse"
  - Dok 2: "Situasjonskart"
  - Dok 3: "Nabovarsel - kvittering"
- Sak 2: "Igangsettingstillatelse - tilbygg" (status: Under behandling, 2024)
  - Dok 1: "Soeknad om igangsettingstillatelse"
  - Dok 2: "Ansvarsrett"

**Property 2** (GNR 37, BNR 119, kommunenr 4204 - Magnus Barfots vei 28):
- Sak 1: "Bruksendring fra bod til soverom" (status: Godkjent, 2022)
  - Dok 1: "Soeknad om bruksendring"
  - Dok 2: "Plantegninger"

**Acceptance:** Seed data loads on `docker compose up`. Queries return expected rows.

---

### Sub-issue 1.4: FIKS Innsyn Pydantic schemas (request/response)

Create `arkiv-service/app/schema/innsyn.py` matching the real FIKS Innsyn contract:

```python
# Request models
class MatrikkelnummerRequest(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int = 0
    seksjonsnummer: int = 0

class EiendomSokRequest(BaseModel):
    matrikkelnummer: MatrikkelnummerRequest
    akseptertMeldingVersjon: list[str] = ["byggesakV1"]
    fra: int = Field(default=0, ge=0)
    antall: int = Field(default=25, ge=1, le=100)

# Response models
class Saksnummer(BaseModel):
    saksaar: int
    sakssekvensnummer: int

class MappeByggesak(BaseModel):
    saksnummer: Saksnummer
    tittel: str
    saksstatus: str
    saksdato: str | None = None
    saksansvarlig: str | None = None
    matrikkelnummer: list[MatrikkelnummerRequest]

class InnsynTreff(BaseModel):
    meldingId: uuid.UUID
    meldingType: str = "byggesak"
    versjon: str = "byggesakV1"
    mappe: MappeByggesak

class InnsynSokResponse(BaseModel):
    antallTreff: int
    treff: list[InnsynTreff]

# Document response
class DokumentResponse(BaseModel):
    dokumentId: uuid.UUID
    tittel: str
    dokumenttype: str | None = None
    filnavn: str | None = None
    mimetype: str | None = None
    opprettetDato: str | None = None
```

**Acceptance:** Schemas serialize/deserialize correctly. Response matches FIKS Innsyn `mappe.v1` format.

---

### Sub-issue 1.5: FIKS Innsyn routes and repository

Create `arkiv-service/app/routes/innsyn.py`:

```python
router = APIRouter()

@router.post("/innsyn-sok/api/v1/eiendom/sok", response_model=InnsynSokResponse)
def sok_byggesaker(body: EiendomSokRequest, db: Session = Depends(get_db)):
    """Search byggesaker by matrikkelnummer. Matches real FIKS Innsyn contract."""
    ...

@router.get("/innsyn-sok/api/v1/dokument/{dokument_id}", response_model=DokumentResponse)
def get_dokument(dokument_id: str, db: Session = Depends(get_db)):
    """Get document metadata by ID."""
    ...

@router.get("/innsyn-sok/api/v1/sak/{sak_id}/dokumenter", response_model=list[DokumentResponse])
def get_dokumenter_for_sak(sak_id: str, db: Session = Depends(get_db)):
    """Get all documents for a case."""
    ...
```

Create `arkiv-service/app/repositories/innsyn.py`:

```python
class InnsynRepository:
    def __init__(self, db: Session):
        self._db = db

    def sok_by_matrikkelnummer(
        self, kommunenummer: str, gnr: int, bnr: int, fnr: int, snr: int,
        fra: int = 0, antall: int = 25
    ) -> tuple[int, list[ArkivSak]]:
        """Returns (total_count, paginated_saker)."""
        query = self._db.query(ArkivSak).filter_by(
            kommunenummer=kommunenummer, gnr=gnr, bnr=bnr, fnr=fnr, snr=snr
        )
        total = query.count()
        saker = query.offset(fra).limit(antall).all()
        return total, saker

    def get_dokument(self, dokument_id: str) -> ArkivDokument | None:
        return self._db.query(ArkivDokument).filter_by(id=dokument_id).first()

    def get_dokumenter_for_sak(self, sak_id: str) -> list[ArkivDokument]:
        return self._db.query(ArkivDokument).filter_by(sak_id=sak_id).all()
```

**Acceptance:** `POST /innsyn-sok/api/v1/eiendom/sok` with matrikkelnummer body returns seed byggesaker. Pagination works.

---

### Sub-issue 1.6: Add arkiv-service to Docker Compose

Add to `docker-compose.yml`:

```yaml
arkiv-service:
  build:
    context: ./arkiv-service
    dockerfile: Dockerfile.arkiv-service
  restart: always
  ports:
    - "8005:8005"
  volumes:
    - ./arkiv-service:/app
  env_file:
    - ./arkiv-service/arkiv-service.env
  depends_on:
    - database
  networks:
    - database
    - frontend
```

Update `backend` service `depends_on` to include `arkiv-service`.

Add `FIKS_INNSYN_URL=http://arkiv-service:8005` to `backend/backend.env`.

**Acceptance:** `docker compose up` starts arkiv-service on port 8005. Backend can reach it.

---

## Issue 2: Add FIKS Matrikkel Eier Routes to matrikkel-service

### Sub-issue 2.1: FIKS Matrikkel Eier Pydantic schemas

Create `matrikkel-service/app/schema/fiks_matrikkel_eier.py`:

```python
# Request models
class MatrikkelnummerRequest(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int = 0
    seksjonsnummer: int = 0

class FinnEiendommerRequest(BaseModel):
    type: str = "FYSISK_PERSON"    # FYSISK_PERSON or JURIDISK_PERSON
    verdi: str                      # fodselsnummer (11 digits) or orgnr

class EiendomTreff(BaseModel):
    matrikkelnummer: MatrikkelnummerRequest
    vegadresse: str | None = None
    postnummeromraade: str | None = None

class FinnEiendommerResponse(BaseModel):
    antallTreff: int
    eiendommer: list[EiendomTreff]

# finn-eiere
class EierTreff(BaseModel):
    type: str | None = None
    personnr: str | None = None
    orgnr: str | None = None
    navn: str | None = None
    andel: str | None = None

class FinnEiereResponse(BaseModel):
    matrikkelnummer: MatrikkelnummerRequest
    eiere: list[EierTreff]
```

**Acceptance:** Schemas match FIKS Matrikkel Eier API contract structure.

---

### Sub-issue 2.2: FIKS Matrikkel Eier repository

Create `matrikkel-service/app/repositories/fiks_matrikkel_eier.py`:

```python
import json

class FiksMatrikkelEierRepository:
    def __init__(self, db: Session):
        self._db = db

    def finn_eiendommer(self, person_type: str, verdi: str) -> list[dict]:
        """Find properties by fodselsnummer or orgnr.

        SECURITY: Uses json.dumps() to build the JSONB filter safely.
        Do NOT use f-strings for JSON construction (injection risk).
        """
        key = "PERSONNR" if person_type == "FYSISK_PERSON" else "ORGNR"
        filter_json = json.dumps([{key: verdi}])

        rows = self._db.execute(text("""
            SELECT gnr, bnr, fnr, snr,
                   data->>'VEGADRESSE' AS vegadresse,
                   data->>'KOMMUNENR' AS kommunenr
            FROM matrikkel_eiendommer
            WHERE data->'eierforhold' @> CAST(:filter AS jsonb)
        """), {"filter": filter_json}).fetchall()
        return [
            {"gnr": r[0], "bnr": r[1], "fnr": r[2], "snr": r[3],
             "vegadresse": r[4], "kommunenr": r[5]}
            for r in rows
        ]

    def finn_eiere(self, kommunenummer: str, gnr: int, bnr: int, fnr: int, snr: int) -> list[dict]:
        """Find owners for a property. Reuses logic from eiere repository."""
        row = self._db.query(Eiendom).filter_by(gnr=gnr, bnr=bnr, fnr=fnr, snr=snr).first()
        if not row:
            return []
        return (row.data or {}).get("eierforhold", [])
```

**SECURITY NOTE:** The existing `backend/app/repositories/auth.py` (lines 77, 121, 161) uses the same unsafe f-string pattern for JSONB filters. This must also be fixed as part of the pre-existing issues tracked in `docs/plans/pre-existing-issues.md`.

**Acceptance:** Repository returns correct data for seed personnummer `"11111111111"` and `"22222222222"`.

---

### Sub-issue 2.3: FIKS Matrikkel Eier routes

Create `matrikkel-service/app/routes/fiks_matrikkel_eier.py`:

```python
router = APIRouter()

@router.post("/matrikkel-eier/api/v1/{fiks_org_id}/finn-eiendommer", response_model=FinnEiendommerResponse)
def finn_eiendommer(fiks_org_id: str, body: FinnEiendommerRequest, db: Session = Depends(get_db)):
    """Find properties owned by a person/org. fiksOrgId accepted but not validated."""
    ...

@router.post("/matrikkel-eier/api/v1/{fiks_org_id}/finn-eiere", response_model=list[FinnEiereResponse])
def finn_eiere(fiks_org_id: str, body: list[MatrikkelnummerRequest], db: Session = Depends(get_db)):
    """Find owners for given properties. fiksOrgId accepted but not validated."""
    ...
```

Register router in `matrikkel-service/app/main.py`:
```python
from app.routes.fiks_matrikkel_eier import router as fiks_matrikkel_eier_router
app.include_router(fiks_matrikkel_eier_router)
```

Validate `fiks_org_id` as UUID format in the route (return 400 for invalid format):
```python
import re
if not re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', fiks_org_id, re.IGNORECASE):
    raise HTTPException(status_code=400, detail="Invalid fiksOrgId format")
```

**Acceptance:** POST endpoints return FIKS-shaped responses. Existing GET endpoints unchanged. `fiks_org_id` validated as UUID format.

---

## Issue 3: Implement FiksInnsynClient in Backend

### Sub-issue 3.1: Create FiksInnsynClient class

Create `backend/app/clients/fiks_innsyn_client.py`:

```python
FIKS_INNSYN_URL = os.getenv("FIKS_INNSYN_URL", "http://arkiv-service:8005")

class FiksInnsynClient:
    def __init__(self, client: httpx.AsyncClient):
        self._client = client
        self._base = FIKS_INNSYN_URL

    async def sok_byggesaker(
        self, kommunenummer: str, gnr: int, bnr: int, fnr: int = 0, snr: int = 0,
        fra: int = 0, antall: int = 25
    ) -> dict[str, Any]:
        """POST-based search matching FIKS Innsyn contract."""
        r = await self._client.post(
            f"{self._base}/innsyn-sok/api/v1/eiendom/sok",
            json={
                "matrikkelnummer": {
                    "kommunenummer": kommunenummer,
                    "gardsnummer": gnr,
                    "bruksnummer": bnr,
                    "festenummer": fnr,
                    "seksjonsnummer": snr,
                },
                "akseptertMeldingVersjon": ["byggesakV1"],
                "fra": fra,
                "antall": antall,
            },
        )
        if r.status_code == 404:
            return {"antallTreff": 0, "treff": []}
        r.raise_for_status()
        return r.json()

    async def get_dokumenter_for_sak(self, sak_id: str) -> list[dict[str, Any]]:
        """Get all documents for a case."""
        r = await self._client.get(f"{self._base}/innsyn-sok/api/v1/sak/{sak_id}/dokumenter")
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()
```

**Acceptance:** Client class follows MatrikkelClient pattern (lines 14-163 of `backend/app/clients/matrikkel_client.py`). Uses shared httpx.AsyncClient.

---

### Sub-issue 3.2: Register FiksInnsynClient in app lifecycle

Modify `backend/app/main.py` (line 26-31 lifespan):

```python
from app.clients.fiks_innsyn_client import FiksInnsynClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient()
    app.state.matrikkel_client = MatrikkelClient(app.state.http_client)
    app.state.cms_client = CmsClient(app.state.http_client)
    app.state.renovasjon_client = RenovasjonClient(app.state.http_client)
    app.state.fiks_innsyn_client = FiksInnsynClient(app.state.http_client)  # NEW
    yield
    await app.state.http_client.aclose()
```

Add dependency to `backend/app/dependencies.py`:

```python
from app.clients.fiks_innsyn_client import FiksInnsynClient

def get_fiks_innsyn_client(request: Request) -> FiksInnsynClient:
    return request.app.state.fiks_innsyn_client
```

**Acceptance:** `FiksInnsynClient` available via `Depends(get_fiks_innsyn_client)`.

---

### Sub-issue 3.3: Create FiksByggesakRepository using FiksInnsynClient

The existing `backend/app/repositories/byggesak.py` (line 5-34) uses `MatrikkelClient`. **Do NOT modify it** — the old route still depends on it until Issue 6. Create a new repository class alongside it.

Create `backend/app/repositories/fiks_byggesak.py`:

```python
class FiksByggesakRepository:
    def __init__(self, client: FiksInnsynClient):
        self._client = client

    async def get_building_cases(
        self, kommunenummer: str, gnr: int, bnr: int, fnr: int = 0, snr: int = 0
    ) -> list[BuildingCaseResponse]:
        """Fetch byggesaker from FIKS Innsyn and transform to internal schema."""
        result = await self._client.sok_byggesaker(kommunenummer, gnr, bnr, fnr, snr)
        cases = []
        for treff in result.get("treff", []):
            mappe = treff.get("mappe", {})
            saksnr = mappe.get("saksnummer", {})
            cases.append(BuildingCaseResponse(
                case_id=f"{saksnr.get('saksaar', '')}/{saksnr.get('sakssekvensnummer', '')}",
                title=mappe.get("tittel"),
                status=mappe.get("saksstatus"),
                case_officer=mappe.get("saksansvarlig"),
                created_date=mappe.get("saksdato"),
            ))
        return cases

    async def get_case_documents(self, sak_id: str) -> list[DocumentResponse]:
        docs = await self._client.get_dokumenter_for_sak(sak_id)
        return [
            DocumentResponse(
                id=d.get("dokumentId", ""),
                title=d.get("tittel"),
                document_type=d.get("dokumenttype"),
                uploaded_at=d.get("opprettetDato"),
            )
            for d in docs
        ]
```

**Key change:** Method signature goes from `get_building_cases(property_id: int)` to `get_building_cases(kommunenummer, gnr, bnr, fnr, snr)`. This ties into Issue 5.

**Acceptance:** Repository correctly transforms FIKS `mappe.v1` → internal `BuildingCaseResponse`. Old `ByggesakRepository` remains untouched — renamed to `FiksByggesakRepository` in Issue 6.

---

### Sub-issue 3.4: Create new byggesak route using matrikkelnummer

Add new route to `backend/app/routes/byggesak.py` (keeping old route temporarily):

```python
def get_fiks_byggesak_repository(
    client: FiksInnsynClient = Depends(get_fiks_innsyn_client),
) -> FiksByggesakRepository:
    return FiksByggesakRepository(client)

@router.post("/byggesaker/sok", response_model=list[BuildingCaseResponse])
async def sok_byggesaker(
    body: MatrikkelnummerRequest,
    repo: FiksByggesakRepository = Depends(get_fiks_byggesak_repository),
):
    return await repo.get_building_cases(
        body.kommunenummer, body.gardsnummer, body.bruksnummer,
        body.festenummer, body.seksjonsnummer,
    )
```

Need to create `backend/app/schema/fiks_models.py` for shared request models (reused by Issues 3 and 4):

```python
from pydantic import BaseModel

class MatrikkelnummerRequest(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int = 0
    seksjonsnummer: int = 0

class FinnEiendommerRequest(BaseModel):
    type: str = "FYSISK_PERSON"    # FYSISK_PERSON or JURIDISK_PERSON
    verdi: str                      # fodselsnummer (11 digits) or orgnr
```

This is the single source of truth for these models in the backend. The matrikkel-service has its own copies (separate service).

**Acceptance:** `POST /byggesaker/sok` with matrikkelnummer body returns byggesaker from arkiv-service.

---

## Issue 4: Implement FiksMatrikkelClient in Backend

### Sub-issue 4.1: Create FiksMatrikkelClient class

Create `backend/app/clients/fiks_matrikkel_client.py`:

```python
FIKS_MATRIKKEL_URL = os.getenv("FIKS_MATRIKKEL_URL", "http://matrikkel-service:8001")
FIKS_ORG_ID = os.environ.get("FIKS_ORG_ID", "00000000-0000-0000-0000-000000004204")  # POC default for kommune 4204

class FiksMatrikkelClient:
    def __init__(self, client: httpx.AsyncClient):
        self._client = client
        self._base = FIKS_MATRIKKEL_URL

    async def finn_eiendommer(self, fodselsnummer: str) -> dict[str, Any]:
        """Find properties by fodselsnummer. POST-based FIKS contract."""
        r = await self._client.post(
            f"{self._base}/matrikkel-eier/api/v1/{FIKS_ORG_ID}/finn-eiendommer",
            json={"type": "FYSISK_PERSON", "verdi": fodselsnummer},
        )
        if r.status_code == 404:
            return {"antallTreff": 0, "eiendommer": []}
        r.raise_for_status()
        return r.json()

    async def finn_eiendommer_by_orgnr(self, orgnr: str) -> dict[str, Any]:
        """Find properties by orgnr. POST-based FIKS contract."""
        r = await self._client.post(
            f"{self._base}/matrikkel-eier/api/v1/{FIKS_ORG_ID}/finn-eiendommer",
            json={"type": "JURIDISK_PERSON", "verdi": orgnr},
        )
        if r.status_code == 404:
            return {"antallTreff": 0, "eiendommer": []}
        r.raise_for_status()
        return r.json()

    async def finn_eiere(self, matrikkelnummer_list: list[dict]) -> list[dict[str, Any]]:
        """Find owners for properties. POST-based FIKS contract."""
        r = await self._client.post(
            f"{self._base}/matrikkel-eier/api/v1/{FIKS_ORG_ID}/finn-eiere",
            json=matrikkelnummer_list,
        )
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()
```

**Acceptance:** Client follows MatrikkelClient pattern. Uses shared httpx.AsyncClient.

---

### Sub-issue 4.2: Register FiksMatrikkelClient and add backend route

Same pattern as Sub-issue 3.2. Add to `main.py` lifespan and `dependencies.py`.

New route in `backend/app/routes/auth.py` or new file `backend/app/routes/eiendommer.py`:

```python
@router.post("/eiendommer/sok")
async def sok_eiendommer(
    body: FinnEiendommerRequest,
    client: FiksMatrikkelClient = Depends(get_fiks_matrikkel_client),
):
    """Frontend calls this to get property list. Replaces GET /auth/properties."""
    result = await client.finn_eiendommer(body.verdi) if body.type == "FYSISK_PERSON" \
        else await client.finn_eiendommer_by_orgnr(body.verdi)
    return result
```

**Acceptance:** `POST /eiendommer/sok` with fodselsnummer returns properties with matrikkelnummer objects.

---

## Issue 5: Remove Serial ID — Use Matrikkelnummer Throughout

### Sub-issue 5.1: Create `Matrikkelnummer` model and dependency

Instead of passing 5 separate parameters through every route → repository → client, create a single typed object.

**Add to `backend/app/schema/fiks_models.py`** (created in Sub-issue 3.4):

```python
class Matrikkelnummer(BaseModel):
    """Composite cadastral identifier used throughout the system.
    Replaces the old serial property_id everywhere."""
    kommunenr: str
    gnr: int
    bnr: int
    fnr: int = 0
    snr: int = 0
```

**Add dependency to `backend/app/dependencies.py`:**

```python
from app.schema.fiks_models import Matrikkelnummer

def get_matrikkelnummer(
    kommunenr: str, gnr: int, bnr: int, fnr: int = 0, snr: int = 0,
) -> Matrikkelnummer:
    """Resolve matrikkelnummer from path params. Used by all property routes."""
    return Matrikkelnummer(kommunenr=kommunenr, gnr=gnr, bnr=bnr, fnr=fnr, snr=snr)
```

**Update all routes** — every `property_id: int` becomes `matrikkel: Matrikkelnummer = Depends(get_matrikkelnummer)`:

```python
# Example (property_info.py):
@router.get("/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}", ...)
async def get_property_info(
    matrikkel: Matrikkelnummer = Depends(get_matrikkelnummer),
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    repo = PropertyInfoRepository(client)
    return await repo.get_property_info(matrikkel)
```

**Files to change (7 route files):**

| File | Current route | New route |
|------|--------------|-----------|
| `backend/app/routes/property_info.py:13` | `/property/{property_id}` | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}` |
| `backend/app/routes/map.py` | `/map/{property_id}` | `/map/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}` |
| `backend/app/routes/neighbor_list.py` | `/property/{property_id}/neighbors` | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/neighbors` |
| `backend/app/routes/building_details.py` | `/property/{property_id}/buildings` | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/buildings` |
| `backend/app/routes/byggesak.py:13` | `/property/{property_id}/building-cases` | Replaced by `POST /byggesaker/sok` (Issue 3) |
| `backend/app/routes/avgifter.py` | `/property/{property_id}/municipal-fees` | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/municipal-fees` |
| `backend/app/routes/renovasjon.py` | `/property/{property_id}/renovasjon` | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/renovasjon` |

**Acceptance:** All routes use `Matrikkelnummer` via `Depends()`. No `property_id` in any public endpoint. Single object threaded through the entire stack.

---

### Sub-issue 5.2: Update backend repositories to use matrikkelnummer directly

Currently, every repository does this two-step dance:
1. Call `MatrikkelClient.get_eiendom_by_id(property_id)` to get gnr/bnr/fnr/snr
2. Call the actual matrikkel-service endpoint with gnr/bnr/fnr/snr

Example from `backend/app/repositories/neighbor_list.py:17-47`:
```python
async def get_neighbors(self, property_id: int, radius: float = 25):
    eiendom = await self._client.get_eiendom_by_id(property_id)  # step 1
    gnr, bnr, fnr, snr = ...extract from eiendom...              # step 1
    neighbors = await self._client.get_naboer(gnr, bnr, fnr, snr, radius)  # step 2
```

**New:** Skip step 1 entirely. Routes pass the `Matrikkelnummer` object directly to repositories. Repositories unpack it when calling matrikkel-service:

```python
# Example repository method:
async def get_neighbors(self, matrikkel: Matrikkelnummer, radius: float = 25):
    neighbors = await self._client.get_naboer(
        matrikkel.gnr, matrikkel.bnr, matrikkel.fnr, matrikkel.snr, radius
    )
    ...
```

**Files to change (6 repository files):**

| File | Current method signature | New method signature |
|------|------------------------|---------------------|
| `backend/app/repositories/property_info.py:17` | `get_property_info(self, property_id: int)` | `get_property_info(self, matrikkel: Matrikkelnummer)` |
| `backend/app/repositories/map.py:17` | `get_coordinates(self, property_id: int)` | `get_coordinates(self, matrikkel: Matrikkelnummer)` |
| `backend/app/repositories/neighbor_list.py:17` | `get_neighbors(self, property_id: int, ...)` | `get_neighbors(self, matrikkel: Matrikkelnummer, ...)` |
| `backend/app/repositories/building_details.py:11` | `get_buildings(self, property_id: int)` | `get_buildings(self, matrikkel: Matrikkelnummer)` |
| `backend/app/repositories/avgifter.py:17` | `get_avgifter(self, property_id: int)` | `get_avgifter(self, matrikkel: Matrikkelnummer)` |
| `backend/app/repositories/renovasjon.py:17` | `get_renovasjon(self, property_id: int)` | `get_renovasjon(self, matrikkel: Matrikkelnummer)` |

**Acceptance:** All repositories accept a single `Matrikkelnummer` object. No repository calls `get_eiendom_by_id()`. Eliminates redundant HTTP call per request.

---

### Sub-issue 5.3: Update MatrikkelClient — remove ID-based methods

In `backend/app/clients/matrikkel_client.py`:

**Remove:**
- `get_eiendom_by_id(self, property_id: int)` (line 44-57) — replaced by `get_eiendom(gnr, bnr, fnr, snr)` using the existing `GET /eiendom?gnr=&bnr=&fnr=&snr=` endpoint on matrikkel-service (already exists at `matrikkel-service/app/routes/eiendom.py:26`)

**Add:**
```python
async def get_eiendom(self, gnr: int, bnr: int, fnr: int = 0, snr: int = 0) -> dict[str, Any] | None:
    r = await self._client.get(
        f"{self._base}/eiendom",
        params={"gnr": gnr, "bnr": bnr, "fnr": fnr, "snr": snr},
    )
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()
```

**Also remove** (moved to Issue 6):
- `get_byggesaker(self, property_id: int)` (line 95-108)
- `get_case_documents(self, case_id: str)` (line 110-123)

**Acceptance:** No method on MatrikkelClient accepts a serial `property_id: int`.

---

### Sub-issue 5.4: Add `kommunenr` to auth SQL queries

**CRITICAL** — without this, the frontend cannot construct matrikkelnummer objects.

In `backend/app/repositories/auth.py`, update both SQL queries:

**`get_properties_by_personnr`** (line 64-82) — add `data->>'KOMMUNENR' AS kommunenr`:
```python
rows = db.execute(text("""
    SELECT id,
           data->>'VEGADRESSE' AS address,
           data->>'GNR' AS gnr,
           data->>'BNR' AS bnr,
           data->>'FNR' AS fnr,
           data->>'SNR' AS snr,
           data->>'KOMMUNENR' AS kommunenr
    FROM matrikkel_eiendommer
    WHERE data->'eierforhold' @> CAST(:personnr_filter AS jsonb)
"""), ...).fetchall()
return [
    {"address": r[1], "gnr": r[2], "bnr": r[3], "fnr": r[4], "snr": r[5], "kommunenr": r[6]}
    for r in rows
]
```

**`get_properties_by_orgnr`** (line 138-167) — same change.

Also update `get_owner_login_profile_by_personnr` (line 6-51) to stop returning `owner_id` (serial ID). The frontend does not need it — it proceeds to property selection by personnummer.

**Acceptance:** Auth property responses include `kommunenr`. No `id` field. Login response does not return `owner_id`.

---

### Sub-issue 5.5: Remove `GET /owner/{owner_id}/properties` route

The route at `backend/app/routes/property_info.py:33` uses `owner_id: int` (serial ID). Its repository method (`get_properties_by_owner`) is also unimplemented — it ignores `owner_id` and returns all properties.

**Remove** this route entirely. Property lookup by owner is now handled by `POST /eiendommer/sok` (Issue 4).

**Acceptance:** Route removed. No `owner_id` parameter in any endpoint.

---

### Sub-issue 5.6: Remove serial ID from API responses

In `backend/app/schema/property_info.py:24-36`:
```python
class PropertyInfoResponse(BaseModel):
    id: int | None = None          # REMOVE this field
    address: str | None = None
    ...
    gnr: str | None = None
    bnr: str | None = None
    fnr: str | None = None
    snr: str | None = None
    municipality_id: str | None = None
```

In `backend/app/routes/auth.py` — update `get_properties_by_personnr` and `get_properties_by_orgnr` return dicts to exclude `id`:
```python
# Current (line 79-82):
return [{"id": r[0], "address": r[1], "gnr": r[2], ...} for r in rows]
# New:
return [{"address": r[1], "gnr": r[2], "bnr": r[3], "fnr": r[4], "snr": r[5], "kommunenr": ...} for r in rows]
```

**Acceptance:** No `id` field in any API response. All responses use gnr/bnr/fnr/snr.

---

### Sub-issue 5.7: Frontend — switch from selectedPropertyId to matrikkelnummer

**Type changes** in `frontend/src/App.tsx`:

```typescript
// Current (line 74):
type PropertyOption = { id: number; label: string; };

// New:
type PropertyOption = {
  gnr: number;
  bnr: number;
  fnr: number;
  snr: number;
  kommunenr: string;
  label: string;
};

// Current: selectedPropertyId: number | null
// New: selectedProperty: PropertyOption | null
```

**API call changes** — all 7 endpoints in App.tsx:

```typescript
// Current (line 516):
fetch(`${apiBaseUrl}/property/${selectedPropertyId}`)

// New:
const p = selectedProperty;
fetch(`${apiBaseUrl}/property/${p.kommunenr}/${p.gnr}/${p.bnr}/${p.fnr}/${p.snr}`)
```

**localStorage** — change key and format:
```typescript
// Current: localStorage stores "1" (integer as string)
// New: localStorage stores JSON string of {kommunenr, gnr, bnr, fnr, snr}
```

**Cache maps** — change key type:
```typescript
// Current: Map<number, PropertyResponse>
// New: Map<string, PropertyResponse>  // key = "kommunenr-gnr/bnr/fnr/snr"
```

**Child component props** — update all pages:

| Component | Current prop | New prop |
|-----------|-------------|---------|
| `ByggesakPage` | `selectedPropertyId?: number` | `selectedProperty?: PropertyOption` |
| `AvfallPage` | `selectedPropertyId?: number` | `selectedProperty?: PropertyOption` |
| `NabolistePage` | `propertyId: number` | `selectedProperty?: PropertyOption` |
| `AvgifterPage` | `selectedPropertyId?: number` | `selectedProperty?: PropertyOption` |
| `AddressDropdown` | `selectedPropertyId: number` | `selectedProperty?: PropertyOption` |
| `PropertyChooser` | `selectedPropertyId?: number` | `selectedProperty?: PropertyOption` |

**ByggesakPage** — special case: switches to POST:
```typescript
// Current:
fetch(`/api/property/${selectedPropertyId}/building-cases`)

// New:
fetch(`/api/byggesaker/sok`, {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    kommunenummer: selectedProperty.kommunenr,
    gardsnummer: selectedProperty.gnr,
    bruksnummer: selectedProperty.bnr,
    festenummer: selectedProperty.fnr,
    seksjonsnummer: selectedProperty.snr,
  }),
})
```

**Acceptance:** No `number` type property ID anywhere in frontend. All API calls use matrikkelnummer path/body params.

---

## Issue 6: Migrate Byggesak Data — Cleanup

### Sub-issue 6.1: Remove byggesak methods from MatrikkelClient

In `backend/app/clients/matrikkel_client.py`, remove:
- `get_byggesaker(self, property_id: int)` (lines 95-108)
- `get_case_documents(self, case_id: str)` (lines 110-123)

These are now handled by `FiksInnsynClient`.

---

### Sub-issue 6.2: Remove old byggesak route

In `backend/app/routes/byggesak.py`, remove:
- `GET /property/{property_id}/building-cases` handler (lines 13-16)

Keep only the new `POST /byggesaker/sok` route (from Issue 3).

---

### Sub-issue 6.3: Remove byggesak routes from matrikkel-service

In `matrikkel-service/app/routes/byggesak.py`, remove:
- `GET /eiendom/{id}/byggesaker` (lines 13-30)
- `GET /byggesak/{case_id}/dokumenter` (lines 33-44)

Remove router registration from `matrikkel-service/app/main.py` (line 18).

Remove `matrikkel-service/app/repositories/byggesak.py` entirely.

Vedtak data stays in matrikkel JSONB — it's still served via `bygg` endpoint's `VedtakResponse` in `matrikkel-service/app/schema/bygg.py:34-42`.

---

### Sub-issue 6.4: Verify no serial ID references remain

Search entire codebase for:
- `property_id` in route paths
- `get_eiendom_by_id` calls
- `selectedPropertyId` in frontend
- `owner_id` in API responses

**Acceptance:** Zero hits for serial ID patterns in public API surface.

---

## Implementation Order

```
Phase 1 (parallel):
  Issue 1: Sub-issues 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
  Issue 2: Sub-issues 2.1 → 2.2 → 2.3

Phase 2 (parallel, after Phase 1):
  Issue 3: Sub-issues 3.1 → 3.2 → 3.3 → 3.4
  Issue 4: Sub-issues 4.1 → 4.2

Phase 3 (after Phase 2):
  Issue 5: Sub-issues 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 5.7

Phase 4 (after Phase 3 verified):
  Issue 6: Sub-issues 6.1 → 6.2 → 6.3 → 6.4
    Also: rename FiksByggesakRepository → ByggesakRepository and delete old one
```

## Verification

After each phase:
1. `docker compose up --build` — all services start
2. `GET /health` on all services returns 200
3. Login flow works end-to-end (personnummer → properties → select → view data)
4. Byggesak page shows archive cases from arkiv-service
5. All other pages (avfall, naboliste, avgifter) functional with matrikkelnummer
6. No serial `id` in any API response (grep codebase)
