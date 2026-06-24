## Datakilder og dataansvar

Dette avsnittet beskriver hvor hver informasjonstype i **Min Eiendom** kommer fra, hvilke data som kun kan leses, hvilke som kan endres, og hvem som har ansvar for vedlikehold.

---

## Kilde for hver informasjonstype

- **Eiendom**  
  Kilde: Kommunen  
  Inneholder grunnleggende informasjon om eiendommen, som eierforhold og tilknytning til saker.

- **Eiendomsstørrelse**  
  Kilde: Matrikkelen (via Kartverket / Norkart)  
  Offisielt registrert areal for eiendommen.

- **Bebygd areal**  
  Kilde: Kommunen / Matrikkelen  
  Viser hvor mye av eiendommen som er bebygd.

- **Adresse**  
  Kilde: Matrikkelen (Kartverket / Norkart)  
  Offisiell adresse knyttet til eiendommen.

- **Matrikkelnummer (Gnr/Bnr)**  
  Kilde: Matrikkelen (Kartverket)  
  Unik identifikator for eiendommen i Norge.

- **Sak**  
  Kilde: Kommunen  
  Bygge- og plansaker knyttet til eiendommen.

- **Saksdokumenter**  
  Kilde: Kommunen  
  Dokumenter relatert til saker, som søknader, vedtak og vedlegg.

- **Reguleringsplaner**  
  Kilde: Kommunen / Kartverket / Norkart  
  Regler og bestemmelser som gjelder for området rundt eiendommen.

- **Søppeltømming**  
  Kilde: Avfall Sør  
  Informasjon om hentetidspunkt for restavfall, papir, plast osv.

- **Naboliste**  
  Kilde: Folkeregisteret / Matrikkelen  
  Oversikt over naboer knyttet til eiendommen.

---

## Lesetilgang og endringer

- De fleste informasjonstypene i Min Eiendom er **skrivebeskyttet (read-only)** for brukeren.
- **Sak og saksdokumenter** kan endres indirekte ved at eiendomseier sender inn nye søknader eller dokumenter.
- **Naboliste** kan potensielt endres dersom løsningen tillater at brukeren selv oppretter eller redigerer listen.
- Øvrige data kan ikke redigeres av brukeren og vises kun som informasjon.

---

## Ansvar for vedlikehold av data

- **Kommunen** har hovedansvaret for å vedlikeholde:
  - Eiendomsinformasjon  
  - Saker og saksdokumenter  
  - Reguleringsplaner  

- **Eksterne aktører og API-er** er ansvarlige for sine respektive datasett:
  - **Kartverket / Norkart**: Matrikkeldata, adresser og kart
  - **Avfall Sør**: Informasjon om søppeltømming
  - **Folkeregisteret**: Grunnlag for nabolister

Kommunen er ansvarlig for at informasjonen som vises i Min Eiendom er korrekt og oppdatert, selv når data hentes fra eksterne kilder.

Eiendomsdata som adresse, eiendomsstørrelse og matrikkelnummer hentes fra Matrikkelen – Norges offisielle eiendomsregister administrert via Kartverket og kommunene som lokal matrikkelmyndighet.

**Smarte Kilder**
- https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/kart/matrikkelen/id614667/
- https://www.norkart.no/datatjenester/eiendom-og-tinglysning?
- https://www.matrikkel.no/matrikkel/
