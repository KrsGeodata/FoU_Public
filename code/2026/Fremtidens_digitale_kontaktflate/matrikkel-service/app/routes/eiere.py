# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.schema.eiere import EierResponse
from app.repositories.eiere import EiereRepository

router = APIRouter()


@router.get("/eiendom/{gnr}/{bnr}/{fnr}/{snr}/eiere", response_model=list[EierResponse])
def get_eiere(gnr: int, bnr: int, fnr: int, snr: int, db: Session = Depends(get_db)):
    """Retrieve ownership information for a property.

    Args:
        gnr (int): Gardsnummer.
        bnr (int): Bruksnummer.
        fnr (int): Festenummer.
        snr (int): Seksjonsnummer.
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        list[EierResponse]: List of owners extracted from JSONB eierforhold.

    Raises:
        HTTPException: 404 if the property is not found.
    """
    result = EiereRepository(db).get_eiere(gnr, bnr, fnr, snr)
    if result is None:
        raise HTTPException(status_code=404, detail="Eiendom ikke funnet")
    return result
