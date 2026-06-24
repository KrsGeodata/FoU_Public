# Standard library
import logging

# Third-party
from fastapi import APIRouter, Depends, HTTPException
import httpx

# Local
from app.clients.fiks_innsyn_client import FiksInnsynClient
from app.dependencies import get_fiks_innsyn_client
from app.schema.byggesak import BuildingCaseResponse, DocumentResponse
from app.schema.fiks_models import ByggesakSokRequest
from app.repositories.byggesak import FiksByggesakRepository

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/byggesaker/sok", response_model=list[BuildingCaseResponse])
async def sok_byggesaker(
    request: ByggesakSokRequest,
    client: FiksInnsynClient = Depends(get_fiks_innsyn_client),
):
    """Search building cases by matrikkelnummer via FIKS Innsyn."""
    repo = FiksByggesakRepository(client)
    mnr = request.matrikkelnummer
    try:
        return await repo.get_building_cases(
            mnr.kommunenummer, mnr.gardsnummer, mnr.bruksnummer, mnr.festenummer, mnr.seksjonsnummer
        )
    except httpx.HTTPStatusError as e:
        logger.error("FIKS Innsyn sok failed: %s", e)
        raise HTTPException(status_code=502, detail="Feil ved oppslag mot arkiv-tjenesten")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Arkiv-tjenesten svarte ikke i tide")


@router.get("/byggesaker/{sak_id}/dokumenter", response_model=list[DocumentResponse])
async def get_byggesak_dokumenter(
    sak_id: str,
    client: FiksInnsynClient = Depends(get_fiks_innsyn_client),
):
    """Get documents for a building case via FIKS Innsyn."""
    repo = FiksByggesakRepository(client)
    try:
        return await repo.get_case_documents(sak_id)
    except httpx.HTTPStatusError as e:
        logger.error("FIKS Innsyn dokumenter failed: %s", e)
        raise HTTPException(status_code=502, detail="Feil ved oppslag mot arkiv-tjenesten")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Arkiv-tjenesten svarte ikke i tide")
