# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.avgifter import AvgiftResponse


class AvgifterRepository:
    """Repository for fetching municipal fees via MatrikkelClient."""

    def __init__(self, client: MatrikkelClient):
        self._client = client

    async def get_avgifter(self, mnr: Matrikkelnummer) -> list[AvgiftResponse] | None:
        """Fetch municipal fees for a property by matrikkelnummer."""
        avgifter = await self._client.get_avgifter(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr)
        if not avgifter:
            return None
        return [
            AvgiftResponse(
                gebyr=a.get("gebyr"),
                grunnlag=a.get("grunnlag"),
                enhetspris=a.get("enhetspris"),
                andel=a.get("andel"),
                korr=a.get("korr"),
                fra_dato=a.get("fra_dato"),
                til_dato=a.get("til_dato"),
                beløp=a.get("beløp"),
                årsbeløp=a.get("årsbeløp"),
                type=a.get("type"),
            )
            for a in avgifter
        ]
