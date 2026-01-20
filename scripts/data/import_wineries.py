#!/usr/bin/env python3
"""
Import wineries from Excel file into the database
"""
import sys
import pandas as pd
from sqlalchemy import create_engine, text
from slugify import slugify
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment")
    sys.exit(1)

print(f"Connecting to database...")
engine = create_engine(DATABASE_URL)

def create_slug(name):
    """Create URL-friendly slug from winery name"""
    return slugify(name)

def import_wineries(excel_file):
    """Import wineries from Excel file"""
    
    print(f"Reading Excel file: {excel_file}")
    df = pd.read_excel(excel_file)
    
    print(f"Found {len(df)} wineries in the file")
    print()
    
    successful = 0
    failed = 0
    
    with engine.connect() as conn:
        for idx, row in df.iterrows():
            winery_name = row['Winery Name']
            shop_url = row['Online Store - Top level']
            product_example = row.get('Online store - Product page example', None)
            
            # Create slug
            slug = create_slug(winery_name)
            
            try:
                # Check if winery already exists
                result = conn.execute(
                    text("SELECT id FROM wineries WHERE name = :name"),
                    {"name": winery_name}
                )
                existing = result.fetchone()
                
                if existing:
                    print(f"⚠️  {idx+1:2d}. {winery_name:30s} - Already exists, skipping")
                    continue
                
                # Insert winery
                conn.execute(
                    text("""
                        INSERT INTO wineries (name, slug, shop_url, is_active)
                        VALUES (:name, :slug, :shop_url, true)
                    """),
                    {
                        "name": winery_name,
                        "slug": slug,
                        "shop_url": shop_url
                    }
                )
                conn.commit()
                
                print(f"✓  {idx+1:2d}. {winery_name:30s} - Imported successfully")
                successful += 1
                
            except Exception as e:
                print(f"✗  {idx+1:2d}. {winery_name:30s} - Failed: {e}")
                failed += 1
                conn.rollback()
    
    print()
    print("="*60)
    print(f"Import complete!")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print(f"  Total: {len(df)}")
    print("="*60)
    
    # Show what's in the database now
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM wineries"))
        total = result.fetchone()[0]
        print(f"\nTotal wineries in database: {total}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python import_wineries.py <excel_file>")
        print("Example: python import_wineries.py Wine_Shop_Links.xlsx")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    
    if not os.path.exists(excel_file):
        print(f"Error: File not found: {excel_file}")
        sys.exit(1)
    
    import_wineries(excel_file)
