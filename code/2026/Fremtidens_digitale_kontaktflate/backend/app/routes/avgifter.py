# Third-party
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.dependencies import get_matrikkel_client, get_matrikkelnummer
from app.schema.avgifter import AvgiftResponse
from app.repositories.avgifter import AvgifterRepository

router = APIRouter()


@router.get("/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/municipal-fees", response_model=list[AvgiftResponse])
async def get_municipal_fees(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    """Retrieve municipal fees for a property by matrikkelnummer."""
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = AvgifterRepository(client)
    result = await repo.get_avgifter(mnr)
    if result is None:
        raise HTTPException(status_code=404, detail="No fee record found for property")
    return result
