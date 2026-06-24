# Third-party
from sqlalchemy.orm import Session

# Local
from app.models import Eiendom
from app.schema.eiendom import EiendomResponse, KoordinaterResponse


def _to_response(row: Eiendom) -> EiendomResponse:
    """Map a database row to an EiendomResponse.

    Args:
        row (Eiendom): SQLAlchemy model instance from the matrikkel_eiendommer table.

    Returns:
        EiendomResponse: Populated response model with fields extracted from JSONB data.
    """
    data = row.data or {}
    teiger = data.get("teiger", [])
    koordinater = None
    if teiger:
        koordinater = KoordinaterResponse(
            nord=teiger[0].get("NORD"),
            ost=teiger[0].get("ØST"),
        )
    return EiendomResponse(
        id=row.id,
        gnr=row.gnr,
        bnr=row.bnr,
        fnr=row.fnr,
        snr=row.snr,
        avfallsor_id=data.get("AVFALLSOR_ID"),
        eiendomstype=data.get("EIENDOMSTYPE"),
        vegadresse=data.get("VEGADRESSE"),
        postnummerområde=data.get("POSTNUMMEROMRÅDE"),
        kommunenr=data.get("KOMMUNENR"),
        areal=data.get("BER.AREAL"),
        koordinater=koordinater,
    )


class EiendomRepository:
    """Repository for querying property records from the matrikkel_eiendommer table."""

    def __init__(self, db: Session):
        """Initialize the repository with a database session.

        Args:
            db (Session): SQLAlchemy database session.
        """
        self._db = db

    def list_all(self) -> list[EiendomResponse]:
        """Retrieve all properties.

        Returns:
            list[EiendomResponse]: All properties with basic info and coordinates.
        """
        rows = self._db.query(Eiendom).all()
        return [_to_response(row) for row in rows]

    def get_by_cadastral(
        self, gnr: int, bnr: int, fnr: int, snr: int, kommunenr: str | None = None,
    ) -> EiendomResponse | None:
        """Retrieve a property by its cadastral identifiers.

        Args:
            gnr (int): Gardsnummer.
            bnr (int): Bruksnummer.
            fnr (int): Festenummer.
            snr (int): Seksjonsnummer.
            kommunenr (str, optional): Kommunenummer. Narrows to a single municipality.

        Returns:
            EiendomResponse | None: Property data, or None if not found.
        """
        query = self._db.query(Eiendom).filter_by(gnr=gnr, bnr=bnr, fnr=fnr, snr=snr)
        if kommunenr:
            query = query.filter(Eiendom.data["KOMMUNENR"].as_string() == kommunenr)
        row = query.first()
        return _to_response(row) if row else None

    def get_by_id(self, property_id: int) -> EiendomResponse | None:
        """Retrieve a property by its internal integer ID.

        Args:
            property_id (int): Internal serial ID of the property.

        Returns:
            EiendomResponse | None: Property data, or None if not found.
        """
        row = self._db.query(Eiendom).filter_by(id=property_id).first()
        return _to_response(row) if row else None
