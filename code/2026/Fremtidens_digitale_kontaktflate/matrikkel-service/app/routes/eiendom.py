# Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.schema.eiendom import EiendomResponse
from app.repositories.eiendom import EiendomRepository

router = APIRouter()


@router.get("/eiendommer", response_model=list[EiendomResponse])
def list_eiendommer(db: Session = Depends(get_db)):
    """Retrieve all properties in the matrikkel.

    Args:
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        list[EiendomResponse]: All properties with basic info and coordinates.
    """
    return EiendomRepository(db).list_all()


@router.get("/eiendom", response_model=EiendomResponse)
def get_eiendom(
    gnr: int,
    bnr: int,
    fnr: int = 0,
    snr: int = 0,
    kommunenr: str | None = None,
    db: Session = Depends(get_db),
):
    """Retrieve basic property information by cadastral identifiers.

    Args:
        gnr (int): Gardsnummer.
        bnr (int): Bruksnummer.
        fnr (int, optional): Festenummer. Defaults to 0.
        snr (int, optional): Seksjonsnummer. Defaults to 0.
        kommunenr (str, optional): Kommunenummer. Narrows search to a single municipality.
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        EiendomResponse: Basic property info and coordinates.

    Raises:
        HTTPException: 404 if the property is not found.
    """
    result = EiendomRepository(db).get_by_cadastral(gnr, bnr, fnr, snr, kommunenr=kommunenr)
    if not result:
        raise HTTPException(status_code=404, detail="Eiendom ikke funnet")
    return result


@router.get("/eiendom/{id}", response_model=EiendomResponse)
def get_eiendom_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieve basic property information by internal integer ID.

    Args:
        id (int): Internal serial ID of the property.
        db (Session, optional): Database session. Defaults to Depends(get_db).

    Returns:
        EiendomResponse: Basic property info and coordinates.

    Raises:
        HTTPException: 404 if the property is not found.
    """
    result = EiendomRepository(db).get_by_id(id)
    if not result:
        raise HTTPException(status_code=404, detail="Eiendom ikke funnet")
    return result
