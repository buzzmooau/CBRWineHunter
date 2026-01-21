"""
Admin API endpoints for manual wine management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime
import secrets
import os

from ..database import get_db
from ..models.wine import Wine
from ..models.winery import Winery

router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBasic()

# Get admin credentials from environment
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")  # Change in production!


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials"""
    is_correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    is_correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


# ============================================================================
# WINE MANAGEMENT
# ============================================================================

@router.get("/wines")
def list_wines_admin(
    skip: int = 0,
    limit: int = 50,
    winery_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin)
):
    """List all wines with admin details"""
    query = db.query(Wine).join(Winery)
    
    if winery_id:
        query = query.filter(Wine.winery_id == winery_id)
    
    if search:
        query = query.filter(Wine.name.ilike(f"%{search}%"))
    
    total = query.count()
    wines = query.order_by(Wine.id.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "wines": [
            {
                "id": wine.id,
                "winery_id": wine.winery_id,
                "winery_name": wine.winery.name,
                "name": wine.name,
                "variety": wine.variety,
                "vintage": wine.vintage,
                "price": float(wine.price) if wine.price else None,
                "description": wine.description,
                "product_url": wine.product_url,
                "image_url": wine.image_url,
                "is_available": wine.is_available,
                "created_at": wine.created_at.isoformat() if wine.created_at else None,
                "updated_at": wine.updated_at.isoformat() if wine.updated_at else None,
            }
            for wine in wines
        ]
    }


@router.get("/wines/{wine_id}")
def get_wine_admin(
    wine_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin)
):
    """Get single wine details for editing"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    return {
        "id": wine.id,
        "winery_id": wine.winery_id,
        "name": wine.name,
        "variety": wine.variety,
        "vintage": wine.vintage,
        "price": float(wine.price) if wine.price else None,
        "description": wine.description,
        "product_url": wine.product_url,
        "image_url": wine.image_url,
        "alcohol_content": wine.alcohol_content,
        "bottle_size": wine.bottle_size,
        "is_available": wine.is_available,
    }


@router.post("/wines", status_code=status.HTTP_201_CREATED)
def create_wine(
    wine_data: dict,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin)
):
    """Create a new wine manually"""
    # Validate required fields
    if not wine_data.get("name"):
        raise HTTPException(status_code=400, detail="Wine name is required")
    if not wine_data.get("winery_id"):
        raise HTTPException(status_code=400, detail="Winery ID is required")
    if not wine_data.get("price"):
        raise HTTPException(status_code=400, detail="Price is required")
    
    # Verify winery exists
    winery = db.query(Winery).filter(Winery.id == wine_data["winery_id"]).first()
    if not winery:
        raise HTTPException(status_code=404, detail="Winery not found")
    
    # Create wine
    new_wine = Wine(
        winery_id=wine_data["winery_id"],
        name=wine_data["name"],
        variety=wine_data.get("variety"),
        vintage=wine_data.get("vintage"),
        price=wine_data["price"],
        description=wine_data.get("description"),
        product_url=wine_data.get("product_url"),
        image_url=wine_data.get("image_url"),
        alcohol_content=wine_data.get("alcohol_content"),
        bottle_size=wine_data.get("bottle_size"),
        is_available=wine_data.get("is_available", True),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        last_seen_at=datetime.utcnow(),
        first_seen_at=datetime.utcnow(),
    )
    
    db.add(new_wine)
    db.commit()
    db.refresh(new_wine)
    
    return {
        "id": new_wine.id,
        "message": "Wine created successfully"
    }


@router.put("/wines/{wine_id}")
def update_wine(
    wine_id: int,
    wine_data: dict,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin)
):
    """Update an existing wine"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    # Update fields
    if "name" in wine_data:
        wine.name = wine_data["name"]
    if "variety" in wine_data:
        wine.variety = wine_data["variety"]
    if "vintage" in wine_data:
        wine.vintage = wine_data["vintage"]
    if "price" in wine_data:
        wine.price = wine_data["price"]
    if "description" in wine_data:
        wine.description = wine_data["description"]
    if "product_url" in wine_data:
        wine.product_url = wine_data["product_url"]
    if "image_url" in wine_data:
        wine.image_url = wine_data["image_url"]
    if "alcohol_content" in wine_data:
        wine.alcohol_content = wine_data["alcohol_content"]
    if "bottle_size" in wine_data:
        wine.bottle_size = wine_data["bottle_size"]
    if "is_available" in wine_data:
        wine.is_available = wine_data["is_available"]
    
    wine.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(wine)
    
    return {
        "id": wine.id,
        "message": "Wine updated successfully"
    }


@router.delete("/wines/{wine_id}")
def delete_wine(
    wine_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin)
):
    """Delete a wine"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    db.delete(wine)
    db.commit()
    
    return {"message": "Wine deleted successfully"}


# ============================================================================
# WINERY MANAGEMENT
# ============================================================================

@router.get("/wineries")
def list_wineries_admin(
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin)
):
    """List all wineries for admin"""
    wineries = db.query(Winery).order_by(Winery.name).all()
    
    return {
        "wineries": [
            {
                "id": winery.id,
                "name": winery.name,
                "slug": winery.slug,
                "shop_url": winery.shop_url,
                "is_active": winery.is_active,
            }
            for winery in wineries
        ]
    }


@router.get("/me")
def get_current_admin(_: str = Depends(verify_admin)):
    """Get current admin user info"""
    return {
        "username": ADMIN_USERNAME,
        "role": "admin"
    }
