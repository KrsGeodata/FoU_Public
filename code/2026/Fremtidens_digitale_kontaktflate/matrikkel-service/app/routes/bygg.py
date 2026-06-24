# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.schema.bygg import ByggResponse
from app.repositories.bygg import ByggRepository

router = APIRouter()


@router.get("/eiendom/{gnr}/{bnr}/{fnr}/{snr}/bygg", response_model=list[ByggResponse])
def get_bygg(gnr: int, bnr: int, fnr: int, snr: int, db: Session = Depends(get_db)):
    """Retrieve buildings, floors and units for a property.

    Args:
        gnr (int): Gardsnummer.
        bnr (int): Bruksnummer.
        fnr (int): Festenummer.
        snr (int): Seksjonsnummer.
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        list[ByggResponse]: List of buildings with nested floors and units.

    Raises:
        HTTPException: 404 if the property is not found.
    """
    result = ByggRepository(db).get_bygg(gnr, bnr, fnr, snr)
    if result is None:
        raise HTTPException(status_code=404, detail="Eiendom ikke funnet")
    return result
