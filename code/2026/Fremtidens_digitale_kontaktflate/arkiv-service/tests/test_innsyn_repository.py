"""
Repository tests for `sok_byggesaker` and `get_dokumenter_for_sak`.

Each test builds its own minimal fixture data inline so the assertion ties
directly to the data it expects back. We intentionally avoid depending on
`app.seed.SEED_SAKER` so a future change to the demo fixtures cannot silently
break these tests.
"""

from __future__ import annotations

import uuid


def _make_sak(
    *,
    kommunenummer: str = "4204",
    gardsnummer: int = 58,
    bruksnummer: int = 61,
    festenummer: int = 0,
    seksjonsnummer: int = 0,
    saksaar: int = 2023,
    sakssekvensnummer: int = 1,
    tittel: str = "Test-sak",
    saksstatus: str = "Under behandling",
    saksdato: str = "2023-01-01",
    avsluttet_dato: str | None = None,
    beskrivelse: str | None = None,
):
    from app.models import ArkivSak

    return ArkivSak(
        id=uuid.uuid4(),
        kommunenummer=kommunenummer,
        gardsnummer=gardsnummer,
        bruksnummer=bruksnummer,
        festenummer=festenummer,
        seksjonsnummer=seksjonsnummer,
        saksaar=saksaar,
        sakssekvensnummer=sakssekvensnummer,
        tittel=tittel,
        saksstatus=saksstatus,
        saksdato=saksdato,
        avsluttet_dato=avsluttet_dato,
        beskrivelse=beskrivelse,
    )


def test_sok_byggesaker_happy_path(db_session):
    from app.repositories.innsyn import sok_byggesaker
    from app.schema.innsyn import MatrikkelnummerRequest

    db_session.add(_make_sak(tittel="Rammesøknad tilbygg"))
    db_session.commit()

    result = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(kommunenummer="4204", gardsnummer=58, bruksnummer=61),
    )

    assert result.antallTreff == 1
    treff = result.treff[0]
    assert treff.mappe.tittel == "Rammesøknad tilbygg"
    assert treff.mappe.saksstatus == "Under behandling"
    assert treff.mappe.matrikkelnummer[0].kommunenummer == "4204"
    assert treff.mappe.matrikkelnummer[0].gardsnummer == 58
    assert treff.mappe.matrikkelnummer[0].bruksnummer == 61


def test_sok_byggesaker_empty_result_returns_zero_treff(db_session):
    """Unknown matrikkelnummer returns empty list, not an exception."""
    from app.repositories.innsyn import sok_byggesaker
    from app.schema.innsyn import MatrikkelnummerRequest

    result = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(kommunenummer="9999", gardsnummer=1, bruksnummer=1),
    )

    assert result.antallTreff == 0
    assert result.treff == []


def test_sok_byggesaker_filters_by_full_property_combination(db_session):
    """A sak at property A must NOT match a search at property B even if
    the kommunenummer overlaps."""
    from app.repositories.innsyn import sok_byggesaker
    from app.schema.innsyn import MatrikkelnummerRequest

    db_session.add(_make_sak(gardsnummer=58, bruksnummer=61, tittel="sak A"))
    db_session.add(_make_sak(gardsnummer=37, bruksnummer=119, tittel="sak B"))
    db_session.commit()

    result_a = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(kommunenummer="4204", gardsnummer=58, bruksnummer=61),
    )
    result_b = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(kommunenummer="4204", gardsnummer=37, bruksnummer=119),
    )

    assert result_a.antallTreff == 1
    assert result_a.treff[0].mappe.tittel == "sak A"
    assert result_b.antallTreff == 1
    assert result_b.treff[0].mappe.tittel == "sak B"


def test_sok_byggesaker_filters_by_festenummer_and_seksjonsnummer(db_session):
    """festenummer and seksjonsnummer are part of the property key, not optional."""
    from app.repositories.innsyn import sok_byggesaker
    from app.schema.innsyn import MatrikkelnummerRequest

    db_session.add(_make_sak(festenummer=0, seksjonsnummer=0, tittel="main"))
    db_session.add(_make_sak(festenummer=1, seksjonsnummer=0, tittel="leased parcel"))
    db_session.add(_make_sak(festenummer=0, seksjonsnummer=2, tittel="section 2"))
    db_session.commit()

    main = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(
            kommunenummer="4204", gardsnummer=58, bruksnummer=61,
            festenummer=0, seksjonsnummer=0,
        ),
    )
    assert main.antallTreff == 1
    assert main.treff[0].mappe.tittel == "main"

    leased = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(
            kommunenummer="4204", gardsnummer=58, bruksnummer=61,
            festenummer=1, seksjonsnummer=0,
        ),
    )
    assert leased.antallTreff == 1
    assert leased.treff[0].mappe.tittel == "leased parcel"


def test_sok_byggesaker_preserves_avsluttet_dato_on_closed_cases(db_session):
    """Regression protection: the field whose migration we care about must
    round-trip through the repository mapping."""
    from app.repositories.innsyn import sok_byggesaker
    from app.schema.innsyn import MatrikkelnummerRequest

    db_session.add(
        _make_sak(tittel="Ferdigattest", saksstatus="Godkjent", avsluttet_dato="2020-02-14")
    )
    db_session.commit()

    result = sok_byggesaker(
        db_session,
        MatrikkelnummerRequest(kommunenummer="4204", gardsnummer=58, bruksnummer=61),
    )

    assert result.antallTreff == 1
    assert result.treff[0].mappe.avsluttetDato == "2020-02-14"


def test_get_dokumenter_for_sak_returns_all_docs(db_session):
    from app.models import ArkivDokument
    from app.repositories.innsyn import get_dokumenter_for_sak

    sak = _make_sak()
    db_session.add(sak)
    db_session.add(
        ArkivDokument(
            id=uuid.uuid4(),
            sak_id=sak.id,
            tittel="Søknadsskjema",
            dokumenttype="Søknad",
            filnavn="soknad.pdf",
            mimetype="application/pdf",
            opprettet_dato="2023-01-02",
        )
    )
    db_session.add(
        ArkivDokument(
            id=uuid.uuid4(),
            sak_id=sak.id,
            tittel="Situasjonskart",
            dokumenttype="Vedlegg",
            filnavn="kart.pdf",
            mimetype="application/pdf",
            opprettet_dato="2023-01-03",
        )
    )
    db_session.commit()

    docs = get_dokumenter_for_sak(db_session, str(sak.id))

    assert len(docs) == 2
    titles = {d.tittel for d in docs}
    assert titles == {"Søknadsskjema", "Situasjonskart"}


def test_get_dokumenter_for_sak_returns_empty_for_unknown_id(db_session):
    from app.repositories.innsyn import get_dokumenter_for_sak

    docs = get_dokumenter_for_sak(db_session, str(uuid.uuid4()))

    assert docs == []
