--
-- PostgreSQL database dump
--

\restrict 0F8SiBjgaHZTzKQqh9wfNmeVFnFX3O2ktusBzuoXxosHWc28sLUeAV1Il4FjQWt

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.schema_migrations VALUES ('20171026211738');
INSERT INTO auth.schema_migrations VALUES ('20171026211808');
INSERT INTO auth.schema_migrations VALUES ('20171026211834');
INSERT INTO auth.schema_migrations VALUES ('20180103212743');
INSERT INTO auth.schema_migrations VALUES ('20180108183307');
INSERT INTO auth.schema_migrations VALUES ('20180119214651');
INSERT INTO auth.schema_migrations VALUES ('20180125194653');
INSERT INTO auth.schema_migrations VALUES ('00');
INSERT INTO auth.schema_migrations VALUES ('20210710035447');
INSERT INTO auth.schema_migrations VALUES ('20210722035447');
INSERT INTO auth.schema_migrations VALUES ('20210730183235');
INSERT INTO auth.schema_migrations VALUES ('20210909172000');
INSERT INTO auth.schema_migrations VALUES ('20210927181326');
INSERT INTO auth.schema_migrations VALUES ('20211122151130');
INSERT INTO auth.schema_migrations VALUES ('20211124214934');
INSERT INTO auth.schema_migrations VALUES ('20211202183645');
INSERT INTO auth.schema_migrations VALUES ('20220114185221');
INSERT INTO auth.schema_migrations VALUES ('20220114185340');
INSERT INTO auth.schema_migrations VALUES ('20220224000811');
INSERT INTO auth.schema_migrations VALUES ('20220323170000');
INSERT INTO auth.schema_migrations VALUES ('20220429102000');
INSERT INTO auth.schema_migrations VALUES ('20220531120530');
INSERT INTO auth.schema_migrations VALUES ('20220614074223');
INSERT INTO auth.schema_migrations VALUES ('20220811173540');
INSERT INTO auth.schema_migrations VALUES ('20221003041349');
INSERT INTO auth.schema_migrations VALUES ('20221003041400');
INSERT INTO auth.schema_migrations VALUES ('20221011041400');
INSERT INTO auth.schema_migrations VALUES ('20221020193600');
INSERT INTO auth.schema_migrations VALUES ('20221021073300');
INSERT INTO auth.schema_migrations VALUES ('20221021082433');
INSERT INTO auth.schema_migrations VALUES ('20221027105023');
INSERT INTO auth.schema_migrations VALUES ('20221114143122');
INSERT INTO auth.schema_migrations VALUES ('20221114143410');
INSERT INTO auth.schema_migrations VALUES ('20221125140132');
INSERT INTO auth.schema_migrations VALUES ('20221208132122');
INSERT INTO auth.schema_migrations VALUES ('20221215195500');
INSERT INTO auth.schema_migrations VALUES ('20221215195800');
INSERT INTO auth.schema_migrations VALUES ('20221215195900');
INSERT INTO auth.schema_migrations VALUES ('20230116124310');
INSERT INTO auth.schema_migrations VALUES ('20230116124412');
INSERT INTO auth.schema_migrations VALUES ('20230131181311');
INSERT INTO auth.schema_migrations VALUES ('20230322519590');
INSERT INTO auth.schema_migrations VALUES ('20230402418590');
INSERT INTO auth.schema_migrations VALUES ('20230411005111');
INSERT INTO auth.schema_migrations VALUES ('20230508135423');
INSERT INTO auth.schema_migrations VALUES ('20230523124323');
INSERT INTO auth.schema_migrations VALUES ('20230818113222');
INSERT INTO auth.schema_migrations VALUES ('20230914180801');
INSERT INTO auth.schema_migrations VALUES ('20231027141322');
INSERT INTO auth.schema_migrations VALUES ('20231114161723');
INSERT INTO auth.schema_migrations VALUES ('20231117164230');
INSERT INTO auth.schema_migrations VALUES ('20240115144230');
INSERT INTO auth.schema_migrations VALUES ('20240214120130');
INSERT INTO auth.schema_migrations VALUES ('20240306115329');
INSERT INTO auth.schema_migrations VALUES ('20240314092811');
INSERT INTO auth.schema_migrations VALUES ('20240427152123');
INSERT INTO auth.schema_migrations VALUES ('20240612123726');
INSERT INTO auth.schema_migrations VALUES ('20240729123726');
INSERT INTO auth.schema_migrations VALUES ('20240802193726');
INSERT INTO auth.schema_migrations VALUES ('20240806073726');
INSERT INTO auth.schema_migrations VALUES ('20241009103726');
INSERT INTO auth.schema_migrations VALUES ('20250717082212');
INSERT INTO auth.schema_migrations VALUES ('20250731150234');
INSERT INTO auth.schema_migrations VALUES ('20250804100000');
INSERT INTO auth.schema_migrations VALUES ('20250901200500');
INSERT INTO auth.schema_migrations VALUES ('20250903112500');
INSERT INTO auth.schema_migrations VALUES ('20250904133000');
INSERT INTO auth.schema_migrations VALUES ('20250925093508');
INSERT INTO auth.schema_migrations VALUES ('20251007112900');
INSERT INTO auth.schema_migrations VALUES ('20251104100000');
INSERT INTO auth.schema_migrations VALUES ('20251111201300');
INSERT INTO auth.schema_migrations VALUES ('20251201000000');
INSERT INTO auth.schema_migrations VALUES ('20260115000000');
INSERT INTO auth.schema_migrations VALUES ('20260121000000');
INSERT INTO auth.schema_migrations VALUES ('20260219120000');
INSERT INTO auth.schema_migrations VALUES ('20260302000000');


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES (1, 'potato@gmail.com', true, NULL, NULL);
INSERT INTO public."User" VALUES (5, 'test-user@test.com', true, '$2b$12$gB15ZWYroaxWdvHE6HTuju7a4PUz5aLEDP0SKGUSyQdBQemhhSxuG', 'Ola Nordmann');
INSERT INTO public."User" VALUES (6, 'test1@gmail.com', true, '$2b$12$hZuDMBBemgM9Mi1XtYpGne8/y96zyqKkguQ/N1.FW.uTOF2UG49b6', 'Kari Nordmann');
INSERT INTO public."User" VALUES (7, 'test123@gmail.com', true, '$2b$12$3SJh8TpQphgy/.W3C6sVXOL0OLQCyrZZaDvFgG2OsKNYoz41byLiG', 'Randi Fjord');


