Arbeidsreferat – Bachelorprosjekt (Mikrodrømmeplan)
Uke 4 – Januar 2026
Mandag 19.01.2026 | Kl. 09:00–13:00

Tema: Arkitekturforum, GitHub og teknologivalg

Formål:
Etablere en felles teknisk retning for prosjektet, samt sikre åpenhet og samhandling i scrum trainet.

Gjennomførte aktiviteter:
Backlog ble flyttet fra Jira til GitHub, da alt arbeid skal være synlig og tilgjengelig for resten av scrum trainet. Dette gir bedre transparens, sporbarhet og samarbeid på tvers av team.

Gruppen diskuterte og besluttet å benytte Screaming Architecture som overordnet arkitekturprinsipp. Dette innebærer at mappestruktur og kode skal reflektere domenet og funksjonaliteten i løsningen, fremfor teknologier og rammeverk. Målet er bedre lesbarhet, tydeligere eierskap og enklere videreutvikling.

Videre ble følgende teknologiske valg skissert:
- Backend: Python (FastAPI + Pydantic)
- Database: PostgreSQL med SQLAlchemy og Alembic
- Frontend: React med TypeScript
- API: REST med OpenAPI
- Containerisering: Docker
- Databaseoppsett: PostgreSQL i Docker, med sannsynlig kobling mot Supabase

Disse valgene ble vurdert som godt egnet for prosjektets omfang og videre utvikling.
Videre arbeid: Ferdigstille konkrete mappestrukturer for frontend og backend, samt starte praktisk teknisk oppsett.

Tirsdag 20.01.2026 | Kl. 09:00–15:00
Tema: Mappestruktur, standup og veiledning

Formål:
Etablere en felles arbeidsstruktur for frontend og sikre faglig forankring gjennom veiledning.

Gjennomførte aktiviteter:
Det ble gjennomført daily standup. Gruppen har besluttet å ha faste standups tirsdag og torsdag.
Gruppen ble enige om en felles mappestruktur for frontend i TypeScript. Denne strukturen skal brukes av alle i gruppen og er lagt ved som appendix for uken.
Videre ble resten av uken planlagt, inkludert bruk av opplæringsvideoer for å sikre felles forståelse av frontend-strukturen.
Det ble også gjennomført veiledningsmøte med Rania, hvor vi:

- Ga status på prosjektets fremdrift
- Presenterte frontend-mappestrukturen for vurdering
- Fikk innspill på strukturens hensiktsmessighet og skalerbarhet
- I tillegg stilte vi spørsmål knyttet til:

Hennes tilgjengelighet for videre veiledning
- Anbefalte ressurser innen Python, TypeScript og relevant teknologi
Avklaringer:
  Rania er tilgjengelig for veiledning:
- Mandager (partallsuker)
- Tirsdag og onsdag etter kl. 12
- Torsdager før kl. 12

Videre arbeid:
Starte implementering basert på vedtatt frontend-struktur og forberede backend-arbeid.

Onsdag 21.01.2026 | Kl. 09:00–15:00
Tema: PowerPoint og GitHub-backlog
Formål:
Forberede formidling av prosjektet til Plan & Bygg, samt styrke forståelsen av GitHub som arbeidsverktøy.

Gjennomførte aktiviteter:
Gruppen startet arbeidet med en PowerPoint-presentasjon som skulle vises 23.01 for ansatte i Plan & Bygg. Presentasjonen er planlagt å vare 5–10 minutter og gi en overordnet forståelse av:

- Prosjektets mål og problemstilling
- Hva Mikrodrømmeplan er
- Hva gruppen jobber med nå
- I tillegg jobbet gruppen med å lære og friske opp bruken av GitHub-backlog, inkludert:
- Strukturering av issues
- Kobling mellom backlog og utviklingsarbeid
- Forståelse for eierskap og progresjon i oppgaver

Videre arbeid:
Ferdigstille presentasjonen og forberede teknisk demo.

