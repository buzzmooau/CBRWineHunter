#!/usr/bin/env python3
"""
Test enhanced scraper on a single winery
Usage: python test_enhanced_scraper.py <winery_id>
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine
from sqlalchemy import text
from app.scrapers.enhanced_scraper import EnhancedScraper


def test_scraper(winery_id: int):
    """Test scraping a single winery"""
    
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT id, name, shop_url FROM wineries WHERE id = :id"),
            {"id": winery_id}
        )
        winery = result.fetchone()
        
        if not winery:
            print(f"Winery with ID {winery_id} not found")
            return
        
        print(f"=== Testing Enhanced Scraper ===")
        print(f"Winery: {winery.name}")
        print(f"Shop URL: {winery.shop_url}")
        print()
        
        scraper = EnhancedScraper(
            winery_id=winery.id,
            winery_name=winery.name,
            shop_url=winery.shop_url
        )
        
        wines = scraper.scrape()
        
        print()
        print(f"=== Results ===")
        print(f"Total wines found: {len(wines)}")
        print()
        
        if wines:
            print("Sample wines:")
            for wine in wines[:5]:
                print(f"\n  Name: {wine.get('name')}")
                print(f"  Variety: {wine.get('variety', 'Unknown')}")
                print(f"  Vintage: {wine.get('vintage', 'Unknown')}")
                print(f"  Price: ${wine.get('price', 'N/A')}")
                if wine.get('product_url'):
                    print(f"  URL: {wine.get('product_url')}")
        else:
            print("No wines found!")
            if scraper.errors:
                print("\nErrors:")
                for error in scraper.errors:
                    print(f"  - {error}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_enhanced_scraper.py <winery_id>")
        print("\nExample: python test_enhanced_scraper.py 1")
        sys.exit(1)
    
    winery_id = int(sys.argv[1])
    test_scraper(winery_id)
