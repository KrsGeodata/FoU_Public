# Third-party
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.dependencies import get_matrikkel_client, get_matrikkelnummer
from app.repositories.neighbor_list import NeighborListRepository
from app.schema.neighbor_list import NeighborListResponse

router = APIRouter()


@router.get("/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/neighbors", response_model=list[NeighborListResponse])
async def get_neighbors(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    radius: float = 25,
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    """Retrieve neighboring properties within a given radius by matrikkelnummer."""
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = NeighborListRepository(client)
    result = await repo.get_neighbors(mnr, radius)
    if result is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return result
