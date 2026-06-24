# Third-party
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.clients.renovasjon_client import RenovasjonClient
from app.dependencies import get_matrikkel_client, get_renovasjon_client, get_matrikkelnummer
from app.schema.renovasjon import RenovasjonResponse
from app.repositories.renovasjon import RenovasjonRepository

router = APIRouter()


@router.get("/property/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/renovasjon", response_model=RenovasjonResponse)
async def get_renovasjon(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    matrikkel_client: MatrikkelClient = Depends(get_matrikkel_client),
    renovasjon_client: RenovasjonClient = Depends(get_renovasjon_client),
):
    """Get waste collection data for a specific property by matrikkelnummer."""
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = RenovasjonRepository(matrikkel_client, renovasjon_client)
    result = await repo.get_renovasjon(mnr)
    if result is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return result