Torsdag 22.01.2026 | Kl. 12:00–15:00
Tema: Forelesning – Scrum og rapportskriving
Formål:
- Styrke forståelsen av prosjektmetodikk og akademisk rapportering.
Gjennomførte aktiviteter:
- Deltatt på forelesning med gjennomgang av:
- Sentrale prinsipper i Scrum
- Roller, møter og arbeidsflyt
- Korte føringer for struktur og innhold i bachelorrapporten

Forelesningen ga nyttig støtte både til det praktiske prosjektarbeidet og kommende rapportskriving.

Fredag 23.01.2026 | Kl. 09:00–15:00

Tema: Dockerizing, presentasjon og teknisk oppstart

Formål:
Sikre felles utviklingsmiljø og formidle prosjektstatus til Plan & Bygg.

Gjennomførte aktiviteter:
- Gruppen satte opp Docker Compose og containeriserte prosjektet, slik at alle gruppemedlemmer kan jobbe i et felles og konsistent utviklingsmiljø.
  Det ble gjennomført en presentasjon foran hele Plan & Bygg i Kristiansand kommune, med rundt 70 tilstedeværende. Presentasjonen tok for seg:
 - Bakgrunnen for prosjektet
- Formålet med Mikrodrømmeplan
- Hvordan gruppen jobber metodisk og teknisk

Videre startet arbeidet med:

- Oppbygging av databasestruktur
- Videre ferdigstilling av frontend
- Etablering av backend-mappestruktur i tråd med Screaming Architecture
- Det ble også opparbeidet bedre forståelse for branching i GitHub-backlog, inkludert viktigheten av at alle oppgaver har en tydelig parent.

Videre arbeid:
Videreutvikle backend, koble database og fortsette frontend-implementasjon.

Oppsummering og refleksjon – Uke 4

Allerede etter kun to ukers arbeid fikk gruppen presentere bachelorprosjektet i flere offentlige og faglige sammenhenger. Prosjektet ble presentert foran NRK, med dekning på TV, radio og nettsak, samt for hele Plan & Bygg i Kristiansand kommune, med rundt 70 tilstedeværende ansatte.

Dette ble opplevd som en svært motiverende og personlig utviklende erfaring for hele gruppen. Tidlig eksponering for reelle interessenter ga verdifulle tilbakemeldinger, økt eierskap til prosjektet og bekreftet relevansen av både problemstilling og løsningsretning.

Status ved slutten av uke 4 viser at gruppen ligger foran målene som ble satt for PI 1. Arbeidet med konseptutvikling, prototyping og teknisk retning er enten ferdigstilt eller godt i gang.

Sprintstatus:

- Sprint 1 er ferdigstilt
- Sprint review og sprint retrospective gjennomføres mandag
- Sprint 2 starter etter review
- Det gjennomføres to sprinter per PI, hver med varighet på tre uker

Plan for neste uke:
- Komme i gang med databasestruktur (PostgreSQL)
- Etablere tydelig backend-struktur i Python (FastAPI)
- Ferdigstille frontend så langt det lar seg gjøre
- Videre teknisk samspill mellom frontend, backend og database
- Dette markerer overgangen fra en konsept- og prototypedrevet fase til en mer helhetlig teknisk implementeringsfase.

Appendix – Uke 4
19.01: Skjermbilder av GitHub- og backlogstruktur (vedlagt)

20.01: x

21.01: x
  Appendix 
  19.01
  <img width="945" height="678" alt="bilde" src="https://github.com/user-attachments/assets/26ea2f9b-8cf8-454c-9c70-e869905e6da7" />
  <img width="945" height="678" alt="bilde" src="https://github.com/user-attachments/assets/c5c293c6-feab-417b-a43c-e5328e72ee40" />
  <img width="945" height="678" alt="bilde" src="https://github.com/user-attachments/assets/7d05ff26-260b-4b77-9531-26ef6a948d42" />
  20.01
  x
  21.01
  x
  22.01
  x
  23.01
  x

  



