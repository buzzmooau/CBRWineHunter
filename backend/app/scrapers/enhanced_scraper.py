"""
Enhanced generic scraper that visits product pages for complete information
"""
import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
from typing import List, Dict
import logging
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class EnhancedScraper(BaseScraper):
    """
    Enhanced scraper that visits individual product pages for complete data
    """
    
    def __init__(self, winery_id: int, winery_name: str, shop_url: str, config: Dict = None):
        super().__init__(winery_id, winery_name, shop_url)
        self.config = config or {}
        self.requires_js = self.config.get('requires_javascript', True)
        
    async def scrape_async(self) -> List[Dict]:
        """Async scrape method using Playwright"""
        
        logger.info(f"Starting enhanced scrape for {self.winery_name}")
        logger.info(f"URL: {self.shop_url}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--no-sandbox'
                ]
            )
            
            # Create context with realistic settings
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale='en-AU',
                timezone_id='Australia/Sydney',
                extra_http_headers={
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-AU,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            )
            
            page = await context.new_page()
            
            # Remove webdriver property
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)
            
            try:
                # Navigate to shop page
                logger.info(f"Loading listing page...")
                await page.goto(self.shop_url, wait_until='networkidle', timeout=60000)  # Increased to 60 seconds
                await asyncio.sleep(3)  # Give extra time for slow sites
                
                # Get product URLs
                product_urls = await self.extract_product_urls(page)
                logger.info(f"Found {len(product_urls)} product URLs")
                
                # Visit each product page and extract details
                wines = []
                for i, url in enumerate(product_urls[:20], 1):  # Limit to 20 products
                    try:
                        logger.info(f"Processing product {i}/{min(len(product_urls), 20)}: {url}")
                        wine_data = await self.scrape_product_page(page, url)
                        if wine_data and self.validate_wine_data(wine_data):
                            wines.append(wine_data)
                            logger.info(f"  ✓ Extracted: {wine_data.get('name')}")
                    except Exception as e:
                        logger.warning(f"  ✗ Error on {url}: {str(e)}")
                        continue
                
                self.wines_found = wines
                logger.info(f"Successfully scraped {len(wines)} wines")
                
            except PlaywrightTimeout:
                error_msg = f"Timeout loading page: {self.shop_url}"
                logger.error(error_msg)
                self.errors.append(error_msg)
            except Exception as e:
                error_msg = f"Error scraping {self.winery_name}: {str(e)}"
                logger.error(error_msg)
                self.errors.append(error_msg)
            finally:
                await context.close()
                await browser.close()
        
        self.log_summary()
        return self.wines_found
    
    def scrape(self) -> List[Dict]:
        """Synchronous wrapper for async scrape"""
        return asyncio.run(self.scrape_async())
    
    async def extract_product_urls(self, page) -> List[str]:
        """Extract product URLs from listing page"""
        html = await page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        urls = []
        seen_base_urls = set()
        
        # Try to find product links
        link_selectors = [
            'a[href*="/wine/"]',  # Barton Estate pattern
            'a[href*="/product"]',
            'a[href*="/products"]',
            'a[href*="index.php?id="]',  # Gallagher Wines pattern
            'a[href*="/the-wine/"]',  # Sassafras Wines (Squarespace)
            '.product-card a',
            '.product-item a',
            'article a',
        ]
        
        for selector in link_selectors:
            links = soup.select(selector)
            if links:
                logger.info(f"Found product links using selector: {selector}")
                for link in links:
                    href = link.get('href')
                    if href:
                        # Handle protocol-relative URLs (e.g., //domain.com/path)
                        if href.startswith('//'):
                            href = 'https:' + href
                        # Make absolute URL
                        elif href.startswith('/'):
                            from urllib.parse import urljoin
                            href = urljoin(self.shop_url, href)
                        elif not href.startswith('http'):
                            continue
                        
                        # Remove query params and anchors for deduplication
                        # EXCEPT for sites that use query params for product IDs (e.g., index.php?id=123)
                        from urllib.parse import urlparse, urlunparse, parse_qs
                        parsed = urlparse(href)
                        
                        # Keep query params if they contain product identifiers
                        if 'id=' in parsed.query or 'product' in parsed.query.lower():
                            base_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', parsed.query, ''))
                        else:
                            # Remove query params for normal product URLs
                            base_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
                        
                        # Only add if we haven't seen this base URL
                        if base_url not in seen_base_urls:
                            seen_base_urls.add(base_url)
                            urls.append(base_url)
                
                if urls:
                    break
        
        return urls
    
    async def scrape_product_page(self, page, url: str) -> Dict:
        """Scrape individual product page for complete details"""
        try:
            await page.goto(url, wait_until='networkidle', timeout=40000)  # Increased to 40 seconds
            await asyncio.sleep(2)  # Extra time for slow pages
            
            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Helper function to clean text
            def clean_text(text):
                if not text:
                    return None
                # Replace non-breaking spaces and other special chars
                text = text.replace('\xa0', ' ')
                text = text.replace('\u200b', '')  # Zero-width space
                text = text.replace('\u00a0', ' ')  # Another non-breaking space
                # Normalize whitespace
                import re
                text = re.sub(r'\s+', ' ', text).strip()
                return text if text else None
            
            # Extract name
            name = None
            
            # Try Wix product title first (Dionysus pattern)
            product_title = soup.select_one('[data-hook="product-title"]')
            if product_title:
                name = clean_text(product_title.get_text(strip=True))
            
            # Try h1 with product_title class (Pankhurst pattern)
            if not name:
                product_h1 = soup.select_one('h1.product_title')
                if product_h1:
                    inner_div = product_h1.find('div')
                    if inner_div:
                        name = clean_text(inner_div.get_text(strip=True))
                    else:
                        name = clean_text(product_h1.get_text(strip=True))
            
            # Try h1 with product-title class (Squarespace/Sassafras pattern)
            if not name or len(name) <= 2:
                product_h1 = soup.select_one('h1.product-title')
                if product_h1:
                    name = clean_text(product_h1.get_text(strip=True))
            
            # Try other h1 tags if product_title didn't work
            if not name or len(name) <= 2:
                # First try h1 with class="name" (Shaw Wines pattern)
                h1_name = soup.select_one('h1.name')
                if h1_name:
                    name = clean_text(h1_name.get_text(strip=True))
                
                # Then try other h1 tags
                if not name or len(name) <= 2:
                    h1_tags = soup.find_all('h1')
                    for h1 in h1_tags:
                        # Skip screen-reader-only elements
                        if 'sr-only' in h1.get('class', []):
                            continue
                        
                        # Skip empty or very short h1s
                        text = h1.get_text(strip=True)
                        if not text or len(text) <= 2:
                            continue
                        
                        # Check if there's a div inside (Contentious Character pattern)
                        inner_div = h1.find('div')
                        if inner_div:
                            name = clean_text(inner_div.get_text(strip=True))
                        else:
                            name = clean_text(text)
                        
                        if name and len(name) > 2:
                            break
            
            # Try h2 tags (Nick O'Leary pattern)
            if not name or len(name) <= 2:
                h2_tags = soup.find_all('h2')
                for h2 in h2_tags:
                    text = h2.get_text(strip=True)
                    # Skip cart/navigation h2s
                    if not text or len(text) <= 2:
                        continue
                    if any(skip in text.lower() for skip in ['cart', 'subtotal', 'added to']):
                        continue
                    name = clean_text(text)
                    if name and len(name) > 2:
                        break
            
            # Try strong tags (Gallagher Wines pattern)
            if not name or len(name) <= 2:
                strong_tags = soup.find_all('strong')
                for strong in strong_tags:
                    text = strong.get_text(strip=True)
                    # Must look like a wine name (has a variety or vintage)
                    if not text or len(text) <= 5:
                        continue
                    # Quick check if it looks like a wine name
                    if any(variety.lower() in text.lower() for variety in ['riesling', 'chardonnay', 'pinot', 'shiraz', 'cabernet', 'sauvignon', 'sparkling']) or \
                       any(str(year) in text for year in range(2010, 2031)):
                        name = clean_text(text)
                        break
            
            # Fallback to other selectors if h1 didn't work
            if not name or len(name) <= 2:
                for selector in ['.product-title', 'h2']:
                    elem = soup.select_one(selector)
                    if elem:
                        name = clean_text(elem.get_text(strip=True))
                        if name and len(name) > 2:
                            break
            
            if not name:
                return None
            
            # Convert ALL CAPS names to Title Case (looks more professional)
            # But preserve quoted sections and parentheses
            if name.isupper() and len(name) > 3:
                # Split on special chars to preserve them
                import re
                parts = re.split(r"(['\(\)\[\]\"]+)", name)
                parts = [p.title() if p.isupper() else p for p in parts]
                name = ''.join(parts)
            
            # Filter out EXACT non-wine names (case insensitive exact match only)
            non_wine_names_exact = ['cart', 'product', 'shop', 'home', 'your cart is empty']
            if name.lower() in non_wine_names_exact:
                logger.debug(f"Skipping non-wine item: {name}")
                return None
            
            # Filter out items containing non-wine keywords
            non_wine_keywords = [
                'subscription', 'wine club', 'gift voucher', 'gift card', 
                'membership', 'tasting', 'event', 'ticket', 'shipping',
                'freight', 'delivery', 'gift box', 'hamper', 'merchandise',
                'glassware', 'bottle bag', 'cheese', 'chocolate'
            ]
            name_lower = name.lower()
            if any(keyword in name_lower for keyword in non_wine_keywords):
                logger.debug(f"Skipping non-wine item: {name}")
                return None
            
            # Extract vintage from Wine Details section or subtitle
            vintage = None
            variety = None
            
            # PRIORITY 1: Try Wine Details table/sections (most reliable)
            # Look for "Vintage" label with value in next sibling (Shaw Wines, Contentious Character)
            vintage_label = soup.find(string=lambda text: text and 'Vintage' in text)
            if vintage_label and vintage_label.parent:
                next_elem = vintage_label.parent.find_next_sibling()
                if next_elem:
                    vintage_text = next_elem.get_text(strip=True)
                    # Apply year filter - only accept reasonable vintages
                    found_vintage = self.extract_vintage(vintage_text)
                    if found_vintage and found_vintage != 'NV':
                        try:
                            year = int(found_vintage)
                            # Only accept vintages from 2010-2030 (avoids ID numbers in URLs)
                            if 2010 <= year <= 2030:
                                vintage = found_vintage
                        except ValueError:
                            if found_vintage == 'NV':
                                vintage = 'NV'
            
            # PRIORITY 2: Try to extract vintage from the wine name itself
            if not vintage and name:
                found_vintage = self.extract_vintage(name)
                if found_vintage:
                    try:
                        year = int(found_vintage)
                        if 2010 <= year <= 2030:
                            vintage = found_vintage
                    except ValueError:
                        if found_vintage == 'NV':
                            vintage = 'NV'
            
            # PRIORITY 3: Extract from URL as last resort (can pick up IDs by mistake)
            if not vintage and url:
                # Only extract from URL if it looks like a real vintage pattern
                # e.g., /2024/ or /wine-2023 but not /55132/ (ID numbers)
                import re
                url_vintage_match = re.search(r'/(?:vintages?/)?(\d{4})(?:/|$|-)', url)
                if url_vintage_match:
                    found_vintage = url_vintage_match.group(1)
                    try:
                        year = int(found_vintage)
                        if 2010 <= year <= 2030:
                            vintage = found_vintage
                    except ValueError:
                        pass
            
            # Try Wine Specs section (Contentious Character pattern)
            # Look for "Vintage" and "Varietal" labels
            if not vintage:
                vintage_label = soup.find(string=lambda text: text and 'Vintage' in text)
                if vintage_label and vintage_label.parent:
                    # Get next sibling or text after it
                    next_elem = vintage_label.parent.find_next_sibling()
                    if next_elem:
                        vintage_text = next_elem.get_text(strip=True)
                        # Apply year filter here too
                        found_vintage = self.extract_vintage(vintage_text)
                        if found_vintage and found_vintage != 'NV':
                            try:
                                if int(found_vintage) >= 2010:
                                    vintage = found_vintage
                            except ValueError:
                                if found_vintage == 'NV':
                                    vintage = 'NV'
            
            # Extract variety from Wine Details first, then fall back to name
            # Look for "Variety" or "Varietal" label (Shaw Wines, Contentious Character patterns)
            varietal_label = soup.find(string=lambda text: text and ('Varietal' in text or 'Variety' in text))
            if varietal_label and varietal_label.parent:
                next_elem = varietal_label.parent.find_next_sibling()
                if next_elem:
                    variety_text = next_elem.get_text(strip=True)
                    variety = self.extract_variety(variety_text)
            
            # Try p.kind tag (Barton Estate pattern: "2018 Chardonnay")
            if not vintage or not variety:
                kind_elem = soup.select_one('p.kind')
                if kind_elem:
                    kind_text = kind_elem.get_text(strip=True)
                    if not vintage:
                        vintage = self.extract_vintage(kind_text)
                    if not variety:
                        variety = self.extract_variety(kind_text)
            
            # Try Wine Details table
            if not vintage:
                vintage_row = soup.find('td', string='Vintage')
                if vintage_row:
                    vintage_cell = vintage_row.find_next_sibling('td')
                    if vintage_cell:
                        vintage = vintage_cell.get_text(strip=True)
            
            # Try category/breadcrumb (Pankhurst pattern: "Category: 2023")
            if not vintage:
                category_elem = soup.find(string=lambda x: x and 'Category:' in str(x))
                if category_elem:
                    # Extract year from category text
                    vintage = self.extract_vintage(str(category_elem))
            
            # Don't extract vintage from subtitle/description/name as it often picks up
            # founding years or other misleading dates. URL is most reliable.
            
            # Extract variety from Wine Details or p.kind (already done above)
            if not variety:
                variety_row = soup.find('td', string='Variety')
                if variety_row:
                    variety_cell = variety_row.find_next_sibling('td')
                    if variety_cell:
                        variety = variety_cell.get_text(strip=True)
            
            # If name itself is a variety (Pankhurst pattern: name="Marsanne")
            if not variety and name:
                variety = self.extract_variety(name)
            
            if not variety:
                # Try subtitle
                subtitle = soup.select_one('.subtitle, .wine-subtitle, h2, h3')
                if subtitle:
                    variety = self.extract_variety(subtitle.get_text(strip=True))
                
                # Fallback to name
                if not variety:
                    variety = self.extract_variety(name)
            
            # Extract price
            price = None
            price_selectors = [
                '.price',
                '[class*="price"]',
                'span:contains("$")',
                '.amount',
            ]
            for selector in price_selectors:
                elem = soup.select_one(selector)
                if elem:
                    price_text = elem.get_text(strip=True)
                    price = self.clean_price(price_text)
                    if price:
                        break
            
            # Fallback: search all p tags for price (Gallagher Wines pattern)
            if not price:
                p_tags = soup.find_all('p')
                for p in p_tags:
                    text = p.get_text(strip=True)
                    if '$' in text and len(text) < 50:  # Short text with $
                        # Handle formats like "Price:$35.00" or "Price: $35.00"
                        import re
                        match = re.search(r'\$[\d,]+\.?\d*', text)
                        if match:
                            price_text = match.group(0)
                            price = self.clean_price(price_text)
                            if price:
                                break
            
            # Extract description
            description = None
            desc_selectors = [
                '.description',
                '.product-description',
                '[itemprop="description"]',
                '.wine-description'
            ]
            for selector in desc_selectors:
                elem = soup.select_one(selector)
                if elem:
                    desc_text = clean_text(elem.get_text(strip=True))
                    # Filter out shipping/policy text
                    if desc_text and len(desc_text) > 20:
                        # Skip if it's shipping/policy info
                        skip_phrases = [
                            'we ship our wines',
                            'shipping',
                            'delivery',
                            'please make up your order',
                            'bottles to ensure',
                            'purchase limits',
                            'terms and conditions'
                        ]
                        if not any(phrase in desc_text.lower() for phrase in skip_phrases):
                            description = desc_text
                            break
            
            # Clean up name - remove vintage if present
            if vintage:
                import re
                name = re.sub(r'\s*' + re.escape(vintage) + r'\s*', ' ', name)
                name = re.sub(r'\s+', ' ', name).strip()
            
            # Separate mashed series names (e.g., "First VinesCabernet" -> "First Vines Cabernet")
            import re
            series_names = ['First Vines', 'Reserve', 'Premium', 'Estate', 'The Gravel Block', 'Close Planted', '35th Parallel']
            for series in series_names:
                # Use non-compiled pattern so we can use flags
                pattern = f'{re.escape(series)}([A-Z])'
                if re.search(pattern, name, re.IGNORECASE):
                    # Insert space after series name
                    name = re.sub(pattern, f'{series} \\1', name, flags=re.IGNORECASE)
                    break
            
            # Remove variety from name if it appears at the beginning
            if variety and variety in name:
                import re
                # Check if variety is mashed with name (e.g., "RoseShe'll Be Rose")
                pattern = re.compile(f'^{re.escape(variety)}([A-Z])', re.IGNORECASE)
                match = pattern.match(name)
                if match:
                    # Remove the variety prefix
                    name = name[len(variety):]
                    name = name.strip()
                else:
                    # Only remove if there's more than just the variety + vintage in the name
                    # e.g., "Chardonnay Denison 2022" -> "Denison" is good
                    # but "Chardonnay 2022" -> keep as "Chardonnay 2022"
                    pattern = r'^' + re.escape(variety) + r'\s+'
                    name_without_variety = re.sub(pattern, '', name, flags=re.IGNORECASE).strip()
                    
                    # Only remove variety if there's meaningful text left (not just a year or empty)
                    if name_without_variety and not re.match(r'^\'?\d{2,4}$', name_without_variety):
                        name = name_without_variety
                    
                # Clean up any double spaces
                name = re.sub(r'\s+', ' ', name).strip()
                
                # If name is now just a year/vintage (like "23" or "2023"), use variety as name
                if name and re.match(r'^\'?\d{2,4}$', name):
                    name = variety.title()
            
            wine_data = {
                'winery_id': self.winery_id,
                'name': name,
                'variety': variety,
                'vintage': vintage,
                'price': price,
                'description': description,
                'product_url': url,
            }
            
            return wine_data
            
        except Exception as e:
            logger.error(f"Error scraping product page {url}: {str(e)}")
            return None
