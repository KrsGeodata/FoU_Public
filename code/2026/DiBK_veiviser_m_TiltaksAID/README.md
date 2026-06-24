# Tiltaksaid 3.2 - Trenger jeg å søke i det hele tatt?

En webapplikasjon for byggeplanlegging som gir brukeren avanserte verktøy for å analysere byggemuligheter. Applikasjonen gjør det mulig å måle avstander, beregne byggeareal og hente inn relevante eiendoms- og reguleringsdata. Basert på disse analysene kan brukeren få en vurdering av om tiltaket er søknadspliktig, eller om det kan gjennomføres uten å sende byggesøknad.

- **Subdomene**: (http://dibkveiviser.geokrs.no)

## Innholdsfortegnelse

- [Funksjoner](#funksjoner)
- [Teknologi Stack](#teknologi-stack)
- [Arkitektur](#arkitektur)
- [Supabase Oppsett og Database](#supabase-oppsett-og-database)
- [Komme i gang](#komme-i-gang)
- [API Endepunkter](#api-endepunkter)
- [Kontaktinformasjon](#utviklere)

## Funksjoner

### **Kartfunksjonalitet**

- Interaktivt kart med Leaflet.js og norsk koordinatsystem (EPSG:25832)
- Flere WMS-lag:
- Norges Grunnkart fra Geonorge: https://wms.geonorge.no/skwms1/wms.norges_grunnkart?
- Matrikkelkart med eiendomsgrenser: https://wms.geonorge.no/skwms1/wms.matrikkelkart?
- FKB bygninger og infrastruktur: https://wms.geonorge.no/skwms1/wms.fkb?"

Applikasjonen benytter Norges grunnkart som bakgrunnslag i kartløsningen. Tjenesten leveres via WMS fra Kartverket gjennom organization.
Dette er et standard WMS (Web Map Service)-endepunkt som returnerer kartbilder basert på forespurte parametere (BBOX, CRS, WIDTH, HEIGHT osv.).

- **Endepunkter og url**:

Ettersom applikasjonen er deployet på et eget subdomene via en virtuell maskin (VM), hvor applikasjonen kjøres gjennom Docker Compose, ønsket vi å unngå å måtte endre endepunkt manuelt hver gang vi bytter mellom lokal utvikling og produksjonsmiljø. Derfor har vi konfigurert et miljøvariabel-basert oppsett som registrerer om applikasjonen kjører i Docker-modus eller lokalt.

Dette håndteres gjennom miljøfilene .env.docker og .env.local, som inneholder ulike konfigurasjonsverdier for henholdsvis produksjons- og utviklingsmiljø. I tillegg er build-kommandoen i package.json og konfigurasjonen i docker-compose.yml satt opp til å bruke riktig miljøfil basert på hvordan applikasjonen startes.

Når applikasjonen kjører i Docker (produksjon), benyttes backend-URL-en http://51.120.9.87/api/eksempelendepunkt. Dersom applikasjonen kjøres lokalt, brukes i stedet http://127.0.0.1:8000/eksempelendepunkt.

Dette gjør at vi kan bytte mellom miljøer uten manuelle endringer i kildekoden, noe som forenkler både utviklingsprosessen og deploy til produksjon.

https://wms.geonorge.no/skwms1/wms.norges_grunnkart? er url som brukes som grunnkart.

### **Eiendomsanalyse og Søk**

- **Eiendomssøk**: Brukeren kan søke opp en eiendom ved hjelp av adresse. Applikasjonen henter automatisk tilhørende matrikkelnummer via backend-API og benytter dette til å generere en polygonbasert fremstilling av eiendommens grenser.
<!-- - **Arealberegning**: Automatisk utregning av eiendomsareal og bygningsareal -->

### **Spatial Analyse og Planlegging**

- **Avstandsanalyse**: Beregning av avstand til vei, nabobygg og eiendomsgrense
- **Tegneverktøy**: Interaktive verktøy for tegning av polygoner og former
- **Linjalverktøy**: Interaktiv avstandsmåling på kartet med vinkelvisning
- **BYA-kalkulator**: Tegning og beregning av bebygd areal (BYA) direkte i kart

### **Dataintegrasjon og API**

- **Supabase-integrasjon**: Sanntids databasekobling med PostgreSQL
- **WMS/WMTS-tjenester**: Integrasjon med norske nasjonale karttjenester via proxy
- **API-proxier**: Sikker håndtering av eksterne WMS/WMTS-tjenester for å unngå CORS-problemer
- **Geodataanalyse**: Bruk av Turf.js for avanserte geografiske beregninger

### **Veiviser / Spørreskjema**

- Flerseksjons spørreskjema med betingede spørsmål (`showWhen`-logikk)
- Automatisk besvarelse av spørsmål basert på tegningsresultater (avstandsanalyse)
- Tidlig avslutning med forklaring dersom søknad er påkrevd
- Seksjonsoversikt og fremdriftsindikator

### **Eksport og Sammendrag**

- **PDF-eksport**: Generer nedlastbart PDF-sammendrag med kart­skjermbilde og svar (`PDFComponent/`)
- **Kartskjermbilde**: Tar bilde av tegnet polygon på kartet og legger det ved PDF-en
- **Interaktiv tutorial**: Veiledet tour for nye brukere via `react-joyride` (`MapFileTutorial.tsx`)

## API Endepunkter

#### `GET /`

- **Beskrivelse**: Helse-sjekk, returnerer status for API-et.

#### `GET /PropertiesValues`

- **Beskrivelse**: Henter eiendomsinformasjon basert på adresse- eller tekstsøk. Returnerer adresseopplysninger, kommunenavn, postnummer, representasjonspunkt (lat/lon) og matrikkelnummer.
- **Query params**: `addressQuery` (string) – Søketekst for adresse

#### `GET /PostGISfn`

- **Beskrivelse**: Henter geografisk informasjon for en eiendom basert på matrikkelnummer via Supabase RPC `pi_allowed_building_area5`. Returnerer GeoJSON for eiendommens grenser og tillatt byggeareal.
- **Query params**: `matrikkelNr` (string) – Matrikkelnummer (format: gårdsnummer/bruksnummer)

#### `GET /PostGISfnShortestLines`

#### `GET /GetTables`

#### `GET /convertToSummaryArray`

#### `GET /exitarea/FetchAllAvkjorsler`

- **Beskrivelse**: Henter alle avkjørsler/veiforbindelser som GeoJSON.

#### `POST /exitarea/AvkjorslerByPlanid`

- **Beskrivelse**: Filtrerer avkjørsler basert på plan-ID.

- **Metode**: GET
- **Beskrivelse**: Henter eiendomsinformasjon basert på adresse- eller tekstsøk. Returnerer adresseopplysninger, kommunenavn, postnummer, representasjonspunkt (lat/lon) og matrikkelnummer (gårds- og bruksnummer).
- **Query params**: addressQuery (string) – Søketekst for adresse

#### `http://localhost:8000/PostGISfn`

- **Metode**: GET
- **Beskrivelse**: Henter geografisk informasjon for en eiendom basert på matrikkelnummer. Returnerer GeoJSON for eiendommens grenser samt GeoJSON for tillatt byggeareal innenfor eiendommen.
- **Query params**: matrikkelNr (string) – Matrikkelnummer (format: gårdsnummer/bruksnummer)

#### `GET /coords/wms/proxy`

- **Beskrivelse**: Proxy for WMS-kartlag (Geonorge, Matrikkel, FKB mfl.) for å unngå CORS-problemer i nettleser.
- **Query params**: WMS-standard parametere (SERVICE, REQUEST, BBOX, WIDTH, HEIGHT, CRS, LAYERS, osv.)

#### `GET /coords/wmts/proxy`

- **Beskrivelse**: Proxy for WMTS-kartlag (HD-kart).
- **Query params**: WMTS-standard parametere

## Teknologi Stack

### **Frontend**

- **React 19.0.0-rc.1** - Brukergrensesnittbibliotek
- **TypeScript 5.9.3** - Typesikker utvikling
- **Tailwind CSS 4** - Utility-first CSS-rammeverk
- **react-router-dom 7** - Klient-side ruting
- **axios** - HTTP-klient for API-kall
- **MUI (Material UI) 7** - UI-komponentbibliotek
- **@react-pdf/renderer 4** - PDF-generering
- **react-joyride 3** - Interaktiv tutorial/veiledet tour

### **Kart og GIS**

- **Leaflet 1.9.4** - Interaktivt kartbibliotek
- **Leaflet Draw** - Tegne- og redigeringsverktøy
- **Proj4Leaflet** - Koordinatsystemtransformasjoner
- **Turf.js 7** - Romlig analyse og geometrioperasjoner
- **leaflet-simple-map-screenshoter** - Kartskjermbilde-funksjonalitet

### **Backend og Database**

- **Python => FastAPI** - API-endepunkter, kjørers i localhost:8000
- **Supabase** - PostgreSQL-database med sanntidsfunksjonalitet
- **WMS Proxy-tjenester** - Sikker integrasjon med eksterne karttjenester

### **DevOps og Deployment**

- **Docker** - Containerisering
- **GitHub Actions** - CI/CD-pipeline
- **Traefik** - Reverse proxy og lastbalansering

## Arkitektur

```
                     ┌────────────────────────────┐
                     │        Bruker / Klient     │
                     │        Nettleser           │
                     └────────────┬───────────────┘
                                  │ HTTP
                                  ▼
                     ┌────────────────────────────┐
                     │        Subdomene / DNS     │
                     │     (http://51.120.9.87/)  │
                     └────────────┬───────────────┘
                                  │
                                  ▼
                ┌────────────────────────────────────────────┐
                │                Azure VM                    │
                │                                            │
                │        Docker Compose Miljø                │
                │                                            │
                │   ┌────────────────────────────────────┐   │
                │   │            Traefik                 │   │
                │   │ Reverse Proxy / SSL / Routing      │   │
                │   └──────────────┬─────────────────────┘   │
                │                  │                         │
                │        ┌─────────┴─────────┐               │
                │        ▼                   ▼               │
                │  ┌──────────────┐   ┌──────────────┐       │
                │  │   Frontend   │   │   Backend    │       │
                │  │   React      │   │ FastAPI      │       │
                │  │   (Docker)   │   │ (Docker)     │       │
                │  └──────────────┘   └──────┬───────┘       │
                │                            │               │
                └────────────────────────────┼───────────────┘
                                             │
                                             ▼
                                  ┌─────────────────┐
                                  │    Supabase     │
                                  │ PostgreSQL DB   │
                                  └─────────────────┘
                                             │
                                             ▼
                                  ┌─────────────────┐
                                  │ Eksterne APIer  │
                                  │ WMS / Geonorge  │
                                  └─────────────────┘


                        Lokal utvikling (Testmiljø)

                        ┌──────────────────────┐
                        │   Frontend (React)   │
                        │   localhost:3000     │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Backend FastAPI    │
                        │   localhost:8000     │
                        └──────────┬───────────┘
                                   │
                                   ▼
                              Supabase
                           PostgresSQL DB
```

### **Komponentstruktur**

```
801_26_dibk-veiviser/
│
├── .github/                     # CI/CD (GitHub Actions workflows)
├── .gitignore
├── a                            # Lokal tekstfil i rotmappen
├── docker-compose.yml           # Container-orkestrering
├── package-lock.json
├── README.md
│
├── backend_api/                 # Python FastAPI backend
│   ├── main.py                  # API entry point
│   ├── maps/                    # Kartrelatert logikk
│   ├── roads/                   # Vei- og avkjørsellogikk
│   ├── survey/                  # Logikk for skjema og JSON-bygging
│   ├── tests/                   # Tester
│   │   └── integration/
│   │       ├── test_coords.py
│   │       └── test_exitarea.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── .env                     # Backend miljøvariabler
│   ├── .python-version
│   └── uv.lock
│
├── frontend/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── questionImages/
│   │   ├── components/
│   │   │   ├── AsideComponent/       # Sidepanel som hoster spørreskjemaet
│   │   │   ├── LoadingAnimation/     # Lasteanimasjon
│   │   │   ├── MapComponent/         # Leaflet-kart, tegneverktøy, BYA og måleverktøy
│   │   │   ├── PDFComponent/         # PDF-generering og eksport
│   │   │   ├── PopupComponent/       # Popup-vinduer
│   │   │   ├── QuestionComponent/    # Veiviser/spørreskjema med betingede spørsmål
│   │   │   ├── SearchBar/            # Adressesøk
│   │   │   ├── SummaryComponent/     # Sammendragsvisning etter analyse
│   │   │   └── TutorialComponent/    # Interaktiv tutorial (react-joyride)
│   │   ├── lib/
│   │   │   ├── DrawingQuestionAnswering/ # Logikk for auto-besvarelse fra tegning
│   │   │   ├── config.ts
│   │   │   ├── map/
│   │   │   ├── oldCode/
│   │   │   └── useDebounce.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── index.tsx
│   │   ├── main.tsx
│   │   └── Navigator.tsx            # Hoved-layout (kart + spørreskjema)
│   │
│   ├── .env.local               # Lokal utvikling
│   ├── .env.docker              # Docker/produksjon
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── ...
│
├── dokumenter for timeføring og rapporter/
│
└── ...

```

## Supabase Oppsett og Database

### **Database Arkitektur**

Applikasjonen bruker Supabase som backend-as-a-service med PostgreSQL som underliggende database. Inne i Supabase under "Functions" finner du de innebygde funksjonene:

- `pi_allowed_building_area5` – Beregner tillatt byggeareal og returnerer GeoJSON for eiendommens grenser
- `pi_get_nearby_features` – Beregner nærmelsesstrekker til nabobygg, eiendomsgrenser, veier og faresoner

## Komme i gang

### **Forutsetninger**

- Node.js 18 eller senere
- Python => fastapi installert
- Node Package Manager (npm)
- Supabase-konto og prosjekt
- Tilgang til norske WMS-tjenester

### **Installasjon**

1. **Klon repositoriet**

   ```bash
   git clone https://github.com/KrsGeodata/801_26_dibk-veiviser.git
   cd 801_26_dibk-veiviser
   ```

2. **Installer avhengigheter for frontend**
   cd 801_26_dibk-veiviser/frontend

   ```bash
   npm install
   npm run dev
   ```

   Frontend applikasjonen vil være tilgjengelig på `http://localhost:5173`

3. **Installer avhengigheter for backend**
   cd 801_26_dibk-veiviser/backend_api

   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -e .
   uvicorn main:app --reload
   ```

   Backend vil kjøre på http://localhost:8000/
   Anbefaler å bruke http://localhost:8000/docs

   For å kunne bruke funksjonene som er avhengige av databasen, og det gjelder en betydelig del av funksjonaliteten, må du ha en Supabase‑nøkkel. Følg derfor steg 4 for å hente og konfigurere denne.

4. **Miljøoppsett (backend)**

   Lag en fil i python backend som heter
   .env

   Rediger `.env` med dine Supabase-legitimasjoner:

   ```env
   NEXT_PUBLIC_SUPABASE_KEY=din-anon-nøkkel
   NEXT_PUBLIC_SUPABASE_URL=https://ditt-prosjekt-id.supabase.co
   ```

   Bruk FastAPI til å hente ut nøkkelen du har satt i .env-filen ved hjelp av dotenv, slik at tilkoblingen til databasen fungerer korrekt.

5. **Start utviklingsserver**

   ```bash
   npm run dev
   ```

   Applikasjonen vil være tilgjengelig på `http://localhost:5173`

### **Utviklingsfunksjoner**

- **Hot Module Replacement** - Øyeblikkelige oppdateringer under utvikling
- **TypeScript-støtte** - Full typesjekking og IntelliSense
- **ESLint-integrasjon** - Kodekvalitet og stilhåndhevelse
- **Vite Build System** - Rask utviklingsserver og optimalisert produksjonsbygg basert på moderne ES-moduler

## Få tilgang til VM

1. Først må du opprette en mappe med navnet .ssh dersom den ikke allerede finnes.
2. Inne i .ssh-mappen skal det ligge en fil med navnet: id_ed25519_geokrs_team-pi
3. Det er i fil id_ed25519_geokrs_team-pi SSH-nøkkelen skal lagres/ligge. Kontakt veileder i kommunen for tilgang til ssh nøkkel
4. Når nøkkelen er lagt inn, kan du koble til serveren med følgende kommando: ssh team-pi@51.120.9.87 -p 443 -i ~/.ssh/id_ed25519_geokrs_team-pi
5. Når du har fått tilgang, logger du inn på samme måte ved å bruke kommandoen over.
6. Du kan også opprette en config-fil i .ssh-mappen for å konfigurere en kortere og enklere innloggingskommando.

## Deploy frontend og backend til GitHub Pages

### Verktøy som må være installert lokalt:

```bash
# Sjekk om verktøyene er installert
node --version        # Node.js 18+
py --version          #  Python 3.13.5
docker --version      # Docker
ssh -V                # SSH client

```

### Tilganger du trenger:

- GitHub repository tilgang (Admin eller Write)
- SSH tilgang til VM: `team-pi@KrsKom-StudTest-NoEast-VM-01`
- GitHub Personal Access Token (PAT) med `write:packages` og `read:packages` scopes
- Supabase prosjekt tilgang

Applikasjonen bruker GitHub Actions for automatisert deployment:

1. **Trigger**: Push til `main`-branch med endringer i `801_26_dibk-veiviser/`-mappen
2. **Overføring**: Prosjektfilene kopieres til produksjons-VM via SSH (SCP)
3. **Deploy**: Docker-containere bygges og startes på VM-en ved hjelp av Docker Compose

# Deployment Pipeline Guide - 801_26_dibk-veiviser

En guide for neste studentgruppe om hvordan deployment pipelinet fungerer og hvordan dere kan ta over driften.

## Oversikt

Deployment pipelinet består av følgende komponenter:

```
Developer Push → GitHub Actions → Docker Build → GHCR → VM Pull → Traefik → Deployment
```

1. Utvikler pusher kode til `main` branch
2. GitHub Actions trigges automatisk
3. Prosjektfilene kopieres til Azure VM via SSH (SCP)
4. Docker Compose stopper gamle containere og bygger nye images på VM
5. Containerne startes i bakgrunnen
6. Applikasjonen er tilgjengelig på: http://dibkveiviser.geokrs.no/ (IP: 51.120.9.87)

## GitHub Actions Workflow

Workflow-filen ligger i: `.github/workflows/deploy-vm.yml`

### Workflow Struktur

```yaml
name: Deploy to Azure VM

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps: 1. Checkout kode
      2. Kopier prosjektfiler til Azure VM via SCP
      3. Kjør Docker Compose på VM (build + deploy)
      4. Rydd opp gamle Docker images
```

### Viktige Environment Variables i Workflow

Workflow bruker ssh privat nøkkel som vi har definert i deploy-vm.yml filen:

```yaml
key: ${{ secrets.SSH_PRIVATE_KEY }}
```

### Nødvendige Repository Secrets

Gå til GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Følgende secrets må være satt:

| Secret Name                 | Beskrivelse                  | Hvordan få verdien             |
| --------------------------- | ---------------------------- | ------------------------------ |
| `VM_HOST`                   | VM IP eller hostname         | `KrsKom-StudTest-NoEast-VM-01` |
| `VM_USER`                   | SSH brukernavn               | `teampi`                       |
| `VM_SSH_KEY`                | Private SSH nøkkel           | Be KRS om tilgang              |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase prosjekt URL        | Fra Supabase Dashboard         |
| `NEXT_PUBLIC_SUPABASE_KEY`  | Supabase anon key            | Fra Supabase Dashboard         |
| `SUPABASE_URL`              | Supabase URL (uten https://) | Fra Supabase Dashboard         |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key    | Fra Supabase Dashboard         |

### GitHub Secrets

#### Alternativ 1: Via GitHub CLI

```bash
# Oppdater individuell secret
gh secret set SECRET_NAME

# Eksempel: Oppdater Supabase URL
gh secret set NEXT_PUBLIC_SUPABASE_URL
# Paste inn verdien når du blir bedt om det
```

#### Alternativ 2: Via GitHub Web UI

Gå til repository på GitHub.com
Klikk Settings → Secrets and variables → Actions
Finn secret du vil oppdatere (f.eks. NEXT_PUBLIC_SUPABASE_URL)
Klikk Update
Paste inn ny verdi
Klikk Update secret

## Utviklere

| Navn                        | Rolle | Discord       |
| --------------------------- | ----- | ------------- |
| Dennis Akintola             | X     | dakin_kunmi   |
| Elias Dahlen Simonsen       | X     | eliassimonsen |
| Mathias José Bull Jørgensen | X     | bulldog2003   |
| Fredrik Schjølberg Husebø   | X     | fredrikhusebo |
| Aaron Silber                | X     | aaronuia      |

---
