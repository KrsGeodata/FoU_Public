# Svar på veilederspørsmål

---

## 1. Forklare prosjektet enkelt

Mange innbyggere synes det er vanskelig å finne informasjon om sin egen eiendom — informasjonen ligger spredt på ulike nettsider og systemer. **Min Eiendom** er en nettportal som samler denne informasjonen på ett sted: hvem som eier eiendommen, størrelse, byggesaker, gebyrer og naboinformasjon.

Prosjektet er bestilt av Kristiansand kommune, men bacheloroppgaven stiller et større spørsmål: *hva skal til for at en slik løsning kan fungere nasjonalt, ikke bare i Kristiansand?* Det svares på gjennom en gap-analyse av Kristiansand, Oslo og Bergen.

---

## 2. Hvorfor er denne løsningen valgt — alternativer og begrunnelser

**Tekniske valg:**

| Valg | Alternativ | Begrunnelse |
|---|---|---|
| React (frontend) | Angular, Vue | Bredt brukt, god komponentmodell, teamet kjente det fra før |
| FastAPI (backend) | Django REST, Node.js | Rask å komme i gang, god støtte for typing og dokumentasjon (Swagger autogenereres) |
| PostgreSQL + PostGIS | MySQL, MongoDB | PostGIS gir innebygd støtte for geografisk eiendomsdata (koordinater, naboer) |
| Docker Compose | Manuell oppsett | Alle på teamet får identisk utviklingsmiljø, enkel overgang til produksjon (Azure) |
| Trelagsarkitektur | Monolitt | Tydelig ansvarsseparasjon, lettere å bytte ut deler og skalere nasjonalt |

**Metodiske valg:**
- **Design Science Research** ble valgt fordi vi både *bygger* noe og *undersøker* noe — metoden er designet for nettopp det.
- **IAF (Integrated Architecture Framework)** ble brukt som struktureringsverktøy for systemarkitekturen fordi det dekker både tekniske og organisatoriske dimensjoner.
- **CMS (Wagtail) ble kuttet fra PI2** — et bevisst prioriteringsvalg for å levere kjernen godt fremfor mye halvferdig.

---

## 3. Fremdrift og ressursbruk — hva er rimelig?

**Kapasitet:** ~7–8 timer × 4–5 dager × 5 personer per uke over 11 uker (PI2 + sluttspurt).

**Hva som er rimelig fremdrift:**
- PI2 Sprint 1 (uke 1–2): All backend ferdig
- PI2 Sprint 2 (uke 3–4): All frontend ferdig + løsning live i Azure
- PI2 Sprint 3 (uke 5–6): Nasjonal POC + intervjuer i gang
- Uke 7: Buffer og polish
- Uke 8–11: Skriving og innlevering

Fremdriften er planlagt slik at *koden er ferdig midtveis*, og siste halvdel er satt av til bacheloroppgaven. Det er bevisst — oppgaven skrives løpende, ikke i panikk på slutten.

---

## 4. Hva gjør dere for å bidra til fremdrift?

- **Sprint-struktur:** To-ukers sprints med sprint planning, daily standup (09:30 man–tor) og sprint review
- **GitHub Issues:** Alle oppgaver er spesifikke, sporbare issues — ikke vage gjøremål
- **Parallell skriving:** Bacheloroppgaven skrives sprint for sprint, ikke etterpå
- **Tydelige roller:** Kristian (Scrum Master), Oliver (UX/UI), Vebjørn (arkitekt), Gaute (kundekontakt)
- **MoSCoW-prioritering:** Forhindrer scope creep ved å ha et tydelig skille mellom *must have* og *nice to have*

**I hvilken grad har det virket?** PI1 er gjennomført, databaseskjema og kjernedata er på plass, og prosjektet er i rute inn i PI2 etter sprint-planen.

---

## 5–7. Kvalitet og kvalitetssikring

**Hva er kvalitet i dette prosjektet?**
- *Produktkvalitet:* At portalen viser riktig eiendomsinformasjon, er brukervennlig og tilgjengelig for alle
- *Kodekvalitet:* At koden er forståelig, vedlikeholdbar og trygg (GDPR, HTTPS, rollebasert tilgang)
- *Oppgavekvalitet:* At gap-analysen er metodisk solid og faktisk svarer på problemstillingen

**Hva er gjort av QA-tiltak:**
- **MoSCoW-analyse** og **brukerundersøkelser/personas** sikrer at vi bygger det brukerne faktisk trenger
- **Repository-pattern** i backend skiller datahenting fra logikk — lettere å teste isolert
- **Docker** sikrer at alle utvikler og tester i identisk miljø
- **Integrasjonstester** er planlagt i Sprint 2
- **Arkitekturdokumentasjon (IAF)** sikrer at designvalg er begrunnet og etterprøvbare

**Status på kvalitet — hva kan måles?**
- Antall åpne vs. lukkede GitHub Issues per sprint
- Funksjonalitet som faktisk er deployet og tilgjengelig i Azure (sensor kan bruke den live)
- Testdekning når integrasjonstestene er på plass (Sprint 2)
- Om gap-analysen dekker alle tre kommuner med samme analysekategorier

---

## 8. Hva kjennetegner prosjektet?

Det som er spesielt med dette prosjektet er at det er **to leveranser i én**: et fungerende system *og* en akademisk oppgave som bruker systemet som empirisk grunnlag.

Det betyr:
- Koden må være god nok til å demonstrere nasjonal skalerbarhet (ikke bare et prototype-hack)
- Bacheloroppgaven må være akademisk stringent, ikke bare en teknisk rapport
- Teamet må jobbe som et utviklingsteam *og* som forskere samtidig

I praksis håndteres dette ved at sprint-planen eksplisitt har en **«Bygg»-kolonne og en «Skriv»-kolonne** — utvikling og skriving er sidestilte aktiviteter gjennom hele PI2, ikke sekvensielle.
