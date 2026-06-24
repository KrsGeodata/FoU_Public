# Third-party
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.dependencies import get_matrikkel_client, get_matrikkelnummer
from app.schema.matrikkelnummer import Matrikkelnummer
from app.schema.property_info import PropertyInfoResponse
from app.repositories.property_info import PropertyInfoRepository

router = APIRouter()


@router.get("/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}", response_model=PropertyInfoResponse)
async def get_property_info(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    """Retrieve combined property and owner information by matrikkelnummer."""
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = PropertyInfoRepository(client)
    result = await repo.get_property_info(mnr)
    if not result:
        raise HTTPException(status_code=404, detail="Property not found")
    return result
