# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.schema.avgifter import AvgiftResponse
from app.repositories.avgifter import AvgifterRepository

router = APIRouter()


@router.get("/eiendom/{gnr}/{bnr}/{fnr}/{snr}/avgifter", response_model=list[AvgiftResponse])
def get_avgifter(gnr: int, bnr: int, fnr: int, snr: int, db: Session = Depends(get_db)):
    """Retrieve municipal fees for a property.

    Args:
        gnr (int): Gardsnummer.
        bnr (int): Bruksnummer.
        fnr (int): Festenummer.
        snr (int): Seksjonsnummer.
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        list[AvgiftResponse]: List of municipal fee lines.

    Raises:
        HTTPException: 404 if the property is not found.
    """
    result = AvgifterRepository(db).get_avgifter(gnr, bnr, fnr, snr)
    if result is None:
        raise HTTPException(status_code=404, detail="Eiendom ikke funnet")
    return result
