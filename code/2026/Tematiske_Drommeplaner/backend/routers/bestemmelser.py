from fastapi import APIRouter, Depends

from database.database import get_db
from routers.auth import require_admin
from schemas.bestemmelse import BestemmelseItem, BestemmelseUpsertRequest
from services.bestemmelse_service import create_bestemmelse, delete_bestemmelse, update_bestemmelse

router = APIRouter(prefix="/api", tags=["bestemmelser"], dependencies=[Depends(require_admin)])


@router.post("/plans/{plan_id}/bestemmelser", response_model=BestemmelseItem)
def post_bestemmelse(plan_id: int, payload: BestemmelseUpsertRequest):
    with get_db() as conn:
        return create_bestemmelse(conn, plan_id, payload)


@router.put("/bestemmelser/{bestemmelse_id}", response_model=BestemmelseItem)
def put_bestemmelse(bestemmelse_id: int, payload: BestemmelseUpsertRequest):
    with get_db() as conn:
        return update_bestemmelse(conn, bestemmelse_id, payload)


@router.delete("/bestemmelser/{bestemmelse_id}")
def remove_bestemmelse(bestemmelse_id: int):
    with get_db() as conn:
        delete_bestemmelse(conn, bestemmelse_id)
    return {"ok": True}
