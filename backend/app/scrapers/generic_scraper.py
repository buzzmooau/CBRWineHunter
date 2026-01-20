"""
Generic scraper using Playwright
Works with most e-commerce platforms by finding common patterns
"""
import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
from typing import List, Dict
import logging
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class GenericScraper(BaseScraper):
    """
    Generic scraper that attempts to find wine listings using common patterns
    """
    
    def __init__(self, winery_id: int, winery_name: str, shop_url: str, config: Dict = None):
        super().__init__(winery_id, winery_name, shop_url)
        self.config = config or {}
        self.requires_js = self.config.get('requires_javascript', True)
        
    async def scrape_async(self) -> List[Dict]:
        """Async scrape method using Playwright"""
        
        logger.info(f"Starting scrape for {self.winery_name}")
        logger.info(f"URL: {self.shop_url}")
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Navigate to shop page
                logger.info(f"Loading page...")
                await page.goto(self.shop_url, wait_until='networkidle', timeout=30000)
                
                # Wait a bit for any dynamic content
                await asyncio.sleep(2)
                
                # Get page content
                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Try to find wine products
                wines = await self.extract_wines(soup, page)
                
                logger.info(f"Found {len(wines)} wines")
                self.wines_found = wines
                
            except PlaywrightTimeout:
                error_msg = f"Timeout loading page: {self.shop_url}"
                logger.error(error_msg)
                self.errors.append(error_msg)
            except Exception as e:
                error_msg = f"Error scraping {self.winery_name}: {str(e)}"
                logger.error(error_msg)
                self.errors.append(error_msg)
            finally:
                await browser.close()
        
        self.log_summary()
        return self.wines_found
    
    def scrape(self) -> List[Dict]:
        """Synchronous wrapper for async scrape"""
        return asyncio.run(self.scrape_async())
    
    async def extract_wines(self, soup: BeautifulSoup, page) -> List[Dict]:
        """
        Extract wine information from page
        Tries multiple common patterns
        """
        wines = []
        
        # Common product container selectors
        container_selectors = [
            '.product-card',
            '.product-item',
            '.product',
            '.wine-item',
            '[class*="product"]',
            'article',
        ]
        
        products = None
        for selector in container_selectors:
            products = soup.select(selector)
            if len(products) > 3:  # Need at least a few products
                logger.info(f"Found products using selector: {selector}")
                break
        
        if not products:
            logger.warning("Could not find product containers")
            return wines
        
        logger.info(f"Processing {len(products)} potential products...")
        
        for product in products[:50]:  # Limit to first 50 to avoid overload
            try:
                wine_data = self.extract_wine_from_element(product)
                if wine_data and self.validate_wine_data(wine_data):
                    wines.append(wine_data)
            except Exception as e:
                logger.debug(f"Error extracting wine: {str(e)}")
                continue
        
        return wines
    
    def extract_wine_from_element(self, element) -> Dict:
        """
        Extract wine information from a product element
        """
        # Extract name
        name = None
        name_selectors = ['h2', 'h3', 'h4', '.product-title', '.title', '[class*="title"]', 'a']
        for selector in name_selectors:
            name_elem = element.select_one(selector)
            if name_elem:
                name = name_elem.get_text(strip=True)
                if name and len(name) > 3:
                    break
        
        if not name:
            return None
        
        # Extract vintage first (before cleaning name)
        vintage = self.extract_vintage(name)
        
        # Clean up the name - remove year if it's stuck to the end
        # Convert "Ceoltoiri2024" to "Ceoltoiri 2024"
        import re
        if vintage:
            # Add space before the year if it's stuck to text
            name = re.sub(r'(\D)(' + re.escape(vintage) + r')(\D|$)', r'\1 \2\3', name)
            # If year is at the end with no space, add space
            name = re.sub(r'(\D)(' + re.escape(vintage) + r')$', r'\1 \2', name)
        
        # Extract price
        price = None
        price_selectors = ['.price', '[class*="price"]', 'span[data-price]', '.amount']
        for selector in price_selectors:
            price_elem = element.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = self.clean_price(price_text)
                if price:
                    break
        
        # Extract link
        product_url = None
        link = element.select_one('a')
        if link and link.get('href'):
            href = link['href']
            # Make absolute URL if relative
            if href.startswith('/'):
                from urllib.parse import urljoin
                product_url = urljoin(self.shop_url, href)
            elif href.startswith('http'):
                product_url = href
        
        # Extract variety from cleaned name
        variety = self.extract_variety(name)
        
        # Extract description
        description = None
        desc_selectors = ['.description', '.product-description', 'p']
        for selector in desc_selectors:
            desc_elem = element.select_one(selector)
            if desc_elem:
                description = desc_elem.get_text(strip=True)
                if description and len(description) > 10:
                    break
        
        # Build wine data
        wine_data = {
            'winery_id': self.winery_id,
            'name': name.strip(),
            'variety': variety,
            'vintage': vintage,
            'price': price,
            'description': description,
            'product_url': product_url,
        }
        
        return wine_data
