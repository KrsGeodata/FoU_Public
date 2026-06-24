# Sprint Retrospective – Sprint 4 - [09.04.2026]

## Hva gikk bra

- Gruppen fikk jobbet videre med saksbehandlersiden, som var et sentralt fokusområde i denne sprinten.
- Det ble gjort arbeid med funksjonalitet for å opprette en ny drømmeplan med utgangspunkt i en reguleringsplan hentet fra planregisteret.
- Gruppen fikk arbeidet videre med struktur for felter, tomter og reguleringsbestemmelser i løsningen.
- Det ble gjort arbeid med funksjonalitet for å opprette, redigere og slette reguleringsbestemmelser.
- Gruppen fikk jobbet med hvordan reguleringsbestemmelser kan avgrenses til bestemte byggeformål ved opprettelse.
- Arbeidet med innbyggersiden ble tydeligere, spesielt med tanke på hvordan relevante bestemmelser skal vises basert på valgt byggeformål.
- Løsningen ble deployet i ett VM miljø med docker compose, slik at frontend, backend og database kunne kjøres sammen i ett mer realistisk miljø.
- Gruppen fikk også jobbet betydelig med rapporten, som tok mye tid, men bidro til bedre dokumentasjon av prosjektet.

---

## Hva gikk dårlig

- Saksbehandlersiden viste seg å være mer omfattende enn først forventet, særlig fordi flere deler av løsningen måtte kobles sammen.
- Koblingen mellom reguleringsplan, felter, tomter, byggeformål og reguleringsbestemmelser var teknisk og konseptuelt krevende.
- Det var utfordrende å balansere utviklingsarbeid og rapportskriving, ettersom rapporten krevde mye kapasitet i sprinten.
- Enkelte funksjoner tok lengre tid enn planlagt, spesielt knyttet til redigering og strukturering av reguleringsbestemmelser.
- Det oppstod fortsatt behov for avklaringer underveis, særlig rundt hvordan bestemmelser skulle avgrenses og vises basert på byggeformål.
- Arbeidet med rapporten førte til noe redusert fremdrift på enkelte utviklingsoppgaver.
- Gruppen opplevde utfordringer knyttet til oppsett av VM-miljøet. Etter at miljøet var etablert, oppstod det usikkerhet rundt hvordan utviklingsmiljøet best skulle deles og struktureres mellom production- og developer-modus. I tillegg ble migrasjoner en gjentakende teknisk utfordring gjennom sprinten.
---

## Forbedringer

- Gruppen bør fortsette å bryte ned større funksjoner i mindre og mer konkrete oppgaver.
- Det bør settes av tydeligere tid til både utvikling og rapportarbeid, slik at disse ikke konkurrerer like mye om kapasiteten.
- Funksjoner som involverer flere deler av systemet bør planlegges mer detaljert før implementering.
- Gruppen bør dokumentere tekniske valg fortløpende, spesielt når det gjelder koblinger mellom reguleringsplaner, tomter, byggeformål og bestemmelser.
- Det bør gjennomføres hyppigere testing underveis for å avdekke feil tidligere.
- Videre arbeid bør prioritere kvalitetssikring av funksjonalitet som allerede er utviklet, før nye funksjoner legges til.

---

## Måloppnåelse og vurdering

> Vurder om sprintmålene ble nådd, og gi en kort vurdering av sprinten:
>
> **Score: 4/5**  
> **Kommentar:** Sprint 4 ga god fremdrift på saksbehandlersiden og sentral funksjonalitet knyttet til opprettelse og håndtering av drømmeplaner, felter, tomter og reguleringsbestemmelser. Gruppen fikk også arbeidet med hvordan bestemmelser kan knyttes til byggeformål og vises mer relevant for innbygger. Samtidig var sprinten krevende fordi rapportarbeidet tok betydelig tid, og flere tekniske koblinger i løsningen viste seg å være mer omfattende enn forventet.
