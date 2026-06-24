Arkitekturforum 19.01.26
<img width="2546" height="1435" alt="image" src="https://github.com/user-attachments/assets/8fd35bac-e79c-4555-bd3f-489d19a19f8c" />

	• Screaming Architecture - kode og struktur skal gjenspeile domenet, ikke hvilke rammeverk det bruker.
	• Ønskelig at vi bruker denne arkitekturen da det gir bedre lesbarhet og tydeligere eierskap.
	• Ser for meg at f.eks src/features/popup/components/PopupContent/……

<img width="2546" height="1435" alt="image" src="https://github.com/user-attachments/assets/1e41be55-5f58-4544-a897-b293915285a8" />

	• Noen gode arkitektur-prinsipper som skal følges og ting å tenke på underveis.

<img width="2546" height="1435" alt="image" src="https://github.com/user-attachments/assets/7a988553-f0ee-4bdc-bb57-a18916f1cb72" />

	• Python backend - FastAPI + Pydantic, SQLAlchemy + Alembic
	• React frontend
	• API - REST + OpenAPI
	• Docker container
	• PostgreSQL i Docker med supabase connection?

Arkitekturforum 09.03.2026

Holde seg til containerisert database i Dev miljø. Kan være køddent og være avhengig av supabase fordi:
- Avhengig av at verktøyet funker
- Tilgang til brukere

Kjøre database slik vi har gjort nå, bruke standard .sql filer for migrasjon av database, drit i verktøy for dette.

CI/CD Pipeline i Github Actions, verdt å sjekke ut og lære seg.
