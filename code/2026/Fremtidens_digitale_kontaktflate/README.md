# Fremtidens Digitale Kontaktflate

Full-stack web application that gives citizens access to property information from the Norwegian cadastral system. Built with a React/TypeScript frontend, four FastAPI services, a CMS service, Wagtail CMS, and a PostgreSQL/PostGIS database.

## Architecture

| Service               | Description                                                                    | Port |
| --------------------- | ------------------------------------------------------------------------------ | ---- |
| **frontend**          | React + TypeScript (Vite) — property information UI                            | 5001 |
| **backend**           | FastAPI — main API (property, map, neighbors, waste, permits, fees)            | 8000 |
| **matrikkel-service** | FastAPI — cadastral data API (properties, buildings, owners, neighbors)        | 8001 |
| **wagtail-cms**       | Django + Wagtail — CMS admin and content API                                   | 8002 |
| **cms-service**       | FastAPI — wrapper around Wagtail CMS API                                       | 8003 |
| **renovasjon-service**| FastAPI — waste collection API (routes to municipal providers)                 | 8004 |
| **arkiv-service**     | FastAPI — FIKS Innsyn mock (building cases and documents)                      | 8005 |
| **database**          | PostgreSQL + PostGIS                                                            | 5432 |

## Logging contract

Application logs must not contain personally identifiable information at `INFO` or above. Full addresses, full owner names, and full matrikkelnummer dicts are masked (`adr=***`, `mnr=K/G/B`, `personnr: ***1234`). Operational fields — method, path, status, duration, kommune number, counts — stay at `INFO`. Run `scripts/scan-logs-for-pii.sh` against a captured log sample (for example `docker compose logs --tail 500 | scripts/scan-logs-for-pii.sh`) to verify. See issue #546 for the full rationale.

## Prerequisites

- Docker and Docker Compose installed

## Quick Start

1. **Configure environment files**

   Create `database/db.env`:
   ```
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=your_database_name
   ```

   Create `backend/backend.env`:
   ```
   DATABASE_URL=postgresql://<user>:<password>@database:5432/<dbname>
   MATRIKKEL_SERVICE_URL=http://matrikkel-service:8001
   FIKS_MATRIKKEL_URL=http://matrikkel-service:8001
   FIKS_INNSYN_URL=http://arkiv-service:8005
   CORS_ORIGINS=http://localhost:5001
   CMS_ADAPTER=static
   DEFAULT_MUNICIPALITY=4204
   WAGTAIL_CMS_URL=http://wagtail-cms:8002
   ```

   Create `matrikkel-service/matrikkel.env`:
   ```
   DATABASE_URL=postgresql://<user>:<password>@database:5432/<dbname>
   ```

   Create `arkiv-service/arkiv.env`:
   ```
   DATABASE_URL=postgresql://<user>:<password>@database:5432/<dbname>
   ```

   Create `renovasjon-service/renovasjon-service.env`:
   ```
   CORS_ORIGINS=http://localhost:5001,http://127.0.0.1:5001
   NORKART_APP_KEY=your_norkart_app_key
   HTTP_TIMEOUT=10
   ```

   Create `wagtail-cms/cms.env`:
   ```
   DJANGO_SECRET_KEY=change-this-in-production
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,wagtail-cms
   POSTGRES_DB=cms_db
   POSTGRES_USER=<user>
   POSTGRES_PASSWORD=<password>
   POSTGRES_HOST=database
   POSTGRES_PORT=5432
   CORS_ALLOWED_ORIGINS=http://localhost:5001,http://127.0.0.1:5001
   ```

   Create `cms-service/cms-service.env`:
   ```
   WAGTAIL_CMS_URL=http://wagtail-cms:8002
   ```

2. **Create the database data directory**

   ```bash
   mkdir -p database/data/postgres
   ```

3. **Start everything**

   ```bash
   docker compose up
   ```

4. **Stop everything**

   ```bash
   docker compose down
   ```

   Database data persists in `database/data/postgres/` across restarts.

## Features

| Module              | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| **Login**           | Authentication with national ID number, role selection (person/org)  |
| **My Property**     | Property details, interactive map (Leaflet), building information    |
| **Waste**           | Pickup schedules for waste categories (residual, food, paper, etc.)  |
| **Building Permits**| Building permit information and case status                          |
| **Neighbors**       | Neighboring properties within a configurable radius                  |
| **Fees**            | Municipal fees and charges overview                                  |

## API Documentation

FastAPI auto-generates interactive docs:

- Backend Swagger UI: http://localhost:8000/docs
- Backend ReDoc: http://localhost:8000/redoc
- Matrikkel-service Swagger UI: http://localhost:8001/docs
- Matrikkel-service ReDoc: http://localhost:8001/redoc
- CMS-service Swagger UI: http://localhost:8003/docs
- Arkiv-service Swagger UI: http://localhost:8005/docs
- Wagtail admin: http://localhost:8002/admin
- Wagtail API: http://localhost:8002/api/v2/

### Backend endpoints

