from pydantic import BaseModel, Field


class Hentedag(BaseModel):
    fraksjon: str
    neste_henting: str | None = None
    kommende_datoer: list[str] = Field(default_factory=list)


class RenovasjonResponse(BaseModel):
    adresse: str | None = None
    kommune: str | None = None
    kommunenummer: str | None = None
    provider: str | None = None
    hentedager: list[Hentedag] = Field(default_factory=list)
