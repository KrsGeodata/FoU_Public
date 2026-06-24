# Third-party
from sqlalchemy.orm import Session

# Local
from app.models import Eiendom
from app.schema.eiere import EierResponse, RepresentantResponse


class EiereRepository:
    """Repository for querying ownership records from the matrikkel_eiendommer table."""

    def __init__(self, db: Session):
        """Initialize the repository with a database session.

        Args:
            db (Session): SQLAlchemy database session.
        """
        self._db = db

    def get_eiere(self, gnr: int, bnr: int, fnr: int, snr: int) -> list[EierResponse] | None:
        """Retrieve ownership information for a property.

        Args:
            gnr (int): Gardsnummer.
            bnr (int): Bruksnummer.
            fnr (int): Festenummer.
            snr (int): Seksjonsnummer.

        Returns:
            list[EierResponse] | None: List of owners, or None if the property is not found.
        """
        row = self._db.query(Eiendom).filter_by(gnr=gnr, bnr=bnr, fnr=fnr, snr=snr).first()
        if not row:
            return None
        eierforhold = (row.data or {}).get("eierforhold", [])
        return [
            EierResponse(
                type=e.get("TYPE"),
                personnr=e.get("PERSONNR"),
                navn=e.get("NAVN"),
                adresse=e.get("ADRESSE"),
                poststed=e.get("POSTSTED"),
                andel=e.get("ANDEL"),
                rolle=e.get("ROLLE"),
                ervervet=e.get("ERVERVET"),
                orgnr=e.get("ORGNR"),
                representanter=[
                    RepresentantResponse(personnr=r.get("PERSONNR"), navn=r.get("NAVN"))
                    for r in e.get("REPRESENTANTER", [])
                ],
            )
            for e in eierforhold
        ]
