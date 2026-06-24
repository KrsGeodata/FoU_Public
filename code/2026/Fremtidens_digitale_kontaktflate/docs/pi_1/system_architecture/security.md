# Sikkerhetsvurdering

## Brukerautentisering

I den eksisterende løsningen av Min Eiendom benyttes ID-porten for innlogging. Dette anses som en etablert og sikker autentiseringsløsning for kommunale tjenester, og videre integrasjon av ID-porten ligger utenfor omfanget av denne prosjektoppgaven.

Det er også gjort vurderinger rundt et CMS som kun vil være tilgjengelig for administrerende personer i kommunen. Tilgang til CMS-et forutsetter innlogging via Wagtail sitt innebygde autentiseringssystem.

## Tilganger

Min Eiendom gir i hovedsak brukere tilgang til informasjon knyttet til egen eiendom eller egne eiendommer. Det vil også være mulig å generere en naboliste basert på nærliggende eiendommer.

Det er per dags dato (05.02.26) ikke tatt stilling til om brukere skal ha direkte tilgang til naboers saker. Selv om slik informasjon kan være offentlig tilgjengelig i arkiver, er det usikkert om det gir tilstrekkelig merverdi å gjøre dette tilgjengelig i Min Eiendom.

## Personvern

Informasjonen som vises i Min Eiendom er i stor grad basert på offentlig tilgjengelige data. Samtidig er det tatt hensyn til personvern ved at sensitiv informasjon behandles med varsomhet, og kun relevant informasjon presenteres for brukeren.

Dersom det blir behov for bruk av informasjonskapsler (cookies) under utviklingen, vil gjeldende GDPR-regelverk følges for å sikre korrekt håndtering av personopplysninger.
