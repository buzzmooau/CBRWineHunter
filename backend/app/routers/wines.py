"""
Wines API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.wine import Wine
from app.models.winery import Winery
from pydantic import BaseModel
from datetime import datetime


class WinerySummary(BaseModel):
    id: int
    name: str
    slug: str
    
    class Config:
        from_attributes = True


class WineResponse(BaseModel):
    id: int
    name: str
    variety: Optional[str] = None
    vintage: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    product_url: Optional[str] = None
    is_available: bool
    winery: WinerySummary
    
    class Config:
        from_attributes = True


class WineListResponse(BaseModel):
    total: int
    wines: list[WineResponse]


# Create router
router = APIRouter(prefix="/api/wines", tags=["wines"])


@router.get("/", response_model=WineListResponse)
def get_wines(
    skip: int = 0,
    limit: int = 50,
    variety: Optional[str] = None,
    vintage: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    winery_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of wines with filtering
    
    - **skip**: Number of wines to skip (pagination)
    - **limit**: Maximum number of wines to return
    - **variety**: Filter by variety (e.g., 'Shiraz', 'Riesling')
    - **vintage**: Filter by vintage (e.g., '2024', 'NV')
    - **min_price**: Minimum price
    - **max_price**: Maximum price
    - **winery_id**: Filter by winery ID
    - **search**: Search in wine name
    """
    query = db.query(Wine).filter(Wine.is_available == True)
    
    if variety:
        query = query.filter(Wine.variety.ilike(f"%{variety}%"))
    
    if vintage:
        query = query.filter(Wine.vintage == vintage)
    
    if min_price is not None:
        query = query.filter(Wine.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Wine.price <= max_price)
    
    if winery_id:
        query = query.filter(Wine.winery_id == winery_id)
    
    if search:
        query = query.filter(Wine.name.ilike(f"%{search}%"))
    
    total = query.count()
    wines = query.order_by(Wine.name).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "wines": wines
    }


@router.get("/{wine_id}", response_model=WineResponse)
def get_wine(wine_id: int, db: Session = Depends(get_db)):
    """Get a specific wine by ID"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    return wine


@router.get("/varieties/list")
def get_varieties(db: Session = Depends(get_db)):
    """Get list of all wine varieties with counts"""
    from sqlalchemy import func
    
    varieties = db.query(
        Wine.variety,
        func.count(Wine.id).label('count')
    ).filter(
        Wine.is_available == True,
        Wine.variety.isnot(None)
    ).group_by(Wine.variety).order_by(Wine.variety).all()
    
    return {
        "varieties": [
            {"name": v.variety, "count": v.count}
            for v in varieties
        ]
    }


@router.get("/vintages/list")
def get_vintages(db: Session = Depends(get_db)):
    """Get list of all vintages with counts"""
    from sqlalchemy import func
    
    vintages = db.query(
        Wine.vintage,
        func.count(Wine.id).label('count')
    ).filter(
        Wine.is_available == True,
        Wine.vintage.isnot(None)
    ).group_by(Wine.vintage).order_by(Wine.vintage.desc()).all()
    
    return {
        "vintages": [
            {"year": v.vintage, "count": v.count}
            for v in vintages
        ]
    }
# ADD THESE AT THE END OF wines.py

class WineCreate(BaseModel):
    winery_id: int
    name: str
    variety: Optional[str] = None
    vintage: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    alcohol_content: Optional[str] = None
    bottle_size: Optional[str] = None
    is_available: bool = True

class WineUpdate(BaseModel):
    winery_id: Optional[int] = None
    name: Optional[str] = None
    variety: Optional[str] = None
    vintage: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    alcohol_content: Optional[str] = None
    bottle_size: Optional[str] = None
    is_available: Optional[bool] = None

@router.post("/", response_model=dict)
def create_wine(wine_data: WineCreate, db: Session = Depends(get_db)):
    """Create a new wine"""
    
    # Check if winery exists
    winery = db.query(Winery).filter(Winery.id == wine_data.winery_id).first()
    if not winery:
        raise HTTPException(status_code=404, detail="Winery not found")
    
    # Create wine
    wine = Wine(
        winery_id=wine_data.winery_id,
        name=wine_data.name,
        variety=wine_data.variety,
        vintage=wine_data.vintage,
        price=wine_data.price,
        description=wine_data.description,
        product_url=wine_data.product_url,
        image_url=wine_data.image_url,
        alcohol_content=wine_data.alcohol_content,
        bottle_size=wine_data.bottle_size,
        is_available=wine_data.is_available
    )
    
    db.add(wine)
    db.commit()
    db.refresh(wine)
    
    return {"id": wine.id, "message": "Wine created successfully"}

@router.put("/{wine_id}", response_model=dict)
def update_wine(wine_id: int, wine_data: WineUpdate, db: Session = Depends(get_db)):
    """Update an existing wine"""
    
    # Get existing wine
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    # Update fields that were provided
    update_data = wine_data.dict(exclude_unset=True)
    
    # If winery_id is being changed, verify it exists
    if 'winery_id' in update_data:
        winery = db.query(Winery).filter(Winery.id == update_data['winery_id']).first()
        if not winery:
            raise HTTPException(status_code=404, detail="Winery not found")
    
    for field, value in update_data.items():
        setattr(wine, field, value)
    
    wine.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(wine)
    
    return {"message": "Wine updated successfully"}

@router.delete("/{wine_id}", response_model=dict)
def delete_wine(wine_id: int, db: Session = Depends(get_db)):
    """Delete a wine"""
    
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    db.delete(wine)
    db.commit()
    
    return {"message": "Wine deleted successfully"}
