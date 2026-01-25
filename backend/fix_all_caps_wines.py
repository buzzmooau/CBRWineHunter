#!/usr/bin/env python3
"""
Fix ALL CAPS wine names in database - convert to Title Case
Specifically targets Lerida Estate wines but can be used for others
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.wine import Wine
from app.models.winery import Winery  # Need this for the relationship
from sqlalchemy import func


def title_case_wine_name(name):
    """
    Convert wine name to proper title case
    Handles special cases like "MUSEUM" -> "Museum"
    """
    # Split by spaces and capitalize each word
    words = name.split()
    title_words = []
    
    for word in words:
        # Special handling for common wine terms
        if word.upper() in ['NV', 'ML']:
            title_words.append(word.upper())
        elif "'" in word:  # Handle possessives like "JOSEPHINE'S"
            title_words.append(word.title())
        else:
            title_words.append(word.title())
    
    return ' '.join(title_words)


def fix_all_caps_wines(winery_id=None, dry_run=True):
    """
    Fix ALL CAPS wine names in database
    
    Args:
        winery_id: If provided, only fix wines from this winery
        dry_run: If True, show what would be changed without changing
    """
    db = SessionLocal()
    
    try:
        # Query for wines with ALL CAPS names (3+ uppercase words)
        query = db.query(Wine)
        
        if winery_id:
            query = query.filter(Wine.winery_id == winery_id)
        
        wines = query.all()
        
        fixed_count = 0
        
        for wine in wines:
            # Check if name needs capitalization fixing
            # Pattern 1: 3+ consecutive uppercase words (original check)
            # Pattern 2: First word is ALL CAPS and longer than 3 chars
            words = wine.name.split()
            uppercase_words = sum(1 for word in words if word.isupper() and len(word) > 1)
            
            needs_fixing = False
            
            # Check pattern 1: Multiple ALL CAPS words
            if uppercase_words >= 3:
                needs_fixing = True
            
            # Check pattern 2: First word is ALL CAPS (like "MUSEUM")
            if len(words) > 0 and words[0].isupper() and len(words[0]) > 3:
                needs_fixing = True
            
            if needs_fixing:
                old_name = wine.name
                new_name = title_case_wine_name(old_name)
                
                if old_name != new_name:
                    print(f"Wine ID {wine.id} (Winery: {wine.winery.name})")
                    print(f"  OLD: {old_name}")
                    print(f"  NEW: {new_name}")
                    print()
                    
                    if not dry_run:
                        wine.name = new_name
                    
                    fixed_count += 1
        
        if not dry_run:
            db.commit()
            print(f"✅ Fixed {fixed_count} wine names")
        else:
            print(f"DRY RUN: Would fix {fixed_count} wine names")
            print("\nTo apply changes, run: python fix_all_caps_wines.py --apply")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    # Check for --apply flag
    apply_changes = '--apply' in sys.argv
    
    # Check for --winery flag
    winery_id = None
    if '--winery' in sys.argv:
        idx = sys.argv.index('--winery')
        if idx + 1 < len(sys.argv):
            winery_id = int(sys.argv[idx + 1])
    
    print("=" * 80)
    print("FIX ALL CAPS WINE NAMES")
    print("=" * 80)
    print()
    
    if not apply_changes:
        print("⚠️  DRY RUN MODE - No changes will be made")
        print("   Add --apply flag to actually fix the names")
        print()
    
    if winery_id:
        print(f"Targeting winery ID: {winery_id}")
    else:
        print("Checking all wineries")
    
    print()
    
    fix_all_caps_wines(winery_id=winery_id, dry_run=not apply_changes)
