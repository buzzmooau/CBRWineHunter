#!/usr/bin/env python3
"""
Comprehensive Scraper Quality Verification
Tests data integrity, vintage accuracy, and completeness
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine
from sqlalchemy import text
from datetime import datetime


def test_vintage_quality():
    """Check for suspicious vintages that might be wrong"""
    print("=" * 80)
    print("VINTAGE QUALITY CHECK")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        # Find vintages that look suspicious
        result = conn.execute(text("""
            SELECT 
                w.name as winery_name,
                wi.name as wine_name,
                wi.vintage,
                wi.product_url
            FROM wines wi
            JOIN wineries w ON w.id = wi.winery_id
            WHERE wi.is_available = true
            AND wi.vintage IS NOT NULL
            AND wi.vintage != 'NV'  -- Exclude non-vintage wines
            AND wi.vintage ~ '^[0-9]+$'  -- Only numeric vintages
            AND (
                -- Very old vintages (likely product IDs or founding years)
                CAST(wi.vintage AS INTEGER) < 2000
                -- Future vintages (typos or errors)
                OR CAST(wi.vintage AS INTEGER) > 2026
            )
            ORDER BY wi.vintage, w.name
        """))
        
        suspicious = result.fetchall()
        
        if suspicious:
            print(f"⚠️  Found {len(suspicious)} wines with suspicious vintages:")
            print()
            for row in suspicious:
                print(f"  {row.winery_name}")
                print(f"    Wine: {row.wine_name}")
                print(f"    Vintage: {row.vintage} ⚠️")
                print(f"    URL: {row.product_url}")
                print()
        else:
            print("✅ All vintages look reasonable (2000-2026)")
        
        print()


def test_duplicate_wines():
    """Check for duplicate wines within each winery"""
    print("=" * 80)
    print("DUPLICATE WINE CHECK")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            WITH normalized_wines AS (
                SELECT 
                    winery_id,
                    name,
                    LOWER(REGEXP_REPLACE(name, '\s+', ' ', 'g')) as normalized_name,
                    vintage,
                    COUNT(*) OVER (PARTITION BY winery_id, LOWER(REGEXP_REPLACE(name, '\s+', ' ', 'g')), vintage) as dup_count
                FROM wines
                WHERE is_available = true
            )
            SELECT 
                w.name as winery_name,
                nw.name as wine_name,
                nw.vintage,
                nw.dup_count
            FROM normalized_wines nw
            JOIN wineries w ON w.id = nw.winery_id
            WHERE nw.dup_count > 1
            ORDER BY w.name, nw.name
        """))
        
        duplicates = result.fetchall()
        
        if duplicates:
            print(f"⚠️  Found {len(duplicates)} potential duplicates:")
            print()
            current_winery = None
            for row in duplicates:
                if row.winery_name != current_winery:
                    print(f"\n  {row.winery_name}:")
                    current_winery = row.winery_name
                print(f"    - {row.wine_name} ({row.vintage or 'N/A'}) - {row.dup_count}x")
        else:
            print("✅ No duplicates found")
        
        print()


def test_missing_critical_fields():
    """Check for wines missing name, price, or variety"""
    print("=" * 80)
    print("MISSING CRITICAL FIELDS CHECK")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        # Missing prices
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM wines
            WHERE is_available = true
            AND (price IS NULL OR price <= 0)
        """))
        missing_price = result.fetchone().count
        
        # Missing variety
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM wines
            WHERE is_available = true
            AND (variety IS NULL OR variety = '')
        """))
        missing_variety = result.fetchone().count
        
        # Missing vintage
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM wines
            WHERE is_available = true
            AND (vintage IS NULL OR vintage = '')
        """))
        missing_vintage = result.fetchone().count
        
        # Total wines
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM wines
            WHERE is_available = true
        """))
        total = result.fetchone().count
        
        print(f"Total available wines: {total}")
        print()
        print(f"Missing price:   {missing_price:4d} ({missing_price/total*100:.1f}%)")
        print(f"Missing variety: {missing_variety:4d} ({missing_variety/total*100:.1f}%)")
        print(f"Missing vintage: {missing_vintage:4d} ({missing_vintage/total*100:.1f}%)")
        print()
        
        if missing_price == 0:
            print("✅ All wines have prices")
        else:
            print(f"⚠️  {missing_price} wines missing prices")
        
        if missing_variety < total * 0.1:  # Less than 10% missing is acceptable
            print(f"✅ Variety coverage: {(1-missing_variety/total)*100:.1f}%")
        else:
            print(f"⚠️  {missing_variety} wines missing variety (>{10}%)")
        
        if missing_vintage < total * 0.15:  # Less than 15% missing is acceptable
            print(f"✅ Vintage coverage: {(1-missing_vintage/total)*100:.1f}%")
        else:
            print(f"⚠️  {missing_vintage} wines missing vintage (>{15}%)")
        
        print()


