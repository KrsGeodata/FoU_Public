from fastapi import APIRouter, Depends, Query

from database.database import get_db
from routers.auth import require_admin
from schemas.bestemmelse import PlanDetail
from schemas.plan import (
    FormalCodeGroup,
    HensynssoneOption,
    PlanListItem,
    PlanUpsertRequest,
    PlanregisterSuggestion,
)
from services.plan_mutations import create_plan, delete_plan, update_plan
from services.plan_queries import (
    get_plan_detail,
    list_active_plans,
    list_formal_codes_grouped,
    list_hensynssoner,
    search_planregister,
)

router = APIRouter(prefix="/api", tags=["plans"])


@router.get("/plans", response_model=list[PlanListItem])
def get_plans():
    with get_db() as conn:
        return list_active_plans(conn)


@router.get("/planregister/search", response_model=list[PlanregisterSuggestion])
def search_plans(q: str = Query(min_length=1), limit: int = Query(default=10, ge=1, le=30)):
    with get_db() as conn:
        return search_planregister(conn, q, limit)


@router.get("/hensynssoner", response_model=list[HensynssoneOption])
def get_hensynssoner():
    with get_db() as conn:
        return list_hensynssoner(conn)


@router.get("/formalkoder", response_model=list[FormalCodeGroup])
def get_formalkoder():
    with get_db() as conn:
        return list_formal_codes_grouped(conn)


@router.post("/plans", response_model=PlanDetail, dependencies=[Depends(require_admin)])
def post_plan(payload: PlanUpsertRequest):
    with get_db() as conn:
        plan_id = create_plan(conn, payload)
        return get_plan_detail(conn, plan_id)


@router.get("/plans/{plan_id}", response_model=PlanDetail)
def get_plan(plan_id: int):
    with get_db() as conn:
        return get_plan_detail(conn, plan_id)


@router.put("/plans/{plan_id}", response_model=PlanDetail, dependencies=[Depends(require_admin)])
def put_plan(plan_id: int, payload: PlanUpsertRequest):
    with get_db() as conn:
        update_plan(conn, plan_id, payload)
        return get_plan_detail(conn, plan_id)


@router.delete("/plans/{plan_id}", dependencies=[Depends(require_admin)])
def remove_plan(plan_id: int):
    with get_db() as conn:
        delete_plan(conn, plan_id)
    return {"ok": True}


