# Standard library
import math

# Third-party
from sqlalchemy.orm import Session

# Local
from app.models import Eiendom
from app.schema.naboer import NaboResponse


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute the great-circle distance in metres between two WGS84 coordinates.

    Args:
        lat1 (float): Latitude of the origin point in decimal degrees.
        lon1 (float): Longitude of the origin point in decimal degrees.
        lat2 (float): Latitude of the target point in decimal degrees.
        lon2 (float): Longitude of the target point in decimal degrees.

    Returns:
        float: Distance in metres.
    """
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _coords(row: Eiendom) -> tuple[float, float] | None:
    """Extract WGS84 coordinates from the first teig in a property's JSONB data.

    Args:
        row (Eiendom): SQLAlchemy model instance.

    Returns:
        tuple[float, float] | None: (latitude, longitude) or None if unavailable.
    """
    teiger = (row.data or {}).get("teiger", [])
    if not teiger:
        return None
    try:
        return float(teiger[0]["NORD"]), float(teiger[0]["ØST"])
    except (KeyError, ValueError, TypeError):
        return None


class NaboerRepository:
    """Repository for querying neighboring properties from the matrikkel_eiendommer table."""

    def __init__(self, db: Session):
        """Initialize the repository with a database session.

        Args:
            db (Session): SQLAlchemy database session.
        """
        self._db = db

    def get_naboer(self, gnr: int, bnr: int, fnr: int, snr: int, radius: float = 25) -> list[NaboResponse] | None:
        """Retrieve neighboring properties within a given radius.

        Args:
            gnr (int): Gardsnummer of the origin property.
            bnr (int): Bruksnummer of the origin property.
            fnr (int): Festenummer of the origin property.
            snr (int): Seksjonsnummer of the origin property.
            radius (float, optional): Search radius in metres. Defaults to 25.

        Returns:
            list[NaboResponse] | None: Neighboring properties sorted by ascending distance,
                or None if the origin property is not found.
        """
        origin = self._db.query(Eiendom).filter_by(gnr=gnr, bnr=bnr, fnr=fnr, snr=snr).first()
        if not origin:
            return None

        origin_coords = _coords(origin)
        if not origin_coords:
            return []

        origin_lat, origin_lon = origin_coords
        alle = self._db.query(Eiendom).filter(
            (Eiendom.gnr != gnr) | (Eiendom.bnr != bnr) | (Eiendom.fnr != fnr) | (Eiendom.snr != snr)
        ).all()

        result = []
        for row in alle:
            coords = _coords(row)
            if not coords:
                continue
            lat, lon = coords
            dist = _haversine(origin_lat, origin_lon, lat, lon)
            if dist > radius:
                continue
            data = row.data or {}
            eierforhold = data.get("eierforhold", [])
            owner = eierforhold[0] if eierforhold else {}
            result.append(NaboResponse(
                address=data.get("VEGADRESSE"),
                owner_name=owner.get("NAVN"),
                phone=owner.get("TELEFON"),
                email=owner.get("EPOST"),
                distance=round(dist, 1),
                lat=lat,
                lon=lon,
            ))

        result.sort(key=lambda n: n.distance or 0)
        return result
