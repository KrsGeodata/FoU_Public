# Standard library
from enum import Enum
# Third-party
from pydantic import BaseModel


# --- Request schemas ---

class PersonType(str, Enum):
    FYSISK_PERSON = "FYSISK_PERSON"
    JURIDISK_PERSON = "JURIDISK_PERSON"


class FinnEiendommerRequest(BaseModel):
    """Find properties by person identifier (fodselsnummer or orgnr)."""
    type: PersonType
    verdi: str  # fodselsnummer or orgnr


class MatrikkelnummerFilter(BaseModel):
    """A matrikkelnummer used for owner lookup."""
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int = 0
    seksjonsnummer: int = 0


# --- Response schemas ---

class MatrikkelnummerResponse(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int
    seksjonsnummer: int


class EiendomMedAdresse(BaseModel):
    matrikkelnummer: MatrikkelnummerResponse
    vegadresse: str | None = None
    postnummerområde: str | None = None


class FinnEiendommerResponse(BaseModel):
    eiendommer: list[EiendomMedAdresse]


class EierInfo(BaseModel):
    type: str | None = None
    navn: str | None = None
    personnr: str | None = None
    orgnr: str | None = None
    adresse: str | None = None
    poststed: str | None = None
    andel: str | None = None


class EiendomEiere(BaseModel):
    matrikkelnummer: MatrikkelnummerResponse
    eiere: list[EierInfo]


class FinnEiereResponse(BaseModel):
    resultater: list[EiendomEiere]
