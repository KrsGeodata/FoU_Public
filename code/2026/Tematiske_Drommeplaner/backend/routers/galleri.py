"""Gallery routes - API endpoints for managing gallery items"""

from fastapi import APIRouter, HTTPException
from database.database import get_db
from schemas.galleri import GalleriItem, GalleriItemCreate, GalleriItemUpdate, GalleriItemList, DatafeltTypeOption
from services.galleri_service import (
    get_datafelt_types,
    get_all_galleri_items,
    get_galleri_for_tema_tittel,
    get_galleri_item,
    create_galleri_item,
    update_galleri_item,
    delete_galleri_item,
)

router = APIRouter(prefix="/api/admin/galleri", tags=["gallery"])


@router.get("/datafelt-types", response_model=list[DatafeltTypeOption])
def list_datafelt_types():
    """Get all available datafelt types (units: m, m2, %, °)"""
    with get_db() as conn:
        return get_datafelt_types(conn)


@router.get("", response_model=GalleriItemList)
def get_all_gallery_items():
    """Get all gallery items across all tema_tittel"""
    with get_db() as conn:
        items = get_all_galleri_items(conn)
        return GalleriItemList(items=items, total=len(items))


@router.get("/tema-tittel/{tema_tittel_id}", response_model=GalleriItemList)
def get_galleri_by_tema_tittel(tema_tittel_id: int):
    """Get all gallery items for a specific tema_tittel"""
    with get_db() as conn:
        items = get_galleri_for_tema_tittel(conn, tema_tittel_id)
        return GalleriItemList(items=items, total=len(items))


@router.get("/{item_id}", response_model=GalleriItem)
def get_single_galleri_item(item_id: int):
    """Get a single gallery item by ID"""
    with get_db() as conn:
        return get_galleri_item(conn, item_id)


@router.post("", response_model=GalleriItem, status_code=201)
def create_new_galleri_item(payload: GalleriItemCreate):
    """Create a new gallery item"""
    with get_db() as conn:
        return create_galleri_item(conn, payload)


@router.put("/{item_id}", response_model=GalleriItem)
def update_existing_galleri_item(item_id: int, payload: GalleriItemUpdate):
    """Update a gallery item"""
    with get_db() as conn:
        return update_galleri_item(conn, item_id, payload)


@router.delete("/{item_id}", status_code=204)
def delete_existing_galleri_item(item_id: int):
    """Delete a gallery item"""
    with get_db() as conn:
        delete_galleri_item(conn, item_id)