| Method | Route                                                              | Description                              |
| ------ | ------------------------------------------------------------------ | ---------------------------------------- |
| POST   | `/auth/login`                                                      | Authenticate with fødselsnummer          |
| POST   | `/auth/roles`                                                      | Get roles for a person                   |
| GET    | `/auth/properties`                                                 | Get properties for active role           |
| POST   | `/eiendommer/sok`                                                  | Find properties by fødselsnummer/orgnr   |
| GET    | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}`                   | Property info                            |
| GET    | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/buildings`         | Building details                         |
| GET    | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/neighbors`         | Neighboring properties                   |
| GET    | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/municipal-fees`    | Municipal fees                           |
| GET    | `/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/renovasjon`        | Waste collection schedule                |
| GET    | `/map/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}`                        | Map coordinates                          |
| POST   | `/byggesaker/sok`                                                  | Search building cases (FIKS Innsyn)      |
| GET    | `/byggesaker/{sak_id}/dokumenter`                                 | Documents for a building case            |
| GET    | `/municipality-config/{municipality_id}`                          | Municipality theme config                |
| GET    | `/page-content/{slug}`, `/tooltips`, `/media/{path}`              | CMS content                              |

### Matrikkel-service endpoints

| Method | Path                                                       | Description                                     |
| ------ | ---------------------------------------------------------- | ----------------------------------------------- |
| GET    | `/eiendommer`                                              | List all properties                             |
| GET    | `/eiendom?gnr=&bnr=&fnr=&snr=`                            | Get property by cadastral identifiers           |
| GET    | `/eiendom/{gnr}/{bnr}/{fnr}/{snr}/bygg`                   | Buildings, floors and units for a property      |
| GET    | `/eiendom/{gnr}/{bnr}/{fnr}/{snr}/eiere`                  | Ownership information for a property            |
| GET    | `/eiendom/{gnr}/{bnr}/{fnr}/{snr}/naboer?radius=25`       | Neighboring properties within a radius (m)      |
| GET    | `/eiendom/{gnr}/{bnr}/{fnr}/{snr}/avgifter`               | Fees for a property                             |
| POST   | `/matrikkel-eier/api/v1/{fiksOrgId}/finn-eiendommer`      | Find properties by fødselsnummer/orgnr (FIKS)   |
| POST   | `/matrikkel-eier/api/v1/{fiksOrgId}/finn-eiere`           | Find owners by matrikkelnummer (FIKS)           |

### Arkiv-service endpoints

| Method | Path                                           | Description                                     |
| ------ | ---------------------------------------------- | ----------------------------------------------- |
| POST   | `/innsyn-sok/api/v1/eiendom/sok`               | Search building cases by matrikkelnummer        |
| GET    | `/innsyn-sok/api/v1/dokument/{dokumentId}`     | Get documents for a building case               |

## Local Development (without Docker)

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Matrikkel-service:**
```bash
cd matrikkel-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Wagtail CMS:**
```bash
cd wagtail-cms
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
uvicorn config.asgi:application --host 0.0.0.0 --port 8002 --reload
```

**CMS-service:**
```bash
cd cms-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

**Renovasjon-service:**
```bash
cd renovasjon-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8004
```

**Arkiv-service:**
```bash
cd arkiv-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8005
```

## CI/CD

- **CI**: Build and test runs on push to the `production` branch (GitHub Actions)
- **Container Registry**: Docker images published to GitHub Container Registry (GHCR)
- **Production**: Traefik reverse proxy, deployed via `docker-compose.prod.yml`

## Tech Stack

| Layer      | Technology                                     |
| ---------- | ---------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Leaflet            |
| Backend    | FastAPI, SQLAlchemy, httpx, Pydantic            |
| CMS        | Django, Wagtail, Django REST Framework          |
| Database   | PostgreSQL 14, PostGIS 3                        |
| Infra      | Docker, Docker Compose, Traefik, GitHub Actions |

## Project Structure

```
├── frontend/                  # React + TypeScript (Vite)
│   └── src/
│       ├── pages/             # Login, Avfall, Avgifter, Byggesak, Naboliste
│       ├── components/        # BuildingDetails, Footer, Header, Map,
│       │                        NavigationBar, PropertyChooser, PropertyInfo, Naboliste
│       ├── context/           # KommuneConfigContext (municipality theming)
│       └── types/             # TypeScript type definitions
├── backend/                   # FastAPI — main API
│   └── app/
│       ├── routes/            # auth, property_info, map, building_details,
│       │                        waste_collection, neighbor_list, byggesak,
│       │                        eiendommer, avgifter, cms, municipality_config
│       ├── repositories/      # Data access layer
│       ├── clients/           # matrikkel_client, cms_client, renovasjon_client,
│       │                        fiks_innsyn_client, fiks_matrikkel_client
│       └── schema/            # Pydantic models
├── matrikkel-service/         # FastAPI — cadastral data + FIKS Matrikkel Eier
│   └── app/
│       ├── routes/            # eiendom, bygg, eiere, naboer, avgifter,
│       │                        fiks_matrikkel_eier
│       └── repositories/      # Data access layer
├── arkiv-service/             # FastAPI — FIKS Innsyn mock (building cases)
│   └── app/
│       ├── routes/            # innsyn
│       ├── repositories/      # Data access layer
│       └── schema/            # Pydantic models
├── renovasjon-service/        # FastAPI — waste collection
│   └── app/
│       ├── routes/            # renovasjon
│       ├── repositories/      # Provider dispatch
│       ├── providers/         # norkart, oslo, stavanger, avfallsor, bir
│       ├── clients/           # kartverket
│       └── schema/            # Pydantic models
├── cms-service/               # FastAPI — CMS wrapper
├── wagtail-cms/               # Django + Wagtail CMS
│   ├── config/                # Django settings, URLs, ASGI
│   └── cms_app/               # Content types and admin
├── database/                  # PostgreSQL + PostGIS
│   └── prod_data/             # SQL init scripts
├── docs/                      # Project documentation
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
└── .github/workflows/         # CI/CD pipelines
```
