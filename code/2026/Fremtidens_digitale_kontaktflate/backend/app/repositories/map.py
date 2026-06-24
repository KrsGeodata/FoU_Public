# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.map import MapCoordinatesResponse


class MapRepository:
    """Repository for fetching property coordinates via MatrikkelClient."""

    def __init__(self, client: MatrikkelClient):
        self._client = client

    async def get_coordinates(self, mnr: Matrikkelnummer) -> MapCoordinatesResponse | None:
        """Fetch WGS84 coordinates for a property by matrikkelnummer."""
        eiendom = await self._client.get_eiendom(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr, kommunenr=mnr.kommunenr)
        if not eiendom:
            return None
        koordinater = eiendom.get("koordinater")
        if not koordinater:
            return None
        try:
            return MapCoordinatesResponse(
                lat=float(koordinater["nord"]),
                lon=float(koordinater["ost"]),
            )
        except (KeyError, ValueError, TypeError):
            return None
