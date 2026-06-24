# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.neighbor_list import NeighborListResponse


class NeighborListRepository:
    """Repository for fetching neighboring properties via MatrikkelClient."""

    def __init__(self, client: MatrikkelClient):
        self._client = client

    async def get_neighbors(self, mnr: Matrikkelnummer, radius: float = 25) -> list[NeighborListResponse] | None:
        """Fetch neighboring properties within a given radius by matrikkelnummer."""
        naboer = await self._client.get_naboer(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr, radius)

        return [
            NeighborListResponse(
                address=n.get("address"),
                owner_name=n.get("owner_name"),
                phone=n.get("phone"),
                email=n.get("email"),
                distance=n.get("distance"),
                lat=n.get("lat"),
                lon=n.get("lon"),
            )
            for n in naboer
        ]
