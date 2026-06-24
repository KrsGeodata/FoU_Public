# Hvordan vi bruker IAF til å strukturere prosjektet

Vi bruker IAF som en rød tråd for å sikre at vi først avklarte hvorfor løsningen trengs, deretter hva den skal levere, og til slutt hvordan den bygges og med hva.

- Why (Hvorfor): Målet er å gjøre “Min eiendom” mer nyttig for brukeren ved å samle, strukturere og presentere mer relevant eiendomsinformasjon på én plass. Dette skal redusere friksjon (mindre leting og usikkerhet), og gi en mer moderne og effektiv brukeropplevelse.

- What (Hva): Vi definerte hva løsningen skal levere i praksis: bedre oversikt over eiendomsdata, tydelig presentasjon (kart + data + forklaringer), og støtte for typiske behov som planlegging av endringer/tiltak, dokumentasjon og forståelse av regler/krav – uten at brukeren må hoppe mellom mange kilder.

- How (Hvordan): Vi beskrev hvordan dette realiseres gjennom arkitektur og designvalg: en frontend som gir en moderne UI, en backend som samler og normaliserer data fra flere kilder/tjenester, og et CMS for innhold/tekster som kan oppdateres uten kodeendringer. Integrasjoner gjøres via API-er for fleksibilitet og videreutvikling.

- With what (Med hva): Vi dokumenterte hvilke teknologier og ressurser som brukes for å bygge og drifte løsningen (containerisering, valgt stack, integrasjoner, samt arbeidsmetoder for utvikling og testing).

## Mapping (IAF V6)

### WHY (Contextual) – hvorfor vi gjør dette
**Business**
- Formål, mål, problemer og hvem som får verdi: `purpose.md`
- Brukerinnsikt som begrunner behovet (moderne, enklere, mindre friksjon): `user_interviews.md`
- Målgrupper/brukertyper: `personas.md`

**Governance (på tvers)**
- Hvordan IAF brukes som “rød tråd” i prosjektet: `using_IAF.md`
- Styring og beslutningsprinsipper (prioriteringer, ansvar, prosess): `governance.md`

---

### WHAT (Conceptual) – hva løsningen skal levere
**Business (scope og kapabiliteter)**
- Prioritert funksjonsomfang (Must/Should/Could): `moscow.md`
- Overordnet “hva systemet skal gjøre”: `system_capabilities.md`

**Information (hvilken info som inngår)**
- Informasjonstyper og sammenhenger (eiendom, kart, planer, saker, dokumenter): `information_types.md`
- Hvem eier hvilke data og hva som er autoritativt (kilder vs. innhold): `data_ownership.md`

---

### HOW (Logical) – hvordan vi realiserer dette (flyt/ansvar)
**Information Systems**
- Nøkkelflyter (hente eiendomsinfo, presentere, sende inn dokumenter/søknad): `information_flows.md`
- Brukerreise (hvordan brukeren navigerer og finner info): `user_journey.md`
- UI-skisser som støtter moderne og effektiv presentasjon: `wireframes.md`
- Notater fra brukertesting / iterasjon på prototyper: `UserTestingNotes.md`

**Security (på tvers)**
- Autentisering, tilgangskontroll (RBAC), personvern og sikker dataflyt: `security.md`

---

### WITH WHAT (Physical) – med hva vi bygger/drifter det
**Technology Infrastructure**
- Arkitekturvalg, komponenter (frontend/backend/CMS), containerisering og integrasjoner: `architecture_documentation.md`
- Rammeverk-referanse (IAF V6) brukt som grunnstruktur: `integrated_architecture_framework.md`

**Sustainability (på tvers)**
- Redusert manuelt arbeid, gjenbruk/vedlikehold, og PoC-mockdata → produksjon med autoritative kilder: `sustainability.md`

