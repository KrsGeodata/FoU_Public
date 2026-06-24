# Mikrodrømmeplan

Nettapplikasjon for Plan og Bygg, Kristiansand kommune. Lar innbyggere sjekke reguleringsplaner og gjeldende byggebestemmelser for eiendommer, og gir saksbehandlere et admingrensesnitt for å administrere plandata.

---

## Innlogging (admin)

| Brukernavn | Passord     |
|------------|-------------|
| `fou`      | `kkfou2026` |

Admin-siden nås på `/login`. Etter innlogging er du på `/reguleringsplaner`.

> Passordet er seeded i `backend/database/migrations/002_admin_auth.sql`. For å endre det, rediger SQL-filen og kjør `docker compose down -v && docker compose up --build` slik at databasen initialiseres på nytt.

---

## Rask start

### Med Docker (anbefalt)

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Tjeneste  | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173        |
| Backend   | http://localhost:8000        |
| API-docs  | http://localhost:8000/docs   |

Første oppstart tar litt tid mens Docker bygger images og installerer avhengigheter. Databasen opprettes og migrations kjøres automatisk.

**Nullstill alt (inkl. database):**

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Kun frontend (uten Docker)

```bash
cd frontend && npm install && npm run dev
```

Krever at backend og database allerede kjører separat.

---

## Miljøvariabler (`.env`)

Filen `.env` ligger i rotkatalogen og brukes av Docker Compose.

| Variabel            | Standard-verdi       | Beskrivelse                                     |
|---------------------|----------------------|-------------------------------------------------|
| `POSTGRES_USER`     | `postgres`           | Databasebruker                                  |
| `POSTGRES_PASSWORD` | `postgres`           | Databasepassord                                 |
| `POSTGRES_DB`       | `mikro_drommeplan`   | Databasenavn                                    |
| `POSTGRES_HOST`     | `db`                 | Hostname til databasetjenesten (Docker service) |
| `POSTGRES_PORT`     | `5432`               | Port til databasen                              |
| `COOKIE_SECURE`     | `false`              | Sett til `true` i produksjon (HTTPS)            |

---

## Arkitektur

```
┌─────────────────────────────────────────────────┐
│  Frontend (React + TypeScript, Vite)             │
│  Bruker-side: wizard for å finne bestemmelser    │
│  Admin-side: CRUD for reguleringsplaner          │
└─────────────────┬───────────────────────────────┘
                  │ HTTP / REST
┌─────────────────▼───────────────────────────────┐
│  Backend (FastAPI, Python)                       │
│  /api/plans  /api/bestemmelser  /api/auth        │
│  /api/galleri  /public/* (statiske bilder)       │
└─────────────────┬───────────────────────────────┘
                  │ psycopg2
┌─────────────────▼───────────────────────────────┐
│  PostgreSQL 15                                   │
│  Migrert med SQL-filer i database/migrations/    │
└─────────────────────────────────────────────────┘
```

### Frontend-ruter

| Sti                                             | Side                                      | Krever innlogging |
|-------------------------------------------------|-------------------------------------------|-------------------|
| `/`                                             | Bruker-side (drømmeplaner-veiviser)        | Nei               |
| `/login`                                        | Admin-innlogging                          | Nei               |
| `/reguleringsplaner`                            | Oversikt over reguleringsplaner           | Ja                |
| `/reguleringsplaner/opprett`                    | Opprett ny reguleringsplan                | Ja                |
| `/reguleringsplaner/plan/:planId/bestemmelser`  | Rediger bestemmelser for en plan          | Ja                |

### Backend-endepunkter

**Åpne (ingen autentisering):**

| Metode | URL                           | Beskrivelse                              |
|--------|-------------------------------|------------------------------------------|
| GET    | `/api/plans`                  | Hent alle aktive reguleringsplaner       |
| GET    | `/api/plans/{plan_id}`        | Hent detaljer for én plan                |
| GET    | `/api/planregister/search`    | Søk i planregisteret (autocomplete)      |
| GET    | `/api/hensynssoner`           | Hent tilgjengelige hensynssoner          |
| GET    | `/api/formalkoder`            | Hent formålskoder gruppert               |
| POST   | `/api/auth/login`             | Logg inn som admin                       |
| POST   | `/api/auth/logout`            | Logg ut                                  |
| GET    | `/api/auth/me`                | Sjekk innlogget bruker                   |

