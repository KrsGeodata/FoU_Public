import logging

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.config import ERROR_STATUS_MAP
from app.repositories.renovasjon import RenovasjonRepository
from app.schema.renovasjon import HentedagerResponse, RenovasjonErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()


_repo = RenovasjonRepository()


def get_renovasjon_repository() -> RenovasjonRepository:
    return _repo


@router.get("/hentedager", response_model=HentedagerResponse)
async def get_hentedager(
    adresse: str = Query(..., description="Full Norwegian address"),
    repo: RenovasjonRepository = Depends(get_renovasjon_repository),
):
    try:
        result = await repo.get_hentedager(adresse)
    except Exception:
        logger.exception("Unexpected error processing renovasjon request for %s", adresse)
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "message": "An unexpected error occurred"},
        )

    if isinstance(result, RenovasjonErrorResponse):
        status = ERROR_STATUS_MAP.get(result.error, 400)
        return JSONResponse(status_code=status, content=result.model_dump())

    return result
