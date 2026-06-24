# Møtereferat – Gruppe BackendArkitekturmøte

**Dato:** 05.02.2026 
**Tid:** 10:30–05:02 
**Sted:** Fysisk 
**Deltakere:** [Henrik, Sigurd, Ole, Jonas]

---

## Agenda
- Avklare videre backend-arkitektur
- Diskusjon rundt database og SQL
- Strukturering av backend (routers, services, database)
- Avklare behov for API-endepunkter (GET / POST)
- Videre arbeid og ansvarsfordeling

---

## Sak 1 – Endring av database- og backendløsning
Gruppen diskuterte og ble enige om å gå bort fra Supabase som database- og backendløsning.  
Prosjektet skal i stedet benytte **PostgreSQL kjørt i Docker**, med direkte SQL-spørringer fra backend skrevet i **Python (FastAPI)**.

**Begrunnelse:**
- Gir bedre kontroll over data og datamodell
- Forenkler bruk av mock-data i utviklingsfasen
- Reduserer avhengighet til eksterne tjenester
- Gjør løsningen lettere å videreutvikle for andre grupper

---

## Sak 2 – Overordnet backend-arkitektur
Gruppen ble enige om å strukturere backend etter en tydelig lagdeling, inspirert av MVC-prinsipper.

### Arkitekturlag
- **Routers (Controller)**
  - Håndterer HTTP-forespørsler (GET / POST)
  - Eksponerer API-endepunkter til frontend

- **Services**
  - Inneholder domenelogikk og SQL-spørringer
  - Abstraherer databaserelatert logikk bort fra routerne

- **database.py**
  - Ansvarlig for database-tilkobling
  - Samler konfigurasjon og connection-logikk på ett sted

Denne strukturen gir bedre oversikt, tydelig ansvarsdeling og enklere testing og videreutvikling.

---

## Sak 3 – Bruk av SQL og mock-data
Det ble besluttet å:
- Lage egne SQL-filer for:
  - **Mock schema** (tabellstruktur)
  - **Mock data** (for utvikling og testing)
- Koble FastAPI direkte mot PostgreSQL-container via `docker-compose`
- Hente ut relevant data fra databasen basert på adresse og reguleringsplan
- Presentere denne informasjonen i popup-løsningen i frontend

---

## Sak 4 – API-endepunkter (GET / POST)
Gruppen diskuterte behovet for tydelige API-endepunkter.

Foreløpig fokus:
- **GET**: Hente reguleringsdata basert på adresse
- **POST**: Eventuelt brukes senere ved behov for innsending av valg eller simuleringer

CRUD-funksjonalitet vurderes, men full CRUD er ikke et krav i nåværende fase.

---

## Videre arbeid
- Etablere grunnleggende databaseoppsett i Docker
- Implementere database-tilkobling i `database.py`
- Lage første services med SQL-spørringer
- Opprette tilhørende routere i FastAPI
- Dokumentere arkitekturvalg og videre beslutninger fortløpende

---

**Kommentar:**  
Møtet la grunnlaget for videre backend-utvikling og tydeliggjorde arkitekturvalg som er viktige for prosjektets videre fremdrift.
