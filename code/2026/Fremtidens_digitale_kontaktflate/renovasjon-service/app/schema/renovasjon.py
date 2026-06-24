from pydantic import BaseModel


class Hentedag(BaseModel):
    fraksjon: str
    neste_henting: str | None = None
    kommende_datoer: list[str] = []


class HentedagerResponse(BaseModel):
    adresse: str
    kommune: str | None = None
    kommunenummer: str | None = None
    provider: str | None = None
    hentedager: list[Hentedag] = []


class RenovasjonErrorResponse(BaseModel):
    adresse: str
    kommune: str | None = None
    kommunenummer: str | None = None
    provider: str | None = None
    error: str
    message: str | None = None
