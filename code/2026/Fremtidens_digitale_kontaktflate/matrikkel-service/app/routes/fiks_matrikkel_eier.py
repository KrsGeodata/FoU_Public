# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.repositories.fiks_matrikkel_eier import FiksMatrikkelEierRepository
from app.schema.fiks_matrikkel_eier import (
    FinnEiendommerRequest,
    FinnEiendommerResponse,
    MatrikkelnummerFilter,
    FinnEiereResponse,
)

router = APIRouter(prefix="/matrikkel-eier/api/v1/{fiks_org_id}")


@router.post(
    "/finn-eiendommer",
    response_model=FinnEiendommerResponse,
)
def finn_eiendommer(
    fiks_org_id: str,
    request: FinnEiendommerRequest,
    db: Session = Depends(get_db),
):
    """Find properties owned by a person or organisation (FIKS Matrikkel Eier contract)."""
    repo = FiksMatrikkelEierRepository(db)
    return repo.finn_eiendommer(request.type, request.verdi)


@router.post(
    "/finn-eiere",
    response_model=FinnEiereResponse,
)
def finn_eiere(
    fiks_org_id: str,
    request: list[MatrikkelnummerFilter],
    db: Session = Depends(get_db),
):
    """Find owners of properties by matrikkelnummer (FIKS Matrikkel Eier contract)."""
    repo = FiksMatrikkelEierRepository(db)
    return repo.finn_eiere(request)
