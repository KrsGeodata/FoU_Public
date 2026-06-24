# Third-party
from pydantic import BaseModel


# --- Request schemas ---

class MatrikkelnummerRequest(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int = 0
    seksjonsnummer: int = 0


class EiendomSokRequest(BaseModel):
    matrikkelnummer: MatrikkelnummerRequest
    akseptertMeldingVersjon: list[str] = ["fakturaV1", "mappeV1", "forsendelseV1"]


# --- Response schemas ---

class Saksnummer(BaseModel):
    saksaar: int
    sakssekvensnummer: int


class MappeMatrikkelnummer(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int
    seksjonsnummer: int


class MappeByggesak(BaseModel):
    saksnummer: Saksnummer
    tittel: str
    saksstatus: str
    saksdato: str
    avsluttetDato: str | None = None
    beskrivelse: str | None = None
    matrikkelnummer: list[MappeMatrikkelnummer]


class InnsynTreff(BaseModel):
    meldingId: str
    meldingType: str = "byggesak"
    versjon: str = "byggesakV1"
    mappe: MappeByggesak


class InnsynSokResponse(BaseModel):
    antallTreff: int
    treff: list[InnsynTreff]


class DokumentMetadata(BaseModel):
    dokumentId: str
    tittel: str
    dokumenttype: str
    filnavn: str
    mimetype: str
    opprettetDato: str
