#!/usr/bin/env python3
"""
Scrape wines from a winery and save to database
Usage: python scrape_and_save.py <winery_id>
"""
import sys
import os
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models.winery import Winery
from app.models.wine import Wine
from app.scrapers.enhanced_scraper import EnhancedScraper
from sqlalchemy import text


def scrape_and_save(winery_id: int):
    """Scrape wines from a winery and save to database"""
    
    db = SessionLocal()
    
    try:
        # Get winery info
        winery = db.query(Winery).filter(Winery.id == winery_id).first()
        
        if not winery:
            print(f"Winery with ID {winery_id} not found")
            return
        
        print(f"=== Scraping {winery.name} ===")
        print(f"Shop URL: {winery.shop_url}")
        print()
        
        # Create scraper
        scraper = EnhancedScraper(
            winery_id=winery.id,
            winery_name=winery.name,
            shop_url=winery.shop_url
        )
        
        # Scrape wines
        wines_data = scraper.scrape()
        
        if not wines_data:
            print("No wines found to save.")
            return
        
        print(f"\n=== Saving {len(wines_data)} wines to database ===\n")
        
        saved_count = 0
        updated_count = 0
        flagged_count = 0
        
        for wine_data in wines_data:
            try:
                # Check if wine already exists (by name and winery)
                existing_wine = db.query(Wine).filter(
                    Wine.winery_id == winery_id,
                    Wine.name == wine_data['name']
                ).first()
                
                if existing_wine:
                    # Update existing wine
                    existing_wine.variety = wine_data.get('variety')
                    existing_wine.vintage = wine_data.get('vintage')
                    existing_wine.price = wine_data.get('price')
                    existing_wine.description = wine_data.get('description')
                    existing_wine.product_url = wine_data.get('product_url')
                    existing_wine.is_available = True
                    existing_wine.last_seen_at = datetime.utcnow()
                    existing_wine.updated_at = datetime.utcnow()
                    
                    print(f"✓ Updated: {wine_data['name']}")
                    updated_count += 1
                else:
                    # Create new wine
                    new_wine = Wine(
                        winery_id=wine_data['winery_id'],
                        name=wine_data['name'],
                        variety=wine_data.get('variety'),
                        vintage=wine_data.get('vintage'),
                        price=wine_data.get('price'),
                        description=wine_data.get('description'),
                        product_url=wine_data.get('product_url'),
                        is_available=True,
                        last_seen_at=datetime.utcnow(),
                        first_seen_at=datetime.utcnow()
                    )
                    db.add(new_wine)
                    
                    # Check if should be flagged
                    should_flag, reasons = scraper.should_flag_for_review(wine_data)
                    if should_flag:
                        flagged_count += 1
                        print(f"⚠ Added (flagged): {wine_data['name']}")
                        print(f"   Reasons: {', '.join(reasons)}")
                    else:
                        print(f"✓ Added: {wine_data['name']}")
                    
                    saved_count += 1
                
            except Exception as e:
                print(f"✗ Error saving {wine_data.get('name', 'Unknown')}: {str(e)}")
                continue
        
        # Commit all changes
        db.commit()
        
        # Update winery last_scraped_at
        winery.last_scraped_at = datetime.utcnow()
        db.commit()
        
        print()
        print("="*60)
        print("Save Summary:")
        print(f"  New wines added: {saved_count}")
        print(f"  Wines updated: {updated_count}")
        print(f"  Wines flagged for review: {flagged_count}")
        print(f"  Total in database: {saved_count + updated_count}")
        print("="*60)
        
        # Show total wines for this winery
        total_wines = db.query(Wine).filter(Wine.winery_id == winery_id).count()
        print(f"\nTotal wines for {winery.name}: {total_wines}")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scrape_and_save.py <winery_id>")
        print("\nExample: python scrape_and_save.py 4")
        sys.exit(1)
    
    winery_id = int(sys.argv[1])
    scrape_and_save(winery_id)