**Krever admin-sesjon:**

| Metode | URL                                         | Beskrivelse                     |
|--------|---------------------------------------------|---------------------------------|
| POST   | `/api/plans`                                | Opprett reguleringsplan         |
| PUT    | `/api/plans/{plan_id}`                      | Oppdater reguleringsplan        |
| DELETE | `/api/plans/{plan_id}`                      | Slett reguleringsplan           |
| POST   | `/api/plans/{plan_id}/bestemmelser`         | Legg til bestemmelse            |
| PUT    | `/api/bestemmelser/{bestemmelse_id}`        | Oppdater bestemmelse            |
| DELETE | `/api/bestemmelser/{bestemmelse_id}`        | Slett bestemmelse               |

---

## Database

Skjemaet bygges opp av SQL-migrasjonsfiler i `backend/database/migrations/`, kjørt i navnerekkefølge ved oppstart:

| Fil                              | Innhold                                               |
|----------------------------------|-------------------------------------------------------|
| `001_init_schema.sql`            | Hovedtabeller: `planregister`, `felt`, `tomt`, `bestemmelse` m.fl. |
| `002_admin_auth.sql`             | Auth-tabeller + standard admin-bruker (`fou`)         |
| `003_seedd_data.sql`             | Seed-data (hensynssoner, tiltaktyper, tema)           |
| `004_add_formal_codes.sql`       | Tabell for formålskoder                               |
| `005_seed_formal_codes.sql`      | Seed for formålskoder                                 |
| `006_create_galleri_tables.sql`  | Galleri-tabeller                                      |
| `007_seed_datafelt_types.sql`    | Seed for datafelt-typer                               |
| `008_seed_galleri_data.sql`      | Seed for galleri-data                                 |
| `009_create_bestemmelse_galleri.sql` | Kobling mellom bestemmelser og galleri           |

Planregisteret importeres fra CSV (`backend/database/planregister.csv`) automatisk ved oppstart.

### Datamodell (forenklet)

```
planregister (plan)
  └── felt (delområde)
        └── tomt (eiendom)

bestemmelse  ──── tema_tittel ──── tema_kategori
             ──── bestemmelse_scope (plan/felt/tomt)
             ──── bestemmelse_tiltaktype
             ──── bestemmelse_galleri ──── galleri
```

---

## Autentisering

Admin-autentisering bruker sesjonsbaserte HTTP-only cookies:

1. `POST /api/auth/login` verifiserer brukernavn og bcrypt-hashet passord mot `admin_user`-tabellen.
2. Et tilfeldig sesjonstoken genereres, hashes med SHA-256 og lagres i `admin_session`-tabellen.
3. Tokenet settes som en `HttpOnly`-cookie (`admin_session`) med 12 timers varighet.
4. Beskyttede endepunkter kaller `require_admin()` som validerer cookie mot databasen.

---

## Produksjon (geokrs.no)

Produksjonsmiljøet kjøres via `docker-compose.yml` (uten `.dev`) og henter ferdige Docker-images fra GitHub Container Registry. Traefik brukes som reverse proxy:

- Frontend: `geokrs.no/mikro-drommeplan`
- API: `geokrs.no/mikro-drommeplan/api`

CI/CD kjøres via GitHub Actions (`.github/workflows/`).

---

## Teknologier

| Lag        | Teknologi                         |
|------------|-----------------------------------|
| Frontend   | React 18, TypeScript, Vite        |
| Backend    | Python 3, FastAPI, psycopg2       |
| Database   | PostgreSQL 15                     |
| Hosting    | Docker, Traefik, GitHub Actions   |

- Uses React + Typescript (Vite) and a Python backend
- Docker handles the database
