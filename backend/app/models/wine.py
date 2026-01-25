"""
Wine database model
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, DECIMAL, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Wine(Base):
    __tablename__ = "wines"
    
    id = Column(Integer, primary_key=True, index=True)
    winery_id = Column(Integer, ForeignKey('wineries.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(500), nullable=False)
    variety = Column(String(100), index=True)
    vintage = Column(String(10), index=True)
    price = Column(DECIMAL(10, 2), index=True)
    description = Column(Text)
    product_url = Column(Text)
    image_url = Column(Text)
    alcohol_content = Column(String(20))
    bottle_size = Column(String(50), default='750ml')
    is_available = Column(Boolean, default=True, index=True)
    
    # Status for review workflow: 'pending', 'live', 'archived'
    # - pending: Newly scraped, awaiting admin review
    # - live: Approved and visible on public site  
    # - archived: Removed from winery site but kept for history
    status = Column(String(20), default='live', nullable=False, index=True)
    
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_seen_at = Column(TIMESTAMP, default=datetime.utcnow)
    first_seen_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relationship to winery
    winery = relationship("Winery", back_populates="wines")
    
    def __repr__(self):
        return f"<Wine {self.name} ({self.winery_id}) - {self.status}>"
