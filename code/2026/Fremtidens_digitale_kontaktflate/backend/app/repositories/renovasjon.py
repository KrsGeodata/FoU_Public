import logging

from app.clients.matrikkel_client import MatrikkelClient
from app.clients.renovasjon_client import RenovasjonClient
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.renovasjon import RenovasjonResponse, Hentedag

logger = logging.getLogger(__name__)


class RenovasjonRepository:
    """Repository that resolves a property's address and fetches waste collection data."""

    def __init__(self, matrikkel_client: MatrikkelClient, renovasjon_client: RenovasjonClient):
        self._matrikkel = matrikkel_client
        self._renovasjon = renovasjon_client

    async def get_renovasjon(self, mnr: Matrikkelnummer) -> RenovasjonResponse | None:
        """Get waste collection data for a property by matrikkelnummer."""
        eiendom = await self._matrikkel.get_eiendom(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr, kommunenr=mnr.kommunenr)
        if not eiendom:
            return None

        vegadresse = eiendom.get("vegadresse")
        postnummerområde = eiendom.get("postnummerområde")
        if not vegadresse or not postnummerområde:
            return RenovasjonResponse()

        adresse = f"{vegadresse}, {postnummerområde}"

        data = await self._renovasjon.get_hentedager(adresse)
        if not data:
            logger.warning("No renovasjon data for mnr=%s/%s/%s/%s", mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr)
            return RenovasjonResponse(adresse=adresse)

        if "error" in data:
            logger.info("Renovasjon error for mnr=%s/%s/%s/%s: %s", mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr, data.get("error"))
            return RenovasjonResponse(adresse=adresse)

        return RenovasjonResponse(
            adresse=data.get("adresse"),
            kommune=data.get("kommune"),
            kommunenummer=data.get("kommunenummer"),
            provider=data.get("provider"),
            hentedager=[
                Hentedag(
                    fraksjon=h.get("fraksjon", ""),
                    neste_henting=h.get("neste_henting"),
                    kommende_datoer=h.get("kommende_datoer", []),
                )
                for h in data.get("hentedager", [])
            ],
        )