def test_wine_counts_per_winery():
    """Show wine counts and flag any that seem too low"""
    print("=" * 80)
    print("WINE COUNT PER WINERY")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                w.id,
                w.name,
                COUNT(wi.id) as wine_count
            FROM wineries w
            LEFT JOIN wines wi ON w.id = wi.winery_id AND wi.is_available = true
            WHERE w.is_active = true
            GROUP BY w.id, w.name
            ORDER BY w.id
        """))
        
        total_wines = 0
        winery_count = 0
        low_count_wineries = []
        zero_count_wineries = []
        
        for row in result:
            indicator = "  "
            if row.wine_count == 0:
                indicator = "⚠️ "
                zero_count_wineries.append(row.name)
            elif row.wine_count < 5:
                indicator = "⚡"
                low_count_wineries.append(f"{row.name} ({row.wine_count})")
            
            print(f"{indicator}{row.id:2d}. {row.name:40s} - {row.wine_count:3d} wines")
            total_wines += row.wine_count
            if row.wine_count > 0:
                winery_count += 1
        
        print()
        print(f"Total: {total_wines} wines from {winery_count} wineries")
        print()
        
        if zero_count_wineries:
            print(f"⚠️  {len(zero_count_wineries)} wineries with 0 wines:")
            for name in zero_count_wineries:
                print(f"    - {name}")
            print()
        
        if low_count_wineries:
            print(f"⚡ {len(low_count_wineries)} wineries with <5 wines (might need review):")
            for name in low_count_wineries:
                print(f"    - {name}")
            print()


def test_price_sanity():
    """Check for unreasonable prices"""
    print("=" * 80)
    print("PRICE SANITY CHECK")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        # Unusually low prices
        result = conn.execute(text("""
            SELECT 
                w.name as winery_name,
                wi.name as wine_name,
                wi.price
            FROM wines wi
            JOIN wineries w ON w.id = wi.winery_id
            WHERE wi.is_available = true
            AND wi.price < 15
            ORDER BY wi.price
            LIMIT 10
        """))
        
        low_prices = result.fetchall()
        
        if low_prices:
            print(f"⚡ Wines under $15 (might be gift cards, samples, or errors):")
            for row in low_prices:
                print(f"  ${row.price:6.2f} - {row.winery_name} - {row.wine_name}")
            print()
        
        # Unusually high prices
        result = conn.execute(text("""
            SELECT 
                w.name as winery_name,
                wi.name as wine_name,
                wi.price
            FROM wines wi
            JOIN wineries w ON w.id = wi.winery_id
            WHERE wi.is_available = true
            AND wi.price > 200
            ORDER BY wi.price DESC
            LIMIT 10
        """))
        
        high_prices = result.fetchall()
        
        if high_prices:
            print(f"⚡ Wines over $200 (premium/library releases or errors):")
            for row in high_prices:
                print(f"  ${row.price:6.2f} - {row.winery_name} - {row.wine_name}")
            print()
        
        # Price statistics
        result = conn.execute(text("""
            SELECT 
                MIN(price) as min_price,
                AVG(price) as avg_price,
                MAX(price) as max_price
            FROM wines
            WHERE is_available = true
        """))
        
        stats = result.fetchone()
        print(f"Price range: ${stats.min_price:.2f} - ${stats.max_price:.2f}")
        print(f"Average price: ${stats.avg_price:.2f}")
        print()


def test_data_freshness():
    """Check when wineries were last scraped"""
    print("=" * 80)
    print("DATA FRESHNESS CHECK")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                id,
                name,
                last_scraped_at
            FROM wineries
            WHERE is_active = true
            ORDER BY last_scraped_at DESC NULLS LAST
        """))
        
        now = datetime.utcnow()
        never_scraped = []
        old_scrapes = []
        
        for row in result:
            if row.last_scraped_at is None:
                never_scraped.append(row.name)
            else:
                age_days = (now - row.last_scraped_at).days
                if age_days > 7:
                    old_scrapes.append((row.name, age_days))
        
        if never_scraped:
            print(f"⚠️  {len(never_scraped)} wineries never scraped:")
            for name in never_scraped:
                print(f"    - {name}")
            print()
        
        if old_scrapes:
            print(f"⚡ {len(old_scrapes)} wineries last scraped >7 days ago:")
            for name, days in old_scrapes[:10]:
                print(f"    - {name} ({days} days ago)")
            print()
        
        if not never_scraped and not old_scrapes:
            print("✅ All wineries scraped within last 7 days")
            print()


def generate_summary():
    """Generate overall quality score"""
    print("=" * 80)
    print("OVERALL QUALITY SUMMARY")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        # Total coverage
        result = conn.execute(text("""
            SELECT 
                COUNT(DISTINCT CASE WHEN wi.id IS NOT NULL THEN w.id END) as wineries_with_wines,
                COUNT(DISTINCT w.id) as total_active_wineries,
                COUNT(wi.id) as total_wines
            FROM wineries w
            LEFT JOIN wines wi ON w.id = wi.winery_id AND wi.is_available = true
            WHERE w.is_active = true
        """))
        
        stats = result.fetchone()
        coverage = stats.wineries_with_wines / stats.total_active_wineries * 100
        
        print(f"Winery Coverage: {stats.wineries_with_wines}/{stats.total_active_wineries} ({coverage:.1f}%)")
        print(f"Total Wines: {stats.total_wines}")
        print()
        
        # Quality grades
        if coverage >= 90 and stats.total_wines >= 500:
            print("🌟 OVERALL GRADE: PRODUCTION READY")
            print("   ✅ Excellent coverage")
            print("   ✅ Large wine database")
        elif coverage >= 80 and stats.total_wines >= 400:
            print("✅ OVERALL GRADE: GOOD - Minor issues to address")
        elif coverage >= 70:
            print("⚡ OVERALL GRADE: FAIR - Some wineries need work")
        else:
            print("⚠️  OVERALL GRADE: NEEDS WORK - Many wineries missing")
        
        print()


if __name__ == "__main__":
    print()
    print("=" * 80)
    print("CBR WINE HUNTER - SCRAPER QUALITY VERIFICATION")
    print("=" * 80)
    print()
    
    test_wine_counts_per_winery()
    test_vintage_quality()
    test_duplicate_wines()
    test_missing_critical_fields()
    test_price_sanity()
    test_data_freshness()
    generate_summary()
    
    print("=" * 80)
    print("VERIFICATION COMPLETE")
    print("=" * 80)
    print()
