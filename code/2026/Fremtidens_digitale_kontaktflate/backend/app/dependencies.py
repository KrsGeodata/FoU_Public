from fastapi import Request

from app.clients.cms_client import CmsClient
from app.clients.matrikkel_client import MatrikkelClient
from app.clients.renovasjon_client import RenovasjonClient
from app.clients.fiks_innsyn_client import FiksInnsynClient
from app.clients.fiks_matrikkel_client import FiksMatrikkelClient
from app.schema.matrikkelnummer import Matrikkelnummer


def get_matrikkel_client(request: Request) -> MatrikkelClient:
    return request.app.state.matrikkel_client


def get_cms_client(request: Request) -> CmsClient:
    return request.app.state.cms_client


def get_renovasjon_client(request: Request) -> RenovasjonClient:
    return request.app.state.renovasjon_client


def get_fiks_innsyn_client(request: Request) -> FiksInnsynClient:
    return request.app.state.fiks_innsyn_client


def get_fiks_matrikkel_client(request: Request) -> FiksMatrikkelClient:
    return request.app.state.fiks_matrikkel_client


def get_matrikkelnummer(kommunenr: str, gnr: int, bnr: int, fnr: int = 0, snr: int = 0) -> Matrikkelnummer:
    return Matrikkelnummer(kommunenr=kommunenr, gnr=gnr, bnr=bnr, fnr=fnr, snr=snr)
