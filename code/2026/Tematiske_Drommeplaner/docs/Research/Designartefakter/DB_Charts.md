## Database-diagrammer (DB charts)

Vi har brukt DB-diagrammer som et verktøy for å planlegge og visualisere hvordan data skal struktureres og hentes ut i Mikrodrømmeplan. Under vises utviklingen fra tidlige utkast til den nåværende modellen. Diagrammene har hjulpet oss med å avklare hvilke tabeller som trengs, hvordan de henger sammen, og hvilke felter som er viktigst for å støtte popupen (viktige data + dokumentlenker).

<details>
  <summary><strong>DB chart – Første utkast</strong></summary>

  Dette var et tidlig utkast for å kartlegge hvilke typer data vi trengte å lagre/hente ut (adresse + grunnleggende planinformasjon). Fokus var på å få på plass en første struktur før vi visste nøyaktig hvilke felter som skulle prioriteres i popupen.

  <img src="https://github.com/user-attachments/assets/c2e310ff-763e-4913-9ed7-37809e5b1e3a" alt="DB chart – første utkast" width="900" />

</details>

<details>
  <summary><strong>DB chart – Andre utkast</strong></summary>

  I neste iterasjon justerte vi relasjoner og begynte å tydeliggjøre hvilke felter som faktisk skal brukes i visningen. Her ble modellen mer konkret og mer rettet mot hva frontend trenger (strukturert svar per adresse).

  <img src="https://github.com/user-attachments/assets/d78c0da6-cb48-4b3d-bf11-32f5f4d1ce24" alt="DB chart – andre utkast" width="850" />

</details>

<details>
  <summary><strong>DB chart – Nåværende løsning</strong></summary>

  Dette er den nåværende modellen slik vi har den nå. Målet her er å støtte:
  - oppslag på adresse (mock-adresser)
  - uthenting av nøkkeldata fra tilhørende reguleringsinformasjon
  - dokumentlenker som brukeren kan klikke videre på (f.eks. reguleringsplan/kommuneplan)

  <img src="https://github.com/user-attachments/assets/824b44dc-b9ec-421a-98ac-11d6d65f1cf8" alt="DB chart – nåværende løsning" width="1000" />

  **Tillegg / videre forbedring:**
  - Egentlig ønsker vi en ekstra kobling på <strong>Arealplaner</strong> som peker direkte til riktig <strong>reguleringsplan-lenke</strong> (dokument/URL) for den aktuelle adressen.

</details>

