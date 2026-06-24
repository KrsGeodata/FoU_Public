# Bærekraft(Sustainability) 
Hvordan systemet reduserer manuelt arbeid

- Samler spredt informasjon på ett sted: I stedet for at brukeren må lete i flere kilder (f.eks. ulike nettsider, kommunale sider, dokumenter og tjenester), henter backend relevant informasjon og presenterer det samlet i én løsning. Dette kutter tid brukt på “søk + kryssjekk” og reduserer risiko for at brukeren overser viktige krav.

- Støtter beslutninger med det man trenger, når man trenger det: Når en bruker vurderer endringer på eiendommen (f.eks. tiltak), skal løsningen hjelpe med å forstå om man må søke eller ikke, ved å vise nødvendig kontekst og relevante regler/krav samlet. Det reduserer antall telefoner, e-poster og manuelle avklaringer.

- Automatisert integrasjon mot fagtjenester: Ved å bruke API-er mot TiltaksAID og Drømmeplaner, slipper man manuell overføring av informasjon mellom systemer. Dataflyt skjer maskinelt og konsekvent, i stedet for at brukeren eller ansatte må “kopiere/lim inn” eller tolke samme data flere ganger.

- Mockdata kun for Proof of Concept: I PoC-fasen bruker vi mockdata for å kunne utvikle og demonstrere funksjonalitet uten avhengighet til eksterne datakilder og tilgangsprosesser. Dersom løsningen tas i produksjon, erstattes dette fullt ut av ekte/autoritative datakilder, slik at beslutningsgrunnlaget (f.eks. “må jeg søke?”) alltid baseres på oppdaterte og korrekte data.

## Hvordan designet støtter gjenbruk og langsiktig vedlikehold

Containerisering gir stabil drift og enklere oppdateringer: Frontend, CMS og backend kjører i egne containere. Det gjør at hver del kan oppdateres, testes og deployes mer isolert uten å påvirke alt samtidig. Resultatet er færre “store” vedlikeholdsjobber og mer kontrollert videreutvikling.

### Tydelig ansvarsdeling mellom komponenter:

- Frontend fokuserer på presentasjon og brukeropplevelse

- Backend håndterer logikk, datainnhenting og integrasjoner

- CMS håndterer innhold/tekster og kan endres uten kodeendringer i backend
Denne delingen gjør systemet lettere å forstå og vedlikeholde over tid.

- Privat nett mellom backend og CMS: At backend og CMS kommuniserer på et “private network” reduserer eksponering og gir en ryddigere sikkerhetsmodell. Det gir færre sikkerhetsrelaterte endringer og mindre risiko for feilkonfigurasjoner som skaper mye manuelt vedlikehold.

- API-basert integrasjon gir fleksibilitet: TiltaksAID og Drømmeplaner kjører i egne containere/tjenester og kobles via API. Det gjør at vi kan bytte versjon, endre leverandør eller utvide med flere datakilder uten å måtte bygge om hele systemet.

## Langsiktige gevinster av arkitekturen

- Lavere vedlikeholdskostnad: Modulene er separert, så feil og endringer blir mer lokale. Det gir raskere feilsøking og mindre “ringvirkning” når noe oppdateres.

- Enklere å skalere og utvide: Når behovet øker (flere brukere, mer data, flere kilder), kan backend/integrasjonsdelen skaleres uten at man må endre frontend/CMS tilsvarende.

- Mer robust over tid (mindre personavhengighet): Når løsningen er strukturert i klare komponenter med stabile grensesnitt, blir den enklere å overta og videreutvikle for nye utviklere.

- Bedre datakvalitet og mindre feil: Når informasjon hentes og behandles automatisk, reduseres menneskelige feil (feiltolkning, utdatert info, feil kopiering). Det gir færre supporthenvendelser og mindre manuelt “oppryddingsarbeid”.
