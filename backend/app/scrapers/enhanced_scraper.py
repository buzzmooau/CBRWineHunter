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
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Navigate to shop page
                logger.info(f"Loading listing page...")
                await page.goto(self.shop_url, wait_until='networkidle', timeout=30000)
                await asyncio.sleep(2)
                
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
        
        # Try to find product links with expanded selectors
        # Order matters! More specific patterns first
        link_selectors = [
            'a[href*="/product/"]',        # WooCommerce product pattern (Poachers) - BEFORE /wine/
            'a[href*="/product"]',         # Generic product pattern
            'a[href*="/products"]',        # Shopify pattern
            'a[href*="/wine/"]',           # Barton Estate pattern - AFTER /product/
            'a[href*="/our-wines"]',       # Mallaluka and similar sites
            'a[href*="/wines/"]',          # Alternative wines pattern
            '.product-card a',             # Product card links
            '.product-item a',             # Product item links
            'article a',                   # Article links
            '.wine-item a',                # Wine item links
            '[class*="wine"] a',           # Any class containing "wine"
            '[class*="product"] a',        # Any class containing "product"
        ]
        
        for selector in link_selectors:
            links = soup.select(selector)
            if links:
                logger.info(f"Found {len(links)} links using selector: {selector}")
                for link in links:
                    href = link.get('href')
                    if href:
                        # Make absolute URL
                        if href.startswith('/'):
                            from urllib.parse import urljoin
                            href = urljoin(self.shop_url, href)
                        elif not href.startswith('http'):
                            continue
                        
                        # Skip non-product links (navigation, categories, etc.)
                        skip_patterns = [
                            '/cart', '/checkout', '/account', '/search',
                            '/contact', '/about', '/terms', '/privacy',
                            '#', 'javascript:', 'mailto:', 'tel:',
                            '/collections/all', '/collections?', '/pages/',
                            '/blogs/', '/login', '/register', '/my-account',
                            '/product-category/'  # WooCommerce category pages
                        ]
                        
                        if any(pattern in href.lower() for pattern in skip_patterns):
                            continue
                        
                        # Remove query params and anchors for deduplication
                        from urllib.parse import urlparse, urlunparse
                        parsed = urlparse(href)
                        base_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
                        
                        # Only add if we haven't seen this base URL and it's not the shop URL itself
                        if base_url not in seen_base_urls and base_url != self.shop_url:
                            seen_base_urls.add(base_url)
                            urls.append(base_url)
                
                if urls:
                    logger.info(f"Total unique product URLs collected: {len(urls)}")
                    break  # Found products, no need to try more selectors
        
        # If no URLs found with selectors, try a fallback method
        if not urls:
            logger.info("No products found with standard selectors, trying fallback...")
            
            # Extract base path from shop_url (e.g., /our-wines-1 from https://example.com/our-wines-1)
            from urllib.parse import urlparse, urljoin
            parsed_shop = urlparse(self.shop_url)
            base_path = parsed_shop.path.rstrip('/')
            
            logger.info(f"Base path: '{base_path}'")
            
            # Find all links that start with this path but are longer (child pages)
            all_links = soup.find_all('a', href=True)
            logger.info(f"Total links on page: {len(all_links)}")
            
            for link in all_links:
                href = link.get('href', '')
                
                # Check if it's a child path of the base path
                # Handle both absolute and relative URLs
                is_child = False
                
                if href.startswith(base_path + '/'):
                    # Relative URL like /our-wines-1/product
                    is_child = True
                elif href.startswith('/') and base_path and (base_path.lstrip('/') + '/') in href:
                    # Another relative pattern
                    is_child = True
                elif href.startswith('http') and base_path in href and href != self.shop_url:
                    # Full absolute URL
                    is_child = True
                
                if is_child:
                    # Make absolute URL
                    full_url = urljoin(self.shop_url, href)
                    
                    # Skip navigation/category links
                    skip_patterns = ['cart', 'checkout', 'account', 'search', 'contact', 'category', 'tag', '#']
                    if any(pattern in href.lower() for pattern in skip_patterns):
                        continue
                    
                    # Remove query params
                    from urllib.parse import urlparse, urlunparse
                    parsed = urlparse(full_url)
                    base_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
                    
                    if base_url not in seen_base_urls and base_url != self.shop_url:
                        seen_base_urls.add(base_url)
                        urls.append(base_url)
                        logger.info(f"  Fallback found: {base_url}")
            
            logger.info(f"Fallback method found {len(urls)} potential product URLs")
        
        return urls
    
    async def scrape_product_page(self, page, url: str) -> Dict:
        """Scrape individual product page for complete details"""
        try:
            await page.goto(url, wait_until='networkidle', timeout=20000)
            await asyncio.sleep(1)
            
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
            
            # Try h1 with product_title class (Pankhurst pattern)
            product_h1 = soup.select_one('h1.product_title')
            if product_h1:
                inner_div = product_h1.find('div')
                if inner_div:
                    name = clean_text(inner_div.get_text(strip=True))
                else:
                    name = clean_text(product_h1.get_text(strip=True))
            
            # Try other h1 tags if product_title didn't work
            if not name or len(name) <= 2:
                h1_tags = soup.find_all('h1')
                for h1 in h1_tags:
                    # Skip empty or very short h1s
                    text = h1.get_text(strip=True)
                    if not text or len(text) <= 2:
                        continue
                    
                    # Skip common navigation h1s
                    if text.lower() in ['our wines', 'wines', 'products', 'shop', 'cart']:
                        continue
                    
                    # Skip winery range/category headers (Lake George pattern)
                    if 'winery range' in text.lower() or 'range' == text.lower():
                        continue
                    
                    # Check if there's a div inside (Contentious Character pattern)
                    inner_div = h1.find('div')
                    if inner_div:
                        name = clean_text(inner_div.get_text(strip=True))
                    else:
                        name = clean_text(text)
                    
                    if name and len(name) > 2:
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
            
            # Convert ALL CAPS names to Title Case (Long Rail Gully pattern)
            if name.isupper():
                name = name.title()
            
            # Filter out EXACT non-wine names (case insensitive exact match only)
            non_wine_names_exact = ['cart', 'product', 'shop', 'home', 'your cart is empty', 'gift card']
            if name.lower() in non_wine_names_exact:
                logger.debug(f"Skipping non-wine item: {name}")
                return None
            
            # Filter out items with "gift card" anywhere in the name (Intrepidus pattern)
            if 'gift card' in name.lower():
                logger.debug(f"Skipping gift card item: {name}")
                return None
            
            # Extract vintage and variety
            vintage = None
            variety = None
            
            # PRIORITY 1: Extract vintage from NAME first (Long Rail Gully pattern: "2024 Riesling")
            # This prevents using old product IDs from URLs
            if name:
                name_vintage = self.extract_vintage(name)
                if name_vintage and name_vintage != 'NV':
                    try:
                        year = int(name_vintage)
                        if 2010 <= year <= 2030:
                            vintage = name_vintage
                    except ValueError:
                        pass
            
            # PRIORITY 2: Try Wine Details/Specs section (McKellar Ridge, Contentious Character)
            # Look for "Vintage" and "Varietal" labels with adjacent values
            if not vintage:
                vintage_label = soup.find(string=lambda text: text and 'Vintage' in text)
                if vintage_label and vintage_label.parent:
                    # Get next sibling element
                    next_elem = vintage_label.parent.find_next_sibling()
                    if next_elem:
                        vintage_text = next_elem.get_text(strip=True)
                        # Extract and validate vintage
                        found_vintage = self.extract_vintage(vintage_text)
                        if found_vintage and found_vintage != 'NV':
                            try:
                                # Only accept vintages from 2010 onwards (avoids founding years)
                                if int(found_vintage) >= 2010:
                                    vintage = found_vintage
                            except ValueError:
                                if found_vintage == 'NV':
                                    vintage = 'NV'
            
            # Extract variety from adjacent label
            varietal_label = soup.find(string=lambda text: text and 'Varietal' in text)
            if not varietal_label:
                # Also try "Variety" label
                varietal_label = soup.find(string=lambda text: text and 'Variety' in text and 'Varietal' not in text)
            
            if varietal_label and varietal_label.parent:
                next_elem = varietal_label.parent.find_next_sibling()
                if next_elem:
                    variety_text = next_elem.get_text(strip=True)
                    variety = self.extract_variety(variety_text)
            
            # PRIORITY 3: Try p.kind tag (Barton Estate pattern: "2018 Chardonnay")
            if not vintage or not variety:
                kind_elem = soup.select_one('p.kind')
                if kind_elem:
                    kind_text = kind_elem.get_text(strip=True)
                    if not vintage:
                        vintage = self.extract_vintage(kind_text)
                    if not variety:
                        variety = self.extract_variety(kind_text)
            
            # PRIORITY 4: Try Wine Details table (older pattern)
            if not vintage:
                vintage_row = soup.find('td', string='Vintage')
                if vintage_row:
                    vintage_cell = vintage_row.find_next_sibling('td')
                    if vintage_cell:
                        vintage = vintage_cell.get_text(strip=True)
            
            if not variety:
                variety_row = soup.find('td', string='Variety')
                if variety_row:
                    variety_cell = variety_row.find_next_sibling('td')
                    if variety_cell:
                        variety = variety_cell.get_text(strip=True)
            
            # PRIORITY 5: Try category/breadcrumb (Pankhurst pattern: "Category: 2023")
            if not vintage:
                category_elem = soup.find(string=lambda x: x and 'Category:' in str(x))
                if category_elem:
                    # Extract year from category text
                    vintage = self.extract_vintage(str(category_elem))
            
            # PRIORITY 6 (LAST RESORT): Extract vintage from URL
            # Only use if not found anywhere else, and validate range
            # URLs often contain product IDs that look like years (e.g., /58199 -> "1999", /2015riesling)
            if not vintage and url:
                url_vintage = self.extract_vintage(url)
                if url_vintage and url_vintage != 'NV':
                    try:
                        # Only accept vintages in reasonable range (2010-2030)
                        # This avoids product IDs like 58199, 45011, 2015riesling, etc.
                        year = int(url_vintage)
                        if 2010 <= year <= 2030:
                            vintage = url_vintage
                    except ValueError:
                        pass
            
            # Extract variety from name if not found yet (Pankhurst pattern: name="Marsanne")
            if not variety and name:
                variety = self.extract_variety(name)
            
            # Last resort: try subtitle for variety
            if not variety:
                subtitle = soup.select_one('.subtitle, .wine-subtitle, h2, h3')
                if subtitle:
                    variety = self.extract_variety(subtitle.get_text(strip=True))
            
            # Extract price - Multiple patterns supported
            price = None
            price_selectors = [
                '.product-price',              # Mallaluka pattern
                '.price',
                '[class*="price"]',
                'span:contains("$")',
                '.amount'
            ]
            for selector in price_selectors:
                elem = soup.select_one(selector)
                if elem:
                    price_text = elem.get_text(strip=True)
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
            
            # Remove variety from name ONLY if at the very beginning (Intrepidus fix)
            if variety and name:
                import re
                # Only match if variety is at start followed by space/dash
                pattern = re.compile(f'^{re.escape(variety)}[\\s-]+', re.IGNORECASE)
                if pattern.match(name):
                    name = pattern.sub('', name)
                
                # Clean up any leftover dashes and spaces
                name = re.sub(r'^[-–—\s]+', '', name)  # Leading
                name = re.sub(r'[-–—\s]+$', '', name)  # Trailing
                name = re.sub(r'\s+', ' ', name)       # Multiple spaces
                name = name.strip()
                
                # If name is now empty or very short, use variety
                if not name or len(name) <= 2 or name in ['-', '–', '—']:
                    name = variety.title()
                # If name is just a year, use variety
                elif re.match(r'^\'?\d{2,4}$', name):
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
