# Standard library
import json

# Third-party
from sqlalchemy import text
from sqlalchemy.orm import Session

# Local
from app.models import Eiendom
from app.schema.fiks_matrikkel_eier import (
    PersonType,
    FinnEiendommerResponse,
    EiendomMedAdresse,
    MatrikkelnummerResponse,
    MatrikkelnummerFilter,
    FinnEiereResponse,
    EiendomEiere,
    EierInfo,
)


class FiksMatrikkelEierRepository:
    """Repository for FIKS Matrikkel Eier lookups against the matrikkel database."""

    def __init__(self, db: Session):
        self._db = db

    def finn_eiendommer(self, person_type: "PersonType", verdi: str) -> FinnEiendommerResponse:
        """Find properties owned by a person (fodselsnummer) or organisation (orgnr).

        Uses json.dumps() for JSONB filter values to prevent SQL injection.
        """
        if person_type == PersonType.FYSISK_PERSON:
            json_key = "PERSONNR"
        else:
            json_key = "ORGNR"

        # Safe JSONB query using parameterized json value
        query = text("""
            SELECT id, gnr, bnr, fnr, snr, data
            FROM matrikkel_eiendommer
            WHERE data->'eierforhold' @> :filter
        """)

        filter_value = json.dumps([{json_key: verdi}])
        rows = self._db.execute(query, {"filter": filter_value}).fetchall()

        eiendommer = []
        for row in rows:
            data = row.data or {}
            kommunenr = data.get("KOMMUNENR", "")
            eiendommer.append(
                EiendomMedAdresse(
                    matrikkelnummer=MatrikkelnummerResponse(
                        kommunenummer=kommunenr,
                        gardsnummer=row.gnr,
                        bruksnummer=row.bnr,
                        festenummer=row.fnr,
                        seksjonsnummer=row.snr,
                    ),
                    vegadresse=data.get("VEGADRESSE"),
                    postnummerområde=data.get("POSTNUMMEROMRÅDE"),
                )
            )

        return FinnEiendommerResponse(eiendommer=eiendommer)

    def finn_eiere(self, matrikkelnumre: list[MatrikkelnummerFilter]) -> FinnEiereResponse:
        """Find owners of one or more properties by matrikkelnummer.

        Uses a single batched query with OR-conditions instead of one query per matrikkelnummer.
        """
        from sqlalchemy import or_, and_

        # Build a single query with OR for all matrikkelnumre
        conditions = [
            and_(
                Eiendom.gnr == mnr.gardsnummer,
                Eiendom.bnr == mnr.bruksnummer,
                Eiendom.fnr == mnr.festenummer,
                Eiendom.snr == mnr.seksjonsnummer,
            )
            for mnr in matrikkelnumre
        ]

        rows = self._db.query(Eiendom).filter(or_(*conditions)).all() if conditions else []

        # Index rows by (gnr, bnr, fnr, snr) for fast lookup
        row_map = {(r.gnr, r.bnr, r.fnr, r.snr): r for r in rows}

        resultater = []
        for mnr in matrikkelnumre:
            row = row_map.get((mnr.gardsnummer, mnr.bruksnummer, mnr.festenummer, mnr.seksjonsnummer))

            eiere = []
            if row:
                eierforhold = (row.data or {}).get("eierforhold", [])
                eiere = [
                    EierInfo(
                        type=e.get("TYPE"),
                        navn=e.get("NAVN"),
                        personnr=e.get("PERSONNR"),
                        orgnr=e.get("ORGNR"),
                        adresse=e.get("ADRESSE"),
                        poststed=e.get("POSTSTED"),
                        andel=e.get("ANDEL"),
                    )
                    for e in eierforhold
                ]

            resultater.append(
                EiendomEiere(
                    matrikkelnummer=MatrikkelnummerResponse(
                        kommunenummer=mnr.kommunenummer,
                        gardsnummer=mnr.gardsnummer,
                        bruksnummer=mnr.bruksnummer,
                        festenummer=mnr.festenummer,
                        seksjonsnummer=mnr.seksjonsnummer,
                    ),
                    eiere=eiere,
                )
            )

        return FinnEiereResponse(resultater=resultater)