--
-- Data for Name: Case; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Case" VALUES (72, 1, 'Test sak', '', 'Active', '2026-05-26 11:30:36.778608', true);
INSERT INTO public."Case" VALUES (73, 6, 'Test sak', '', 'Active', '2026-05-26 11:48:06.347175', true);
INSERT INTO public."Case" VALUES (28, 7, 'Takvindu installasjon Kvadraturen 8B', 'Montering av to takvinduer', 'Active', '2026-04-27 10:00:00', false);
INSERT INTO public."Case" VALUES (30, 7, 'Terrasse utvidelse Vestre Strandgate 22', 'Utvidelse av terrasse mot gateplan', 'Archived', '2026-03-04 10:00:00', false);
INSERT INTO public."Case" VALUES (69, 5, 'Søknad om tilbygg, Fantasigata 1881', 'Fin beskrivelse', 'Active', '2026-05-25 08:03:56', true);
INSERT INTO public."Case" VALUES (1, 5, 'This is a sample case title', 'Sample case description', 'Active', '2024-06-01 12:00:00', false);
INSERT INTO public."Case" VALUES (42, 7, 'Søknad om dispensasjon: plassering nær nabogrense ', 'Tiltakshaver søker dispensasjon fra avstandsbestemmelsen i gjeldende reguleringsplan for å oppføre et tilbygg nærmere nabogrensen enn tillatt', 'Active', '2026-05-05 21:25:02', false);
INSERT INTO public."Case" VALUES (43, 7, 'Søknad om dispensasjon: plassering nær nabogrense ', 'Tiltakshaver søker dispensasjon fra avstandsbestemmelsen i gjeldende reguleringsplan for å oppføre et tilbygg nærmere nabogrensen enn tillatt', 'Archived', '2026-05-05 21:27:47', false);
INSERT INTO public."Case" VALUES (31, 7, 'Basseng Moneheia', 'Frittstående basseng', 'Archived', '2026-05-04 12:27:34', false);
INSERT INTO public."Case" VALUES (27, 7, 'Tilbygg garasje Odderøya 43', 'Utvidelse av eksisterende garasje', 'Archived', '2026-04-29 10:00:00', true);
INSERT INTO public."Case" VALUES (61, 5, 'Spennende tittel', 'PLZ SLETT MEG!', 'Active', '2026-05-14 16:31:06', false);
INSERT INTO public."Case" VALUES (29, 7, 'Dispensasjon utnyttelsesgrad Lund Terrasse 3', 'Søknad overskrider BYA med 15%', 'Active', '2026-04-24 10:00:00', true);
INSERT INTO public."Case" VALUES (68, 5, 'Byggesak Solsiden 12, 4630 Kristiansand', 'Byggesaken er opprettet 18.05 2026, og innebærer bygging av bod på eiendommen...', 'Active', '2026-05-19 11:55:08', true);
INSERT INTO public."Case" VALUES (26, 7, 'Fasadeendring Kirkegata 16', 'Søknad om endring av fasade', 'Active', '2026-05-02 10:00:00', true);
INSERT INTO public."Case" VALUES (67, 7, 'Kakarotveien 14', 'De trenger en ny bod', 'Active', '2026-05-19 11:53:30', false);


