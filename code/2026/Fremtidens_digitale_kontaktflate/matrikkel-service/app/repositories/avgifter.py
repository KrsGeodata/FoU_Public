# Third-party
from sqlalchemy.orm import Session

# Local
from app.models import Eiendom
from app.schema.avgifter import AvgiftResponse


class AvgifterRepository:
    """Repository for querying municipal fee records from the matrikkel_eiendommer table."""

    def __init__(self, db: Session):
        """Initialize the repository with a database session.

        Args:
            db (Session): SQLAlchemy database session.
        """
        self._db = db

    def get_avgifter(self, gnr: int, bnr: int, fnr: int, snr: int) -> list[AvgiftResponse] | None:
        """Retrieve municipal fees for a property.

        Args:
            gnr (int): Gardsnummer.
            bnr (int): Bruksnummer.
            fnr (int): Festenummer.
            snr (int): Seksjonsnummer.

        Returns:
            list[AvgiftResponse] | None: List of fee lines, or None if the property is not found.
        """
        row = self._db.query(Eiendom).filter_by(gnr=gnr, bnr=bnr, fnr=fnr, snr=snr).first()
        if not row:
            return None
        avgifter = (row.data or {}).get("gjeldende_gebyrer", [])
        return [
            AvgiftResponse(
                gebyr=a.get("GEBYR"),
                grunnlag=a.get("GRUNNLAG"),
                enhetspris=a.get("ENHETSPRIS"),
                andel=a.get("ANDEL"),
                korr=a.get("KORR"),
                fra_dato=a.get("FRA_DATO"),
                til_dato=a.get("TIL_DATO"),
                beløp=a.get("BELØP"),
                årsbeløp=a.get("ÅRSBELØP"),
                type=a.get("TYPE"),
            )
            for a in avgifter
        ]
