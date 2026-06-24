### **Bakgrunn**

IAF er et enterprise architecture-rammeverk utviklet av Capgemini, som dekker forretningsarkitektur, informasjonsarkitektur, informasjonssystemer og teknologisk infrastruktur. Den første versjonen ble utviklet fra 1994 til 1998. Fokuset for denne versjonen var å etablere grunnlaget for Capgeminis beste praksiser. Versjon 2 ble utviklet i 1998 og brukt frem til 2000, med fokus på informasjonssystemarkitektur og på å legge grunnlaget innen andre områder. De påfølgende versjonene fylte hull i rammeverket, samt la til beste praksiser fra oppkjøpte selskaper og interne arkitekter (Van’T Wout et al., 2010). I 2022 introduserer IAF V6 et bærekraftsperspektiv, med mål om å hjelpe utviklere med å skape bærekraftige arkitekturløsninger (Camargo Jr & Moens, 2022).

## Hva er IAF

IAF stiller et sett med grunnleggende spørsmål. Disse spørsmålene stilles alltid i samme rekkefølge: Hvorfor, hva, hvordan, med hva. Før man løser et problem, er det viktig å forstå hvorfor. Uten å forstå konteksten er det vanskelig å definere omfang og mål (Van’T Wout et al., 2010).

Etter å ha forstått hvorfor problemet må løses, er det på tide å arbeide med «hva som må gjøres». Dette innebærer å definere både funksjonelle og ikke-funksjonelle krav før løsningen utformes (Van’T Wout et al., 2010). De funksjonelle kravene omhandler funksjonalitet brukeren skal kunne utføre, hvilken informasjon som må vises, og lignende. De ikke-funksjonelle kravene handler i større grad om skalerbarhet, modularitet, ytelse, sikkerhet og lignende.

«*Hvordan*» står for selve løsningen. Det er viktig å utforme løsningen på et logisk nivå, ettersom dette gjør det enklere å håndtere tilpasninger og nye innsikter. For det fjerde spørsmålet, «*med hva*», er det enklere å beskrive et scenario. Dersom «*hvorfor*» en bro må bygges er på grunn av for mye trafikk på to eksisterende broer i en by, er «*hva*» at den må tåle tung trafikk som lastebiler og store mengder biler. «*Hvordan*» presenteres som miniatyrmodeller av broen. «*Med hva*» i dette scenariet vil være materialene (Van’T Wout et al., 2010). I et teknisk scenario vil dette mest sannsynlig være tech-stacken for applikasjonen, skytjenester og alle viktige teknologiske komponenter som er involvert i utviklingen av løsningen.

## Abstraksjonsnivåer

| Nivå | Spørsmål | Formål |
| --- | --- | --- |
| Kontekstuelt | **Hvorfor** | Forretningsmål, drivere |
| Konseptuelt | **Hva** | Kapabiliteter og behov |
| Logisk | **Hvordan** | Struktur og sammenheng |
| Fysisk | **Med hva** | Teknologiske valg |

## Aspektnivåer

| Forretning | Informasjon | Informasjonssystemer | Teknologisk infrastruktur |
| --- | --- | --- | --- |
| Forretningsmodeller, mål og prosesser, organisasjonsteori | Datastrukturer, informasjonskoherens, dataflyt | Brukergrensesnitt, integrasjon, datakonvertering | Servere, sky, nettverk, teknisk drift |

### Forretning

Fokuserer på **hvordan organisasjonen fungerer og hva den ønsker å oppnå**.

- Beskriver **forretningsmodellen**, mål og verdien organisasjonen ønsker å skape  
- Forklarer **hvordan arbeidet er organisert**, inkludert roller, ansvar og prosesser  
- Bidrar til å tydeliggjøre **hvorfor teknologi er nødvendig**, ikke hvilken teknologi som brukes  
- Gir konteksten som styrer alle arkitektoniske beslutninger i de andre områdene  

### Informasjon

Fokuserer på **hvilken informasjon virksomheten bruker og hvordan den er strukturert**.

- Definerer **sentrale datakonsepter og datastrukturer** brukt i organisasjonen  
- Sikrer at informasjon er **konsistent, sammenhengende og riktig delt**  
- Beskriver **dataflyt** mellom prosesser og systemer  
- Fungerer som en bro mellom forretningsbehov og tekniske systemer  

### Informasjonssystemer

Fokuserer på **systemene som behandler og forvalter informasjon**.

- Beskriver **applikasjoner og tjenester** som støtter forretningsprosesser  
- Dekker **brukergrensesnitt**, systemintegrasjoner og API-er  
- Håndterer **datakonvertering, transformasjon og migrering** mellom systemer  
- Forklarer hvordan systemer samhandler for å levere funksjonalitet til brukere  

### Teknologisk infrastruktur

Fokuserer på **det tekniske fundamentet som gjør at systemene fungerer**.

- Inkluderer **servere, skyplattformer, nettverk og kjøremiljøer**  
- Beskriver hvordan systemer **driftes, kobles sammen og opereres**  
- Dekker **teknisk drift**, tilgjengelighet og ytelse  
- Tilbyr de fysiske og virtuelle ressursene som trengs for å støtte informasjonssystemer  

## Perspektiver

| Bærekraft | Sikkerhet | Styring |
| --- | --- | --- |
| Miljømessig, sosial, økonomisk | Risiko, integritet, kostnad, informasjon, operasjonell teknologi | Kvalitet vs. kostnad, styrbarhet, forretningsprosessledelse |

*Disse perspektivene er ment å anvendes på alle abstraksjons- og aspekt­nivåer.*

## IAF V6-rammeverket

Integrated Architecture Framework (IAF) er et rammeverk som brukes til å strukturere og organisere arkitekturarbeid på tvers av forretning og teknologi. Det deler arkitektur inn i fire aspektområder: Forretning, Informasjon, Informasjonssystemer og Teknologisk infrastruktur. For å håndtere kompleksitet benytter IAF fire abstraksjonsnivåer – Hvorfor, Hva, Hvordan og Med hva – som gjør det mulig å ta arkitektoniske beslutninger steg for steg. I tillegg vurderes Styring, Sikkerhet og Bærekraft på tvers av alle områder og nivåer. Samlet sett gir dette en tydelig måte å forstå og strukturere arkitektoniske beslutninger på.

|  | Bærekraft | Sikkerhet | Styring |
| --- | --- | --- | --- |

| Hvorfor | **Kontekstuelt** |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| Hva | **Konseptuelt** |  |  |  |  |
| Hvordan | **Logisk** |  |  |  |  |
| Med hva | **Fysisk** |  |  |  |  |
|  |  | **Forretning** | **Informasjon** | **Informasjonssystemer** | **Teknologi** |

## Referanser

Van’T Wout, J., Waage, M., Hartman, H., Stahlecker, M., & Hofman, A. (2010). *The Integrated Architecture Framework Explained*. Springer Berlin Heidelberg. https://doi.org/10.1007/978-3-642-11518-9

Camargo Jr, W., & Moens, J. (2022). *A framework for Architects*.