--
-- Data for Name: Chat; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Chat" VALUES (328, NULL, 5, 'Test', '', '2026-05-26 13:22:54', true);
INSERT INTO public."Chat" VALUES (105, 26, 7, 'Dispensasjonsvurdering TEK §8-1', 'Vurdering av avvik fra teknisk forskrift', '2026-05-02 11:00:00', true);
INSERT INTO public."Chat" VALUES (106, 26, 7, 'Naboklage høring: avstand til eiendomsgrense', 'Nabo klager på manglende 4m avstand', '2026-05-03 11:00:00', true);
INSERT INTO public."Chat" VALUES (107, 27, 7, 'BYA-beregning over tillatt utnyttelse', 'Kontroll mot reguleringsplan', '2026-04-30 11:00:00', true);
INSERT INTO public."Chat" VALUES (108, 27, 7, 'Tidligere vedtak samme område', 'Søk i arkiv fra 2019 til 2023', '2026-05-01 11:00:00', true);
INSERT INTO public."Chat" VALUES (109, 28, 7, 'Vurdering kotehøyde møne vs gesims', 'Tolkning av reguleringsplan høydebegrensning', '2026-04-28 11:00:00', true);
INSERT INTO public."Chat" VALUES (110, 29, 7, 'Avkjørsel forsvarlighetsvurdering', 'Høringsuttalelse fra ingeniørvesenet', '2026-04-25 11:00:00', true);
INSERT INTO public."Chat" VALUES (111, 30, 7, 'Reguleringsplan tolkning gradert grøntområde', 'Vedtak fattet etter dispensasjon', '2026-03-05 11:00:00', true);
INSERT INTO public."Chat" VALUES (113, NULL, 7, 'Forskjell mellom BYA og BRA i TEK', '', '2026-04-20 11:00:00', true);
INSERT INTO public."Chat" VALUES (112, NULL, 7, 'Hvordan vurdere dispensasjon fra reguleringsplan?', '', '2026-04-27 11:00:00', false);
INSERT INTO public."Chat" VALUES (114, NULL, 7, 'Når kreves uttalelse fra fylkeskommunen?', '', '2026-04-14 11:00:00', true);
INSERT INTO public."Chat" VALUES (115, NULL, 7, 'Tolkning av siktsone ved avkjørsel', '', '2026-04-09 11:00:00', true);


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ChatMessage" VALUES (53, 110, 'Hei kan du hjelpe meg med: hva er gjeldende reguleringsbestemmelser for utnyttelsesgrad for denne eiendommen, og hva er formålet bak bestemmelsen? Og hvordan påvirker tiltaket hensynene bestemmelsen skal ivareta?', true, '2026-05-05 20:41:24+00');
INSERT INTO public."ChatMessage" VALUES (54, 110, 'For å kunne gi deg en presis beskrivelse av gjeldende reguleringsbestemmelser for utnyttelsesgrad på denne eiendommen, samt formålet bak bestemmelsen og hvordan tiltaket påvirker hensynene bestemmelsen skal ivareta, trenger jeg mer informasjon om eiendommen i søye og hvilken kommune den ligger i. Kunne du vennligst gi meg mer kontekst eller detaljer? Dette vil ermögøde meg å gi et mer kvalifisert svar.', false, '2026-05-05 20:41:25+00');
INSERT INTO public."ChatMessage" VALUES (55, 107, 'Hei, kan du hjelpe meg med om BYA‑beregningen er korrekt utført etter kommunens praksis og TEK17‑definisjonen av bebygd areal', true, '2026-05-05 20:47:23+00');
INSERT INTO public."ChatMessage" VALUES (56, 107, 'Ja, jeg kan hjelpe deg med å gjennomgå BYA-beregningen og sammenligne den med kommunens praksis og TEK17-definisjonen av bebygd areal. Kan du vise meg BYA-beregningen og kommunens retningslinjer for BYA-beregning, så jeg bedre kan forstå konteksten og gi en mer presis vurdering?', false, '2026-05-05 20:47:24+00');
INSERT INTO public."ChatMessage" VALUES (832, 105, 'Hei! Hva skjer? Er du på jakt etter noe spesifikt i dette området?', NULL, '2026-05-19 13:30:48+00');
INSERT INTO public."ChatMessage" VALUES (833, 105, 'Jeg vil bygge ut terrassen min. Må jeg sæke?', true, '2026-05-19 13:42:38+00');
INSERT INTO public."ChatMessage" VALUES (831, 105, 'Hei', true, '2026-05-19 13:30:43+00');
INSERT INTO public."ChatMessage" VALUES (834, 105, 'Hei! Jeg kan ikke sjekke om du trenger å sæke for å bygge ut terrassen din, fordi jeg ikke har tilgang til dine filer eller dokumenter.

For å kunne hjelpe deg best, må du gi meg en fil-ID som allerede er oppgitt i samtalekonteksten. Hvis du har en PDF, CSV eller annen fil som er lastet opp i dette chatet, kan du gi meg fil-ID-en og så kan jeg lese innholdet og hjelpe deg med å finne ut om du trenger å gjøre noen endringer.

Hvis du ikke har en fil med informasjon om terrassen din, så må du sjekke lokale byggeri- eller bygningsregler i ditt område, eller kontakte en arkitekt eller byggemester for rådgivning.

Hvorfor har du spørsmålet om å sæke? Er det for å bygge ut en ny del, eller for å fjerne noe?', NULL, '2026-05-19 13:42:48+00');


--
-- Data for Name: File; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."File" VALUES ('be44d8e3-6fa8-4e81-a14f-8a3e0205a801', 'Byggesak', 5, 61, NULL, '2026-05-14 14:31:08.488229', '.docx', 'local_jon', true, NULL);
INSERT INTO public."File" VALUES ('792b8d0c-f7a6-4b52-8516-70decd5e0261', 'caseoverview', 5, 61, NULL, '2026-05-14 14:31:08.866082', '.png', 'local_jon', true, NULL);
INSERT INTO public."File" VALUES ('07896bd2-47da-482f-a738-c7106bce785b', 'plantegning', 7, 29, NULL, NULL, '.pdf', 'local_stine', true, NULL);
INSERT INTO public."File" VALUES ('3b155c82-6776-424e-87d6-c80ad2f9172f', 'snitt_tegning', 7, 29, NULL, NULL, '.pdf', 'local_stine', true, NULL);
INSERT INTO public."File" VALUES ('ab4ab830-3223-4d9a-9ed9-7946310b326a', 'eksempel_byggesak_bod', 5, 68, NULL, '2026-05-19 10:08:59.785668', '.pdf', 'production', true, NULL);
INSERT INTO public."File" VALUES ('bf1a8238-9175-4eb5-ad21-127f0ed84968', 'fasadetegning', 7, 26, NULL, '2026-05-19 14:43:54.169071', '.pdf', 'production', true, NULL);
INSERT INTO public."File" VALUES ('461453a5-991e-4bc1-93e4-3045bc069215', 'plantegning', 7, 26, NULL, '2026-05-19 14:43:54.827781', '.pdf', 'production', true, NULL);
INSERT INTO public."File" VALUES ('e8646b1a-99fe-4ce8-90a7-3dc78214201e', 'caseoverview', 5, 69, NULL, '2026-05-25 06:03:58.842789', '.png', 'local_jon', true, NULL);


--
-- Data for Name: FileProcessing; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FileProcessing" VALUES ('ab4ab830-3223-4d9a-9ed9-7946310b326a', 'READY', NULL, '2026-05-19 10:09:00.313275+00');
INSERT INTO public."FileProcessing" VALUES ('bf1a8238-9175-4eb5-ad21-127f0ed84968', 'READY', NULL, '2026-05-19 14:43:54.635082+00');
INSERT INTO public."FileProcessing" VALUES ('461453a5-991e-4bc1-93e4-3045bc069215', 'READY', NULL, '2026-05-19 14:43:55.090534+00');
INSERT INTO public."FileProcessing" VALUES ('e8646b1a-99fe-4ce8-90a7-3dc78214201e', 'READY', NULL, '2026-05-25 06:03:59.911727+00');


--
-- Data for Name: FileText; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FileText" VALUES (41, 'bf1a8238-9175-4eb5-ad21-127f0ed84968', 0, 'FASADETEGNING - NORDØST
Prosjekt: Tilbygg Vestre Strandgate 12
Eiendom: 45/123
Målestokk: 1:100
Dato: 15.04.2024
Tegning nr: A-02
HOVEDDIMENSJONER
Gesimshøyde eksisterende bygg: 8,5 m
Gesimshøyde tilbygg: 8,5 m
Mønehøyde eksisterende: 10,2 m
Mønehøyde tilbygg: 10,2 m
Bredde tilbygg: 5,0 m
MATERIALER OG OVERFLATER
Vegger: Malt panel, farge NCS S 2010-Y30R (tilpasset eksisterende)
Tak: Tegl, rød
Vinduer: Tre, hvitmalte
Dører: Tre, hvitmalte
Takrenner: Kobber
MERKNADER
Tilbygget utformes i samme stil som eksisterende bygg med identisk gesims- og mønehøyde.
Vindusinndelinger og materialvalg tilpasses eksisterende fasade. Takvinkel 35 grader, samme som
eksisterende tak.');
INSERT INTO public."FileText" VALUES (42, '461453a5-991e-4bc1-93e4-3045bc069215', 0, 'PLANTEGNING - 1. ETASJE
Dokument nr: P-01
Eiendom: 45/123
Adresse: Vestre Strandgate 12
Dato: 15.04.2024
[Teknisk tegning: PLANTEGNING - 1. ETASJE]');


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

INSERT INTO realtime.schema_migrations VALUES (20211116024918, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116045059, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116050929, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116051442, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116212300, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116213355, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116213934, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211116214523, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211122062447, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211124070109, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211202204204, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211202204605, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211210212804, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20211228014915, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220107221237, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220228202821, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220312004840, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220603231003, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220603232444, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220615214548, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220712093339, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220908172859, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20220916233421, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230119133233, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230128025114, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230128025212, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230227211149, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230228184745, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230308225145, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20230328144023, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20231018144023, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20231204144023, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20231204144024, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20231204144025, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240108234812, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240109165339, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240227174441, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240311171622, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240321100241, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240401105812, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240418121054, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240523004032, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240618124746, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240801235015, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240805133720, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240827160934, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240919163303, '2026-02-10 03:26:05');
INSERT INTO realtime.schema_migrations VALUES (20240919163305, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241019105805, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241030150047, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241108114728, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241121104152, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241130184212, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241220035512, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241220123912, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20241224161212, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250107150512, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250110162412, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250123174212, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250128220012, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250506224012, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250523164012, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250714121412, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20250905041441, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20251103001201, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20251120212548, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20251120215549, '2026-02-10 03:26:06');
INSERT INTO realtime.schema_migrations VALUES (20260218120000, '2026-04-10 07:36:13');
INSERT INTO realtime.schema_migrations VALUES (20260326120000, '2026-04-10 07:36:13');


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

INSERT INTO storage.migrations VALUES (0, 'create-migrations-table', 'e18db593bcde2aca2a408c4d1100f6abba2195df', '2026-02-10 03:25:41.813573');
INSERT INTO storage.migrations VALUES (1, 'initialmigration', '6ab16121fbaa08bbd11b712d05f358f9b555d777', '2026-02-10 03:25:41.876956');
INSERT INTO storage.migrations VALUES (3, 'pathtoken-column', '2cb1b0004b817b29d5b0a971af16bafeede4b70d', '2026-02-10 03:25:41.935819');
INSERT INTO storage.migrations VALUES (4, 'add-migrations-rls', '427c5b63fe1c5937495d9c635c263ee7a5905058', '2026-02-10 03:25:41.955159');
INSERT INTO storage.migrations VALUES (5, 'add-size-functions', '79e081a1455b63666c1294a440f8ad4b1e6a7f84', '2026-02-10 03:25:41.959065');
INSERT INTO storage.migrations VALUES (7, 'add-rls-to-buckets', 'e7e7f86adbc51049f341dfe8d30256c1abca17aa', '2026-02-10 03:25:41.969051');
INSERT INTO storage.migrations VALUES (8, 'add-public-to-buckets', 'fd670db39ed65f9d08b01db09d6202503ca2bab3', '2026-02-10 03:25:41.972955');
INSERT INTO storage.migrations VALUES (11, 'add-trigger-to-auto-update-updated_at-column', '7425bdb14366d1739fa8a18c83100636d74dcaa2', '2026-02-10 03:25:41.987154');
INSERT INTO storage.migrations VALUES (12, 'add-automatic-avif-detection-flag', '8e92e1266eb29518b6a4c5313ab8f29dd0d08df9', '2026-02-10 03:25:41.992326');
INSERT INTO storage.migrations VALUES (13, 'add-bucket-custom-limits', 'cce962054138135cd9a8c4bcd531598684b25e7d', '2026-02-10 03:25:41.996782');
INSERT INTO storage.migrations VALUES (14, 'use-bytes-for-max-size', '941c41b346f9802b411f06f30e972ad4744dad27', '2026-02-10 03:25:42.005597');
INSERT INTO storage.migrations VALUES (15, 'add-can-insert-object-function', '934146bc38ead475f4ef4b555c524ee5d66799e5', '2026-02-10 03:25:42.038154');
INSERT INTO storage.migrations VALUES (16, 'add-version', '76debf38d3fd07dcfc747ca49096457d95b1221b', '2026-02-10 03:25:42.044442');
INSERT INTO storage.migrations VALUES (17, 'drop-owner-foreign-key', 'f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101', '2026-02-10 03:25:42.048694');
INSERT INTO storage.migrations VALUES (18, 'add_owner_id_column_deprecate_owner', 'e7a511b379110b08e2f214be852c35414749fe66', '2026-02-10 03:25:42.053033');
INSERT INTO storage.migrations VALUES (19, 'alter-default-value-objects-id', '02e5e22a78626187e00d173dc45f58fa66a4f043', '2026-02-10 03:25:42.059342');
INSERT INTO storage.migrations VALUES (20, 'list-objects-with-delimiter', 'cd694ae708e51ba82bf012bba00caf4f3b6393b7', '2026-02-10 03:25:42.063759');
INSERT INTO storage.migrations VALUES (21, 's3-multipart-uploads', '8c804d4a566c40cd1e4cc5b3725a664a9303657f', '2026-02-10 03:25:42.071741');
INSERT INTO storage.migrations VALUES (22, 's3-multipart-uploads-big-ints', '9737dc258d2397953c9953d9b86920b8be0cdb73', '2026-02-10 03:25:42.084179');
INSERT INTO storage.migrations VALUES (23, 'optimize-search-function', '9d7e604cddc4b56a5422dc68c9313f4a1b6f132c', '2026-02-10 03:25:42.095036');
INSERT INTO storage.migrations VALUES (24, 'operation-function', '8312e37c2bf9e76bbe841aa5fda889206d2bf8aa', '2026-02-10 03:25:42.100854');
INSERT INTO storage.migrations VALUES (25, 'custom-metadata', 'd974c6057c3db1c1f847afa0e291e6165693b990', '2026-02-10 03:25:42.105707');
INSERT INTO storage.migrations VALUES (37, 'add-bucket-name-length-trigger', '3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1', '2026-02-10 03:25:43.248755');
INSERT INTO storage.migrations VALUES (44, 'vector-bucket-type', '99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3', '2026-02-10 03:25:43.290632');
INSERT INTO storage.migrations VALUES (45, 'vector-buckets', '049e27196d77a7cb76497a85afae669d8b230953', '2026-02-10 03:25:43.295398');
INSERT INTO storage.migrations VALUES (46, 'buckets-objects-grants', 'fedeb96d60fefd8e02ab3ded9fbde05632f84aed', '2026-02-10 03:25:43.304727');
INSERT INTO storage.migrations VALUES (47, 'iceberg-table-metadata', '649df56855c24d8b36dd4cc1aeb8251aa9ad42c2', '2026-02-10 03:25:43.308994');
INSERT INTO storage.migrations VALUES (49, 'buckets-objects-grants-postgres', '072b1195d0d5a2f888af6b2302a1938dd94b8b3d', '2026-02-10 03:25:43.328009');
INSERT INTO storage.migrations VALUES (2, 'storage-schema', 'f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd', '2026-02-10 03:25:41.882369');
INSERT INTO storage.migrations VALUES (6, 'change-column-name-in-get-size', 'ded78e2f1b5d7e616117897e6443a925965b30d2', '2026-02-10 03:25:41.96351');
INSERT INTO storage.migrations VALUES (9, 'fix-search-function', 'af597a1b590c70519b464a4ab3be54490712796b', '2026-02-10 03:25:41.976847');
INSERT INTO storage.migrations VALUES (10, 'search-files-search-function', 'b595f05e92f7e91211af1bbfe9c6a13bb3391e16', '2026-02-10 03:25:41.982542');
INSERT INTO storage.migrations VALUES (26, 'objects-prefixes', '215cabcb7f78121892a5a2037a09fedf9a1ae322', '2026-02-10 03:25:42.110685');
INSERT INTO storage.migrations VALUES (27, 'search-v2', '859ba38092ac96eb3964d83bf53ccc0b141663a6', '2026-02-10 03:25:42.127599');
INSERT INTO storage.migrations VALUES (28, 'object-bucket-name-sorting', 'c73a2b5b5d4041e39705814fd3a1b95502d38ce4', '2026-02-10 03:25:42.137511');
INSERT INTO storage.migrations VALUES (29, 'create-prefixes', 'ad2c1207f76703d11a9f9007f821620017a66c21', '2026-02-10 03:25:42.146114');
INSERT INTO storage.migrations VALUES (30, 'update-object-levels', '2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6', '2026-02-10 03:25:42.152083');
INSERT INTO storage.migrations VALUES (31, 'objects-level-index', 'b40367c14c3440ec75f19bbce2d71e914ddd3da0', '2026-02-10 03:25:42.159061');
INSERT INTO storage.migrations VALUES (32, 'backward-compatible-index-on-objects', 'e0c37182b0f7aee3efd823298fb3c76f1042c0f7', '2026-02-10 03:25:42.167087');
INSERT INTO storage.migrations VALUES (33, 'backward-compatible-index-on-prefixes', 'b480e99ed951e0900f033ec4eb34b5bdcb4e3d49', '2026-02-10 03:25:43.230608');
INSERT INTO storage.migrations VALUES (34, 'optimize-search-function-v1', 'ca80a3dc7bfef894df17108785ce29a7fc8ee456', '2026-02-10 03:25:43.232037');
INSERT INTO storage.migrations VALUES (35, 'add-insert-trigger-prefixes', '458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc', '2026-02-10 03:25:43.237557');
INSERT INTO storage.migrations VALUES (36, 'optimise-existing-functions', '6ae5fca6af5c55abe95369cd4f93985d1814ca8f', '2026-02-10 03:25:43.241422');
INSERT INTO storage.migrations VALUES (38, 'iceberg-catalog-flag-on-buckets', '02716b81ceec9705aed84aa1501657095b32e5c5', '2026-02-10 03:25:43.253068');
INSERT INTO storage.migrations VALUES (39, 'add-search-v2-sort-support', '6706c5f2928846abee18461279799ad12b279b78', '2026-02-10 03:25:43.263679');
INSERT INTO storage.migrations VALUES (40, 'fix-prefix-race-conditions-optimized', '7ad69982ae2d372b21f48fc4829ae9752c518f6b', '2026-02-10 03:25:43.268547');
INSERT INTO storage.migrations VALUES (41, 'add-object-level-update-trigger', '07fcf1a22165849b7a029deed059ffcde08d1ae0', '2026-02-10 03:25:43.276054');
INSERT INTO storage.migrations VALUES (42, 'rollback-prefix-triggers', '771479077764adc09e2ea2043eb627503c034cd4', '2026-02-10 03:25:43.280733');
INSERT INTO storage.migrations VALUES (43, 'fix-object-level', '84b35d6caca9d937478ad8a797491f38b8c2979f', '2026-02-10 03:25:43.286157');
INSERT INTO storage.migrations VALUES (48, 'iceberg-catalog-ids', 'e0e8b460c609b9999ccd0df9ad14294613eed939', '2026-02-10 03:25:43.312534');
INSERT INTO storage.migrations VALUES (50, 'search-v2-optimised', '6323ac4f850aa14e7387eb32102869578b5bd478', '2026-02-10 10:37:09.504604');
INSERT INTO storage.migrations VALUES (51, 'index-backward-compatible-search', '2ee395d433f76e38bcd3856debaf6e0e5b674011', '2026-02-10 10:37:09.549617');
INSERT INTO storage.migrations VALUES (52, 'drop-not-used-indexes-and-functions', '5cc44c8696749ac11dd0dc37f2a3802075f3a171', '2026-02-10 10:37:09.551213');
INSERT INTO storage.migrations VALUES (53, 'drop-index-lower-name', 'd0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854', '2026-02-10 10:37:09.612271');
INSERT INTO storage.migrations VALUES (54, 'drop-index-object-level', '6289e048b1472da17c31a7eba1ded625a6457e67', '2026-02-10 10:37:09.61524');
INSERT INTO storage.migrations VALUES (55, 'prevent-direct-deletes', '262a4798d5e0f2e7c8970232e03ce8be695d5819', '2026-02-10 10:37:09.616925');
INSERT INTO storage.migrations VALUES (57, 's3-multipart-uploads-metadata', 'f127886e00d1b374fadbc7c6b31e09336aad5287', '2026-04-08 09:31:00.28');
INSERT INTO storage.migrations VALUES (58, 'operation-ergonomics', '00ca5d483b3fe0d522133d9002ccc5df98365120', '2026-04-08 09:31:00.312625');
INSERT INTO storage.migrations VALUES (56, 'fix-optimized-search-function', 'b823ed1e418101032fa01374edc9a436e54e3ed4', '2026-02-10 10:37:09.62317');
INSERT INTO storage.migrations VALUES (59, 'drop-unused-functions', '38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4', '2026-05-08 04:43:39.040272');
INSERT INTO storage.migrations VALUES (60, 'optimize-existing-functions-again', 'db35e1c91a9201e59f4fef8d972c2f277d68b157', '2026-05-08 04:43:39.070506');


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: Cases_Casesid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Cases_Casesid_seq"', 73, true);


--
-- Name: ChatMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ChatMessage_id_seq"', 872, true);


--
-- Name: Chats_Chatid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Chats_Chatid_seq"', 328, true);


--
-- Name: FileText_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FileText_Id_seq"', 45, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict 0F8SiBjgaHZTzKQqh9wfNmeVFnFX3O2ktusBzuoXxosHWc28sLUeAV1Il4FjQWt

