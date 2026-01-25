#!/usr/bin/env python3
"""
Scrape wines from a winery and save to database
Handles duplicates intelligently - updates existing wines, adds new ones
Preserves existing capitalization and data
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine, SessionLocal
from app.models.winery import Winery
from app.models.wine import Wine
from app.scrapers.enhanced_scraper import EnhancedScraper
from sqlalchemy import text
from datetime import datetime


def normalize_for_comparison(text):
    """Normalize text for duplicate detection (case-insensitive, whitespace-normalized)"""
    if not text:
        return ""
    return " ".join(text.lower().split())


def scrape_and_save(winery_id: int):
    """
    Scrape wines from a winery and intelligently save to database
    - Matches existing wines by normalized name + winery_id
    - Updates price/availability if wine exists
    - Preserves existing capitalization and data
    - Adds new wines that don't exist
    """
    db = SessionLocal()
    
    try:
        # Get winery
        winery = db.query(Winery).filter(Winery.id == winery_id).first()
        if not winery:
            print(f"Winery with ID {winery_id} not found")
            return
        
        print(f"=" * 80)
        print(f"Scraping: {winery.name}")
        print(f"URL: {winery.shop_url}")
        print(f"=" * 80)
        print()
        
        # Run scraper
        scraper = EnhancedScraper(
            winery_id=winery.id,
            winery_name=winery.name,
            shop_url=winery.shop_url
        )
        
        scraped_wines = scraper.scrape()
        
        if not scraped_wines:
            print("No wines found!")
            return
        
        print()
        print(f"Found {len(scraped_wines)} wines. Processing...")
        print()
        
        # Get all existing wines for this winery
        existing_wines = db.query(Wine).filter(Wine.winery_id == winery_id).all()
        existing_wines_map = {}
        
        for wine in existing_wines:
            # Create lookup key: normalized name
            key = normalize_for_comparison(wine.name)
            existing_wines_map[key] = wine
        
        saved_count = 0
        updated_count = 0
        skipped_count = 0
        
        # Process scraped wines
        for wine_data in scraped_wines:
            # Create lookup key for this scraped wine
            scraped_key = normalize_for_comparison(wine_data['name'])
            
            # Check if wine already exists
            if scraped_key in existing_wines_map:
                # Wine exists - update only price and availability
                existing_wine = existing_wines_map[scraped_key]
                
                # Update price if changed
                if wine_data.get('price') and existing_wine.price != wine_data['price']:
                    old_price = existing_wine.price
                    existing_wine.price = wine_data['price']
                    print(f"  ↻ UPDATED: {existing_wine.name} (${old_price} → ${wine_data['price']})")
                    updated_count += 1
                else:
                    print(f"  = UNCHANGED: {existing_wine.name}")
                    skipped_count += 1
                
                # Update availability and last_seen
                existing_wine.is_available = True
                existing_wine.last_seen_at = datetime.utcnow()
                
                # Update product URL if it changed
                if wine_data.get('product_url'):
                    existing_wine.product_url = wine_data['product_url']
                
            else:
                # New wine - add it
                new_wine = Wine(
                    winery_id=winery_id,
                    name=wine_data['name'],
                    variety=wine_data.get('variety'),
                    vintage=wine_data.get('vintage'),
                    price=wine_data.get('price'),
                    description=wine_data.get('description'),
                    product_url=wine_data.get('product_url'),
                    is_available=True,
                    first_seen_at=datetime.utcnow(),
                    last_seen_at=datetime.utcnow()
                )
                db.add(new_wine)
                print(f"  + NEW: {wine_data['name']} (${wine_data.get('price')})")
                saved_count += 1
        
        # Mark wines as unavailable if they weren't in this scrape
        scraped_keys = {normalize_for_comparison(w['name']) for w in scraped_wines}
        for key, existing_wine in existing_wines_map.items():
            if key not in scraped_keys and existing_wine.is_available:
                existing_wine.is_available = False
                print(f"  - REMOVED: {existing_wine.name} (no longer available)")
        
        # Commit all changes
        db.commit()
        
        # Update winery last_scraped_at
        winery.last_scraped_at = datetime.utcnow()
        db.commit()
        
        print()
        print("=" * 80)
        print("Save Summary:")
        print(f"  New wines added:        {saved_count}")
        print(f"  Wines updated:          {updated_count}")
        print(f"  Wines unchanged:        {skipped_count}")
        print(f"  Total wines processed:  {len(scraped_wines)}")
        print("=" * 80)
        
        # Show total wines for this winery
        total_wines = db.query(Wine).filter(
            Wine.winery_id == winery_id,
            Wine.is_available == True
        ).count()
        print(f"\nTotal available wines for {winery.name}: {total_wines}")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scrape_and_save.py <winery_id>")
        print("\nExample: python scrape_and_save.py 4")
        print("\nThis will:")
        print("  - Scrape all wines from the winery (no 20-wine limit)")
        print("  - Match existing wines by name (case-insensitive)")
        print("  - Update prices if changed")
        print("  - Add new wines")
        print("  - Preserve existing capitalization")
        print("  - Mark unavailable wines")
        sys.exit(1)
    
    winery_id = int(sys.argv[1])
    scrape_and_save(winery_id)
