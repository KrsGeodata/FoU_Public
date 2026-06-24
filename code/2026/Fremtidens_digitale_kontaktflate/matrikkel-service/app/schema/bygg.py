# Third-party
from pydantic import BaseModel


class EtasjeResponse(BaseModel):
    """API response model for a single building floor."""
    etasje: str | None = None
    ant_boenh: str | None = None
    bra_bolig: str | None = None
    bra_annet: str | None = None
    bra_totalt: str | None = None
    alt_areal: str | None = None
    alt_areal2: str | None = None
    bta_bolig: str | None = None
    bta_annet: str | None = None
    bta_totalt: str | None = None


class BruksenhetResponse(BaseModel):
    """API response model for a single residential unit."""

    adresse: str | None = None
    bolig: str | None = None
    bra: str | None = None
    bad: str | None = None
    wc: str | None = None
    rom: str | None = None
    type: str | None = None
    kjokken: str | None = None
    eiendom: str | None = None
    sist_endret: str | None = None


class VedtakResponse(BaseModel):
    """API response model for a building status record."""

    status: str | None = None
    dato: str | None = None
    arsak: str | None = None
    referanse: str | None = None
    reg_dato: str | None = None
    slettet_dato: str | None = None


class ByggResponse(BaseModel):
    """API response model for a building with nested floors and units."""

    type: str | None = None
    bygningsnr: str | None = None
    status: str | None = None
    vannforsyning: str | None = None
    avlop: str | None = None
    bra_bolig: str | None = None
    bra_annet: str | None = None
    etasjer: list[EtasjeResponse] = []
    bruksenheter: list[BruksenhetResponse] = []
    vedtak: list[VedtakResponse] = []
