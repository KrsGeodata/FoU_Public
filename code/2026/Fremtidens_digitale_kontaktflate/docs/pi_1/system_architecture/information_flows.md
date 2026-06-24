# Informasjonsflyt i Min Eiendom

Dette dokumentet beskriver hvordan informasjon flyter gjennom Min Eiendom-systemet for nøkkelbrukerscenarier. Flytene følger systemarkitekturen beskrevet i [architecture.md](../code/architecture.md).

## Oversikt over systemarkitektur

Min Eiendom-systemet følger en **tre-lags arkitektur**:

- **Frontend (Presentasjonslag)**: Brukergrensesnitt bygget med HTML, CSS og TypeScript  
- **Backend (Applikasjonslag)**: Python-basert tjeneste som håndterer forretningslogikk og integrasjoner  
- **Datalag**: Database og eksterne tjenester/API-er

**Hovedprinsipp**: Frontend kommuniserer aldri direkte med eksterne systemer. Alle integrasjoner håndteres via backend.

---

## Informasjonsflyt 1: Bruker ser eiendomsinformasjon

### Scenario
En innbygger vil se detaljert informasjon om sin eiendom, inkludert eiendomsdata, kart og reguleringsplaner, samt tilknyttede saker.

### Flytbeskrivelse

1. **Forespørsel om eiendomsinformasjon**
   - Bruker åpner eiendomoversikten sin
   - Frontend sender en HTTPS-forespørsel til backend: `GET /api/properties/{property_id}`

2. **Backend-behandling**
   - Backend mottar forespørselen og validerer at brukeren har tilgang
   - Backend henter data fra flere kilder parallelt:
     - **Intern database**: Grunnleggende eiendomsdata (adresse, postnummer, kommune, Gnr/Bnr, eier, arealer)  
     - **Matrikkel**: Offisiell eiendomsregistrering  
     - **GIS-tjenester**: Kartdata og geografisk informasjon  
     - **Intern database**: Reguleringsplaner knyttet til eiendommen

3. **Datainnsamling**
   - Backend samler responsene fra alle kilder
   - Data formateres til en samlet respons
   - Forretningslogikk anvendes (f.eks. filtrering av sensitiv informasjon, beregning av avledede verdier)
   - Data kan berikes med forklaringer og kontekst

4. **Respons til frontend**
   - Backend returnerer JSON med eiendomsinformasjon:
     - Eiendomsdetaljer (adresse, matrikkelnummer, arealer)  
     - Reguleringsplaner og kart  
     - Tilknyttede saker og status

5. **Visning for bruker**
   - Frontend viser eiendomsinformasjonen på en brukervennlig måte
   - Bruker kan se eiendomsdetaljer, kart og navigere til relatert informasjon
   - Frontend kan gjøre ekstra API-kall for tilleggdata (f.eks. dokumenter, nabooversikter)

### Eksterne tjenester involvert
- **Matrikkel**: Offisiell eiendomsinformasjon  
- **GIS-tjenester**: Kart- og geografiske data  

---

## Informasjonsflyt 2: Bruker sender inn dokumenter eller søknader

### Scenario
En innbygger ønsker å sende inn byggesøknad eller laste opp dokumenter for en eksisterende sak knyttet til sin eiendom.

### Flytbeskrivelse

1. **Navigasjon til innsendingsside**
   - Bruker åpner "Send inn søknad" eller "Last opp dokumenter"
   - Frontend viser skjema for søknad eller dokumentopplasting

2. **Skjemaforberedelse**
   - Frontend henter metadata for skjema fra backend: `GET /api/applications/form-metadata`
   - Backend returnerer struktur, obligatoriske felt, valideringsregler og tillatte filtyper
   - Frontend bygger skjema dynamisk basert på metadata

3. **Utfylling av skjema**
   - Bruker fyller ut feltene (f.eks. sakstype, beskrivelse, eiendomsdetaljer)
   - Bruker legger til dokumenter (PDF, bilder osv.)
   - Frontend validerer feltene før innsending (påkrevd info, filstørrelse, filtype)

4. **Dokumentopplasting**
   - Bruker trykker på "Send inn"
   - Frontend sender forespørsel til backend: `POST /api/applications/submit` med skjema og dokumenter

5. **Backend-behandling**
   - Backend validerer data og at innsendelsen er korrekt
   - Sikkerhetssjekker: filtyper, skanning for virus, filstørrelse, tilgangskontroll
   - Backend lagrer søknad og dokumenter i intern database
   - Genererer unikt saksnummer og kan integrere med kommunalt sakssystem (f.eks. TiltaksAID)

6. **Bekreftelse til bruker**
   - Backend returnerer suksessrespons med:
     - Saksnummer  
     - Tidspunkt for innsending  
     - Forventet behandlingstid  
     - Neste steg  
   - Frontend viser bekreftelse og gir valg:
     - Se innsendt søknad  
     - Følge sakens status  
     - Laste opp flere dokumenter  
     - Tilbake til eiendomoversikt

### Eksterne tjenester involvert
- **TiltaksAID**: Sakshåndtering og oppfølging  
- **Dokumentlagring**: Sikker lagring av filer  

