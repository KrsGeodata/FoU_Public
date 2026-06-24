# Third-party
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.dependencies import get_matrikkel_client, get_matrikkelnummer
from app.schema.building_details import BuildingResponse
from app.repositories.building_details import BuildingDetailsRepository

router = APIRouter()


@router.get("/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/buildings", response_model=list[BuildingResponse])
async def get_building_details(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = BuildingDetailsRepository(client)
    result = await repo.get_buildings(mnr)
    if result is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return result
