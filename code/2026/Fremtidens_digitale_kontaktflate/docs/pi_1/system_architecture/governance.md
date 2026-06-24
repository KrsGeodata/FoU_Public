# Ansvarsvurdering

Eiendomsdata hentes fra matrikkelen og eiendomsregisteret, og eies av Kartverket. Kartverket er en offentlig etat som har ansvar for å forvalte, kvalitetssikre og oppdatere disse dataene, og fungerer dermed som autoritativ kilde for eiendomsinformasjon.

Min Eiendom benytter eiendomsdata som **lesetilgang**, og har ikke ansvar for å endre eller oppdatere disse dataene direkte. Eventuelle endringer i eiendomsdata skjer i de autoritative systemene, og reflekteres i Min Eiendom gjennom integrasjoner.
```
💡 Det bør avklares nærmere hvordan oppdateringer av BRA (bruksareal) skjer etter gjennomførte byggesaker, for eksempel ved dialog med Steinar, for å sikre korrekt og oppdatert visning av arealinformasjon.
```

### Saksinformasjon

Saksinformasjon eies og forvaltes av Kristiansand kommune. Denne informasjonen hentes i dag direkte fra kommunens arkivsystem og regnes som autoritativ data.

Min Eiendom fungerer som et visnings- og samhandlingsgrensesnitt for saksinformasjon, uten å endre kildesystemene. Kommunen har ansvar for korrekt registrering, oppdatering og arkivering av saksinformasjon i sine interne systemer.

### CMS-innhold

Bruk av CMS er fortsatt under vurdering per 05.02.26. Dersom et CMS tas i bruk, vil dette eies og forvaltes av Kristiansand kommune.

CMS-et vil benyttes til å håndtere redaksjonelt innhold, veiledningstekster og forklarende informasjon. Dette gir kommunen kontroll over innholdsoppdateringer uten behov for endringer i applikasjonskoden.

## Systemansvar

Min Eiendom er bygget som et modulært system utviklet in-house. Kristiansand kommune har dermed det overordnede ansvaret for:

- Frontend
- Backend
- Integrasjoner mot eksterne systemer
- Eventuelle interne tjenester

Dette inkluderer ansvar for vedlikehold, videreutvikling og tekniske endringer. Dersom kommunen på et senere tidspunkt velger å sette bort deler av utvikling eller drift til en ekstern leverandør, vil Kristiansand kommune fortsatt ha det overordnede ansvaret for systemet og tilhørende styring.

Den modulære arkitekturen legger til rette for kontrollert videreutvikling, hvor nye funksjoner eller integrasjoner kan legges til uten å påvirke eksisterende deler av systemet.
