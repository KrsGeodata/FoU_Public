# Third-party
from sqlalchemy.orm import Session

# Local
from app.models import ArkivSak, ArkivDokument
from app.schema.innsyn import (
    MatrikkelnummerRequest,
    InnsynSokResponse,
    InnsynTreff,
    MappeByggesak,
    MappeMatrikkelnummer,
    Saksnummer,
    DokumentMetadata,
)


def sok_byggesaker(db: Session, matrikkelnummer: MatrikkelnummerRequest) -> InnsynSokResponse:
    """Search building cases by matrikkelnummer."""
    saker = (
        db.query(ArkivSak)
        .filter(
            ArkivSak.kommunenummer == matrikkelnummer.kommunenummer,
            ArkivSak.gardsnummer == matrikkelnummer.gardsnummer,
            ArkivSak.bruksnummer == matrikkelnummer.bruksnummer,
            ArkivSak.festenummer == matrikkelnummer.festenummer,
            ArkivSak.seksjonsnummer == matrikkelnummer.seksjonsnummer,
        )
        .all()
    )

    treff = [
        InnsynTreff(
            meldingId=str(sak.id),
            mappe=MappeByggesak(
                saksnummer=Saksnummer(
                    saksaar=sak.saksaar,
                    sakssekvensnummer=sak.sakssekvensnummer,
                ),
                tittel=sak.tittel,
                saksstatus=sak.saksstatus,
                saksdato=sak.saksdato,
                avsluttetDato=sak.avsluttet_dato,
                beskrivelse=sak.beskrivelse,
                matrikkelnummer=[
                    MappeMatrikkelnummer(
                        kommunenummer=sak.kommunenummer,
                        gardsnummer=sak.gardsnummer,
                        bruksnummer=sak.bruksnummer,
                        festenummer=sak.festenummer,
                        seksjonsnummer=sak.seksjonsnummer,
                    )
                ],
            ),
        )
        for sak in saker
    ]

    return InnsynSokResponse(antallTreff=len(treff), treff=treff)


def get_dokumenter_for_sak(db: Session, sak_id: str) -> list[DokumentMetadata]:
    """Get all documents for a given case."""
    dokumenter = db.query(ArkivDokument).filter(ArkivDokument.sak_id == sak_id).all()

    return [
        DokumentMetadata(
            dokumentId=str(dok.id),
            tittel=dok.tittel,
            dokumenttype=dok.dokumenttype,
            filnavn=dok.filnavn,
            mimetype=dok.mimetype,
            opprettetDato=dok.opprettet_dato,
        )
        for dok in dokumenter
    ]
