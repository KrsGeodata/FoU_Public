# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.building_details import BuildingResponse, FloorResponse, UnitResponse, VedtakResponse


class BuildingDetailsRepository:
    """Repository for fetching detailed building information from the MatrikkelClient."""
    def __init__(self, client: MatrikkelClient):
        self._client = client

    async def get_buildings(self, mnr: Matrikkelnummer) -> list[BuildingResponse] | None:
        """Fetch all buildings for a property by matrikkelnummer."""
        bygg = await self._client.get_bygg(mnr.gnr, mnr.bnr, mnr.fnr, mnr.snr)
        if not bygg:
            return None
        return [
            BuildingResponse(
                building_type=b.get("type"),
                building_number=b.get("bygningsnr"),
                status=b.get("status"),
                water_supply=b.get("vannforsyning"),
                sewage=b.get("avlop"),
                residential_area=b.get("bra_bolig"),
                other_area=b.get("bra_annet"),
                floors=[
                    FloorResponse(
                        floor=e.get("etasje"),
                        dwelling_units=e.get("ant_boenh"),
                        residential_area=e.get("bra_bolig"),
                        other_area=e.get("bra_annet"),
                        total_area=e.get("bra_totalt"),
                        alt_area=e.get("alt_areal"),
                        alt_area2=e.get("alt_areal2"),
                        gross_area_residential=e.get("bta_bolig"),
                        gross_area_other=e.get("bta_annet"),
                        gross_area_total=e.get("bta_totalt"),
                    )
                    for e in b.get("etasjer", [])
                ],
                units=[
                    UnitResponse(
                        address=u.get("adresse"),
                        unit_number=u.get("bolig"),
                        area=u.get("bra"),
                        bathroom=u.get("bad"),
                        toilet=u.get("wc"),
                        rooms=u.get("rom"),
                        unit_type=u.get("type"),
                        kitchen=u.get("kjokken"),
                        property_id=u.get("eiendom"),
                        last_changed=u.get("sist_endret"),
                    )
                    for u in b.get("bruksenheter", [])
                ],
                vedtak=[
                    VedtakResponse(
                        status=v.get("status"),
                        date=v.get("dato"),
                        reason=v.get("arsak"),
                        reference=v.get("referanse"),
                        registration_date=v.get("reg_dato"),
                        deleted_date=v.get("slettet_dato"),
                    )
                    for v in b.get("vedtak", [])
                ],
            )
            for b in bygg
        ]
