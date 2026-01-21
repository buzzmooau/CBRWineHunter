"""
Wineries API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.winery import Winery


# Import schemas (we'll define these inline for now to avoid circular imports)
from pydantic import BaseModel
from datetime import datetime


class WinerySummary(BaseModel):
    id: int
    name: str
    slug: str
    shop_url: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True


class WineryResponse(BaseModel):
    id: int
    name: str
    slug: str
    shop_url: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_hours: Optional[dict] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    website_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_scraped_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class WineryListResponse(BaseModel):
    total: int
    wineries: list[WinerySummary]


# Create router
router = APIRouter(prefix="/api/wineries", tags=["wineries"])


@router.get("/", response_model=WineryListResponse)
def get_wineries(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get list of all wineries
    
    - **skip**: Number of wineries to skip (pagination)
    - **limit**: Maximum number of wineries to return
    - **active_only**: Only return active wineries
    """
    query = db.query(Winery)
    
    if active_only:
        query = query.filter(Winery.is_active == True)
    
    total = query.count()
    wineries = query.order_by(Winery.name).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "wineries": wineries
    }


@router.get("/{winery_id}", response_model=WineryResponse)
def get_winery(winery_id: int, db: Session = Depends(get_db)):
    """
    Get a specific winery by ID
    """
    winery = db.query(Winery).filter(Winery.id == winery_id).first()
    
    if not winery:
        raise HTTPException(status_code=404, detail="Winery not found")
    
    return winery


@router.get("/slug/{slug}", response_model=WineryResponse)
def get_winery_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Get a specific winery by slug
    """
    winery = db.query(Winery).filter(Winery.slug == slug).first()
    
    if not winery:
        raise HTTPException(status_code=404, detail="Winery not found")
    
    return winery
