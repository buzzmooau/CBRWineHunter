"""
Base scraper class for wine scraping
All platform-specific scrapers inherit from this
"""
import re
import time
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Base class for all wine scrapers"""
    
    def __init__(self, winery_id: int, winery_name: str, shop_url: str):
        self.winery_id = winery_id
        self.winery_name = winery_name
        self.shop_url = shop_url
        self.wines_found = []
        self.errors = []
        
    @abstractmethod
    def scrape(self) -> List[Dict]:
        """
        Main scrape method - must be implemented by subclasses
        Returns list of wine dictionaries
        """
        pass
    
    def extract_variety(self, text: str) -> Optional[str]:
        """
        Extract wine variety from text using common patterns
        """
        if not text:
            return None
            
        text = text.lower()
        
        # Common varieties in Canberra region (expanded list)
        varieties = [
            'shiraz', 'syrah', 'riesling', 'chardonnay', 'pinot noir',
            'cabernet sauvignon', 'merlot', 'tempranillo', 'viognier',
            'sangiovese', 'pinot gris', 'pinot grigio', 'sauvignon blanc',
            'sauv blanc', 'savvy b', 'sav blanc',  # Abbreviations for Sauvignon Blanc
            'semillon', 'gewurztraminer', 'cabernet franc', 'malbec',
            'grenache', 'mourvedre', 'marsanne', 'roussanne', 'vermentino',
            'fiano', 'arneis', 'nebbiolo', 'montepulciano', 'barbera',
            'zinfandel', 'petit verdot', 'rose', 'rosé',
            'sparkling', 'blanc de blanc', 'blanc de noirs', 'prosecco',
            'methode traditionnelle', 'champagne', 'moscato',
            # Less common but present in Canberra
            'gruner veltliner', 'grüner veltliner', 'chenin blanc',
            'verdelho', 'savagnin', 'petit manseng', 'albarino', 'albariño',
            'gamay', 'nero d\'avola', 'aglianico', 'graciano',
            'tannat', 'carmenere', 'carménère', 'touriga nacional',
            'primitivo', 'dolcetto', 'cortese', 'verdicchio'
        ]
        
        for variety in varieties:
            if variety in text:
                return variety.title()
        
        return None
    
    def extract_vintage(self, text: str) -> Optional[str]:
        """
        Extract vintage year from text
        Returns year as string or 'NV' for non-vintage
        """
        if not text:
            return None
        
        # Check for NV (non-vintage)
        if re.search(r'\bNV\b', text, re.IGNORECASE):
            return 'NV'
        
        # Look for 4-digit year between 1900 and 2030
        # This regex allows years with or without word boundaries (handles "Shiraz2024")
        match = re.search(r'(19[0-9]{2}|20[0-2][0-9]|2030)', text)
        if match:
            return match.group(1)
        
        # Look for 2-digit year ('23, '24, '25, etc.) and convert to 4-digit
        # This handles wines like "Tempranillo 23" or "Chardonnay '24"
        match = re.search(r"'?(\d{2})\b", text)
        if match:
            short_year = int(match.group(1))
            # Assume years 00-30 are 2000s, 31-99 are 1900s
            if 0 <= short_year <= 30:
                return f"20{short_year:02d}"
            elif 31 <= short_year <= 99:
                return f"19{short_year:02d}"
        
        return None
    
    def clean_price(self, price_text: str) -> Optional[float]:
        """
        Clean and convert price text to float
        Handles formats like: "$37.00", "Item Price$37.00750ml", "A$29.00"
        """
        if not price_text:
            return None
        
        price_str = str(price_text)
        
        # Strategy: Find dollar sign, then extract number immediately after
        # This handles "Item Price$37.00750ml" by capturing only "$37.00"
        
        # Pattern 1: $ followed by number with up to 2 decimal places
        match = re.search(r'\$\s*(\d+\.?\d{0,2})', price_str)
        if match:
            try:
                price = float(match.group(1))
                if 5 <= price <= 10000:
                    return price
            except ValueError:
                pass
        
        # Pattern 2: A$ followed by number (Australian dollars)
        match = re.search(r'A\$\s*(\d+\.?\d{0,2})', price_str)
        if match:
            try:
                price = float(match.group(1))
                if 5 <= price <= 10000:
                    return price
            except ValueError:
                pass
        
        # Fallback: Remove all non-numeric except dots and spaces
        # Then find numbers in reasonable price range, excluding bottle sizes
        cleaned = re.sub(r'[^\d.\s]', ' ', price_str)
        numbers = re.findall(r'\d+\.?\d*', cleaned)
        
        # Find first reasonable wine price (avoid bottle sizes like 750)
        for num_str in numbers:
            try:
                price = float(num_str)
                if 5 <= price <= 500:  # Typical wine price range
                    return price
            except ValueError:
                continue
        
        # Extended range fallback for expensive wines
        for num_str in numbers:
            try:
                price = float(num_str)
                if 5 <= price <= 10000:
                    return price
            except ValueError:
                continue
        
        return None
    
    def should_flag_for_review(self, wine_data: Dict) -> tuple[bool, List[str]]:
        """
        Determine if a wine should be flagged for manual review
        Returns (should_flag, reasons)
        """
        reasons = []
        
        # Missing critical fields
        if not wine_data.get('name'):
            reasons.append('Missing name')
        
        if not wine_data.get('price'):
            reasons.append('Missing price')
        
        # Name is too short or too long
        name = wine_data.get('name', '')
        if len(name) < 5:
            reasons.append('Name too short')
        elif len(name) > 200:
            reasons.append('Name too long')
        
        # Couldn't extract variety
        if not wine_data.get('variety'):
            reasons.append('Could not determine variety')
        
        # Unusual price
        price = wine_data.get('price')
        if price:
            if price < 5:
                reasons.append('Price unusually low')
            elif price > 500:
                reasons.append('Price unusually high')
        
        # Missing description
        if not wine_data.get('description'):
            reasons.append('Missing description')
        
        return (len(reasons) > 0, reasons)
    
    def validate_wine_data(self, wine_data: Dict) -> bool:
        """
        Validate that wine data has minimum required fields
        """
        # Must have name and price
        if not wine_data.get('name'):
            logger.warning(f"Wine missing name: {wine_data}")
            return False
        
        if not wine_data.get('price'):
            logger.warning(f"Wine missing price: {wine_data.get('name')}")
            return False
        
        # Price must be reasonable
        price = wine_data.get('price')
        if not (5 <= price <= 10000):
            logger.warning(f"Wine price out of range: {wine_data.get('name')} - ${price}")
            return False
        
        return True
    
    def log_summary(self):
        """Log scraping summary"""
        logger.info(f"=== Scrape Summary for {self.winery_name} ===")
        logger.info(f"Wines found: {len(self.wines_found)}")
        logger.info(f"Errors: {len(self.errors)}")
        if self.errors:
            for error in self.errors[:5]:  # Show first 5 errors
                logger.error(f"  - {error}")
