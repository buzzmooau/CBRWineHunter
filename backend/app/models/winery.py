"""
Winery database model
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, DECIMAL, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Winery(Base):
    __tablename__ = "wineries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    shop_url = Column(Text, nullable=False)
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    address = Column(Text)
    phone = Column(String(50))
    email = Column(String(255))
    opening_hours = Column(JSON)
    description = Column(Text)
    image_url = Column(Text)
    website_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_scraped_at = Column(TIMESTAMP)

    # Relationship to wines
    wines = relationship("Wine", back_populates="winery")

    def __repr__(self):
        return f"<Winery {self.name}>"
