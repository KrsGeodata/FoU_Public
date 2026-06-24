# Standard library
import logging

# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.schema.innsyn import EiendomSokRequest, InnsynSokResponse, DokumentMetadata
from app.repositories.innsyn import sok_byggesaker, get_dokumenter_for_sak

logger = logging.getLogger("demo")

router = APIRouter()


@router.post(
    "/innsyn-sok/api/v1/eiendom/sok",
    response_model=InnsynSokResponse,
)
def eiendom_sok(request: EiendomSokRequest, db: Session = Depends(get_db)):
    """Search building cases by matrikkelnummer (FIKS Innsyn contract)."""
    mnr = request.matrikkelnummer
    logger.info("\U0001f7ea ARKIV     DB-oppslag: byggesaker for %s-%s/%s", mnr.kommunenummer, mnr.gardsnummer, mnr.bruksnummer)
    result = sok_byggesaker(db, mnr)
    logger.info("\U0001f7ea ARKIV     \u2713 %d byggesaker funnet (Noark 5 / FIKS Innsyn)", result.antallTreff)
    return result


@router.get(
    "/innsyn-sok/api/v1/dokument/{sak_id}",
    response_model=list[DokumentMetadata],
)
def get_dokument(sak_id: str, db: Session = Depends(get_db)):
    """Get all document metadata for a building case."""
    return get_dokumenter_for_sak(db, sak_id)
