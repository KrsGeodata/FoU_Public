# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.property_info import PropertyInfoResponse, OwnerInfo, RepresentantInfo


class PropertyInfoRepository:
    """Repository for fetching property information via MatrikkelClient."""

    def __init__(self, client: MatrikkelClient):
        self._client = client

    async def get_property_info(self, mnr: Matrikkelnummer) -> PropertyInfoResponse | None:
        """Fetch combined property and owner information by matrikkelnummer."""
        eiendom = await self._client.get_eiendom(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr, kommunenr=mnr.kommunenr)
        if not eiendom:
            return None

        eiere = await self._client.get_eiere(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr)

        owners = [
            OwnerInfo(
                type=e.get("type"),
                personnr=e.get("personnr"),
                name=e.get("navn"),
                eierbrok=e.get("andel"),
                orgnr=e.get("orgnr"),
                representanter=[
                    RepresentantInfo(personnr=r.get("personnr"), navn=r.get("navn"))
                    for r in e.get("representanter", [])
                ],
            )
            for e in eiere
        ]

        return PropertyInfoResponse(
            address=eiendom.get("vegadresse"),
            owners=owners,
            propertyArea=float(eiendom["areal"]) if eiendom.get("areal") else None,
            gnr=str(eiendom.get("gnr")),
            bnr=str(eiendom.get("bnr")),
            fnr=str(eiendom.get("fnr")),
            snr=str(eiendom.get("snr")),
            municipality_id=eiendom.get("kommunenr"),
        )
