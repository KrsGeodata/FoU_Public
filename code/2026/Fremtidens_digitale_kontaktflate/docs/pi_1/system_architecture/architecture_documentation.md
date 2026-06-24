# Systemarkitektur – Min Eiendom

## 1. Formål
Formålet med dette systemet er å gi innbyggere **ett samlet digitalt grensesnitt** hvor de kan få tilgang til informasjon knyttet til egen eiendom, som regulerings- og kommuneplaner.

**Primære brukere:**
- Innbyggere
- Kommunale saksbehandlere

**Kjernefunksjonalitet:**
- Vise eiendomsdata (eiendoms-ID, gårds- og bruksnummer, areal)
- Vise kart og reguleringsinformasjon
- Tilgang til kommunale gebyrer og fakturaer
- Vise byggesaker og saksstatus
- Sende inn søknader og vedlegg
- Motta meldinger og varsler

---

## 2. Arkitekturnivå
Denne dokumentasjonen fokuserer på en **overordnet systemarkitektur**, og dekker:

- Klient (frontend)
- Applikasjonstjenester (backend)
- Integrasjoner
- Datakilder

---

## 3. Overordnet systemarkitektur
Systemet er basert på en **trelagsarkitektur**:

### Presentasjonslag (Frontend)
Brukergrensesnitt for innbyggere og kommunale saksbehandlere.

### Applikasjonslag (Backend)
Forretningslogikk, tilgangskontroll og integrasjoner.

### Datalag (Datakilder)
Databaser og eksterne systemer.

---

## 4. Integrasjonsarkitektur

**Grunnprinsipp:**  
Frontend kommuniserer aldri direkte med eksterne systemer.  
Alle integrasjoner håndteres utelukkende gjennom backend.

**Typiske integrasjoner:**
- Nasjonal eID-leverandør
- Eiendomsregister
- GIS-tjenester
- Økonomisystemer
- Saksbehandlingssystemer

---

## 5. Sikkerhet og personvern

**Viktige hensyn:**
- Sterke autentiseringsmekanismer
- Rollebasert tilgangskontroll (RBAC)
- Kryptert kommunikasjon (HTTPS)
- Logging og revisjonsspor
- Etterlevelse av GDPR og dataminimering

---

## 6. Foreslått rapportstruktur
- Innledning
- Arkitektonisk tilnærming
- Overordnet systemarkitektur
- Integrasjonsarkitektur
- Sikkerhets- og personvernhensyn
- Arkitektonisk begrunnelse og avveininger

---

## 7. Kort oppsummering
- Bruker en **trelagsarkitektur**
- Tydelig skille mellom frontend, backend og datakilder
- Sentraliserer alle integrasjoner i backend
- Begrunner arkitekturvalg basert på **sikkerhet, skalerbarhet og vedlikeholdbarhet**

---

## 8. Planlagt systemarkitektur

### Systemarkitekturdiagram
<img width="1081" height="1081" alt="SystemArchitectureHighLevel5 drawio" src="https://github.com/user-attachments/assets/4776a1d1-8843-4122-a02a-8729a58f84ba" />


### Oversikt over systemarkitekturen
Prosjektet følger en **lagdelt og tjenesteorientert arkitektur**, hvor backend fungerer som en sentral koordinator mellom frontend, interne tjenester og eksterne API-er. Designet legger vekt på **ansvarsseparasjon** og **skalerbarhet**.

---

## Arkitekturoversikt

Systemet består av følgende hovedkomponenter:

### Frontend (React)
- **Hva det er:** Brukergrensesnittet som folk faktisk ser og klikker på.
- **Hva den gjør:** Henter data fra API‑ene og viser det som en nettside (eiendom, saker, avfall osv).
- **Hvorfor:** Skiller ut presentasjon fra data, slik at vi kan bytte backend/CMS uten å endre UI for mye.
- **Hva den snakker med:** Core API og Wagtail.

### Backend
**Core API (Django + DRF)**

- **Hva det er:** Vår “logikk‑backend” – et API som er laget for faste data som eiendom og byggesaker.
- **Hva den gjør:** Leser data fra databasen og returnerer dem som JSON på egne endepunkter:
    - /api/properties
    - /api/cases
    - /api/waste (henter avfallsdata fra ekstern kilde)
- **Hvorfor:** Gir oss et stabilt, modulært API som kan brukes selv om CMS er borte.
- **Hva den snakker med:** Postgres‑databasen.

### CMS
- **Hva det er:** Redigeringssystemet (admin) hvor de kan endre tekst, bilder og innhold.
- **Hva den gjør:** Lagrer CMS‑innhold (f.eks. intro, hero‑bilde, forklaringer) og gir det ut via Wagtail sitt API:
    - /api/v2/pages
- **Hvorfor:** Gir ikke‑tekniske brukere mulighet til å oppdatere innhold uten å endre kode.
- **Hva den snakker med:** Postgres‑databasen.

### Database
- Containerisert (Docker) for utvikling og testing
- Lagrer test- og mockdata
- Tilpasset produksjonsklare databaser

### Eksterne API-er
- Eksempler: Drømmeplaner, TiltaksAID
- All kommunikasjon håndteres via backend sitt API-lag for abstrahering, sikkerhet og fleksibilitet

---

## Dataflyt
1. Brukeren samhandler med frontend
2. Frontend sender forespørsler til backend
3. Backend behandler forespørselen og henter data fra:
   - Database
   - Eksterne API-er
4. Backend samler og returnerer bearbeidet data
5. Frontend presenterer resultatet for brukeren

---

## Designprinsipper
- **Ansvarsseparasjon:** Hvert lag har et tydelig definert ansvar
- **Sikkerhet som standard:** Sensitiv logikk og legitimasjon holdes i backend
- **Skalerbarhet:** Tjenester kan utvides eller byttes uten å påvirke frontend
- **Vedlikeholdbarhet:** Klare grenser forenkler videre utvikling
