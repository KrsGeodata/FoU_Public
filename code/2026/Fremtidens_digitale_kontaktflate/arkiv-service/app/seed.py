# Standard library
import logging
import uuid

# Third-party
import sqlalchemy
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Local
from app.database import engine, SessionLocal, Base
from app.models import ArkivSak, ArkivDokument

# Fixed UUIDs for reproducible seed data
SAK_1_ID = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
SAK_2_ID = uuid.UUID("b2c3d4e5-f6a7-8901-bcde-f12345678901")
SAK_3_ID = uuid.UUID("c3d4e5f6-a7b8-9012-cdef-123456789012")
SAK_4_ID = uuid.UUID("d4e5f6a7-b8c9-0123-defa-234567890123")

DOK_1_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
DOK_2_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
DOK_3_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")
DOK_4_ID = uuid.UUID("44444444-4444-4444-4444-444444444444")
DOK_5_ID = uuid.UUID("55555555-5555-5555-5555-555555555555")
DOK_6_ID = uuid.UUID("66666666-6666-6666-6666-666666666666")


SEED_SAKER = [
    # Property 1: GNR 58 / BNR 61, Kommune 4204
    ArkivSak(
        id=SAK_1_ID,
        kommunenummer="4204",
        gardsnummer=58,
        bruksnummer=61,
        festenummer=0,
        seksjonsnummer=0,
        saksaar=2023,
        sakssekvensnummer=1234,
        tittel="Rammesøknad - tilbygg enebolig",
        saksstatus="Under behandling",
        saksdato="2023-05-15",
        beskrivelse="Søknad om tilbygg på 40 kvm til eksisterende enebolig.",
    ),
    ArkivSak(
        id=SAK_2_ID,
        kommunenummer="4204",
        gardsnummer=58,
        bruksnummer=61,
        festenummer=0,
        seksjonsnummer=0,
        saksaar=2021,
        sakssekvensnummer=567,
        tittel="Igangsettingstillatelse - garasje",
        saksstatus="Godkjent",
        saksdato="2021-03-10",
        avsluttet_dato="2021-06-22",
        beskrivelse="Tillatelse til oppføring av frittliggende garasje.",
    ),
    # Property 2: GNR 37 / BNR 119, Kommune 4204
    ArkivSak(
        id=SAK_3_ID,
        kommunenummer="4204",
        gardsnummer=37,
        bruksnummer=119,
        festenummer=0,
        seksjonsnummer=0,
        saksaar=2024,
        sakssekvensnummer=89,
        tittel="Søknad om rivningstillatelse - uthus",
        saksstatus="Under behandling",
        saksdato="2024-01-20",
        beskrivelse="Søknad om riving av uthus bygd før 1950.",
    ),
    ArkivSak(
        id=SAK_4_ID,
        kommunenummer="4204",
        gardsnummer=37,
        bruksnummer=119,
        festenummer=0,
        seksjonsnummer=0,
        saksaar=2019,
        sakssekvensnummer=2001,
        tittel="Ferdigattest - enebolig",
        saksstatus="Godkjent",
        saksdato="2019-11-05",
        avsluttet_dato="2020-02-14",
        beskrivelse="Ferdigattest for nybygg enebolig med sekundærleilighet.",
    ),
]

SEED_DOKUMENTER = [
    # Documents for SAK_1 (tilbygg)
    ArkivDokument(
        id=DOK_1_ID,
        sak_id=SAK_1_ID,
        tittel="Søknadsskjema",
        dokumenttype="Søknad",
        filnavn="soknad_tilbygg_2023.pdf",
        mimetype="application/pdf",
        opprettet_dato="2023-05-15",
    ),
    ArkivDokument(
        id=DOK_2_ID,
        sak_id=SAK_1_ID,
        tittel="Situasjonskart",
        dokumenttype="Vedlegg",
        filnavn="situasjonskart.pdf",
        mimetype="application/pdf",
        opprettet_dato="2023-05-15",
    ),
    # Documents for SAK_2 (garasje)
    ArkivDokument(
        id=DOK_3_ID,
        sak_id=SAK_2_ID,
        tittel="Igangsettingstillatelse",
        dokumenttype="Vedtak",
        filnavn="ig_tillatelse_garasje.pdf",
        mimetype="application/pdf",
        opprettet_dato="2021-03-10",
    ),
    ArkivDokument(
        id=DOK_4_ID,
        sak_id=SAK_2_ID,
        tittel="Tegninger garasje",
        dokumenttype="Vedlegg",
        filnavn="tegninger_garasje.pdf",
        mimetype="application/pdf",
        opprettet_dato="2021-02-28",
    ),
    # Documents for SAK_3 (riving)
    ArkivDokument(
        id=DOK_5_ID,
        sak_id=SAK_3_ID,
        tittel="Rivningssøknad",
        dokumenttype="Søknad",
        filnavn="rivningssoknad_uthus.pdf",
        mimetype="application/pdf",
        opprettet_dato="2024-01-20",
    ),
    # Documents for SAK_4 (ferdigattest)
    ArkivDokument(
        id=DOK_6_ID,
        sak_id=SAK_4_ID,
        tittel="Ferdigattest",
        dokumenttype="Vedtak",
        filnavn="ferdigattest_enebolig.pdf",
        mimetype="application/pdf",
        opprettet_dato="2019-11-05",
    ),
]


def _migrate_schema() -> None:
    """Add columns introduced after initial table creation."""
    with engine.connect() as conn:
        result = conn.execute(
            sqlalchemy.text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'arkiv_saker' AND column_name = 'avsluttet_dato'"
            )
        )
        if result.fetchone() is None:
            conn.execute(
                sqlalchemy.text(
                    "ALTER TABLE arkiv_saker ADD COLUMN avsluttet_dato VARCHAR(10)"
                )
            )
            conn.commit()
            logger.info("Added missing column avsluttet_dato to arkiv_saker.")


def seed_database() -> None:
    """Create tables and insert seed data if the tables are empty."""
    Base.metadata.create_all(bind=engine)
    _migrate_schema()

    db: Session = SessionLocal()
    try:
        if db.query(ArkivSak).count() == 0:
            db.add_all(SEED_SAKER)
            db.add_all(SEED_DOKUMENTER)
            db.commit()
            logger.info("Seeded %d saker and %d dokumenter.", len(SEED_SAKER), len(SEED_DOKUMENTER))
        else:
            logger.info("Seed data already exists, skipping.")
    finally:
        db.close()
