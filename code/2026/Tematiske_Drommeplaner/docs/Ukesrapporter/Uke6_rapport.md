## Ukesnotater – Uke 6 (02.02–05.02)

<details>
  <summary><strong>Mandag 02.02 – Backend-endring og arkitekturvalg</strong></summary>

  - Sprint review gjennomført, fungerte godt
  - Møte med Team Delta om teknisk arkitektur og videre utviklingsløp
  - Drøftet datalagring og integrasjonsløsning for Mikrodrømmeplan
  - Besluttet å gå bort fra Supabase som dataplattform
  - Valgt PostgreSQL kjørt i Docker-container
  - Backend kobles direkte til databasen via SQL-spørringer
  - Endringen gir bedre kontroll over datamodell, logikk og videreutvikling

</details>

<details>
  <summary><strong>Begrunnelse for backend-endringen</strong></summary>

  - Redusere avhengighet til eksterne tredjepartstjenester
  - Forenkle lokal utvikling og testing for hele prosjektgruppen
  - Legge bedre til rette for videreutvikling og gjenbruk av løsningen
  - Tydeligere skille mellom frontend, backend og datalagring

</details>

<details>
  <summary><strong>Tirsdag 03.02 – Database og adressevelger</strong></summary>

  - Videre arbeid med PostgreSQL i Docker
  - Oppsett og justering av database og mock-data
  - Arbeid med adressevelger i frontend
  - Påbegynt etablering av API-endepunkter mellom frontend og backend

</details>

<details>
  <summary><strong>Onsdag 04.02 – Struktur og abstrahering</strong></summary>

  - Videre arbeid med database og adressevelger
  - Rydding og forbedring av mappestruktur i backend og frontend
  - Begynt å skille tydelig mellom:
    - routere (API/endepunkter)
    - services (logikk og SQL)
    - database-tilkobling
  - Utforsket hvordan backend kan abstraheres bedre for videre utvikling

</details>

<details>
  <summary><strong>Torsdag 05.02 – Abstraksjon og struktur</strong></summary>

  - Videre abstrahering av backend-løsningen
  - Flyttet SQL-spørringer og databasekall inn i egne services
  - Routere brukes kun til å eksponere funksjonalitet mot frontend
  - Videre forbedring av mappestruktur
  - Lagt bedre grunnlag for videre utvikling og dokumentasjon

</details>

<details>
  <summary><strong>Fredag 06.02 – Status 1 og Større oppgave</strong></summary>
  
- Laget Status 1 video som skulle være levert til 09.02
- Større oppgave enn forventet, som gjør at vi skal ha møte med Team Pi om hva som blir veien videre, slik det ikke blir noe kluss..
</details>
