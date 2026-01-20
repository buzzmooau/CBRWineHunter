#!/usr/bin/env python3
"""
Test scraper on a single winery
Usage: python test_scraper.py <winery_id>
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine
from sqlalchemy import text
from app.scrapers.generic_scraper import GenericScraper


def test_scraper(winery_id: int):
    """Test scraping a single winery"""
    
    # Get winery info from database
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT id, name, shop_url FROM wineries WHERE id = :id"),
            {"id": winery_id}
        )
        winery = result.fetchone()
        
        if not winery:
            print(f"Winery with ID {winery_id} not found")
            return
        
        print(f"=== Testing Scraper ===")
        print(f"Winery: {winery.name}")
        print(f"Shop URL: {winery.shop_url}")
        print()
        
        # Create scraper
        scraper = GenericScraper(
            winery_id=winery.id,
            winery_name=winery.name,
            shop_url=winery.shop_url
        )
        
        # Run scrape
        wines = scraper.scrape()
        
        # Display results
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
        print("Usage: python test_scraper.py <winery_id>")
        print("\nExample wineries:")
        print("  1 - Barton Estate Winery")
        print("  4 - Clonakilla")
        print("  9 - Eden Road Wines")
        sys.exit(1)
    
    winery_id = int(sys.argv[1])
    test_scraper(winery_id)
