# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.schema.naboer import NaboResponse
from app.repositories.naboer import NaboerRepository

router = APIRouter()


@router.get("/eiendom/{gnr}/{bnr}/{fnr}/{snr}/naboer", response_model=list[NaboResponse])
def get_naboer(gnr: int, bnr: int, fnr: int, snr: int, radius: float = 25, db: Session = Depends(get_db)):
    """Retrieve neighboring properties within a given radius.

    Args:
        gnr (int): Gardsnummer of the origin property.
        bnr (int): Bruksnummer of the origin property.
        fnr (int): Festenummer of the origin property.
        snr (int): Seksjonsnummer of the origin property.
        radius (float, optional): Search radius in metres. Defaults to 25.
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        list[NaboResponse]: Neighboring properties sorted by ascending distance.

    Raises:
        HTTPException: 404 if the origin property is not found.
    """
    result = NaboerRepository(db).get_naboer(gnr, bnr, fnr, snr, radius)
    if result is None:
        raise HTTPException(status_code=404, detail="Eiendom ikke funnet")
    return result
