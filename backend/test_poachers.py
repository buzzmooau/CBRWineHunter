from app.scrapers.enhanced_scraper import EnhancedScraper

scraper = EnhancedScraper(
    winery_id=28,
    winery_name='Poachers Vineyard',
    shop_url='https://poacherspantry.com.au/product-category/wine/'
)

wines = scraper.scrape()
print(f'\nTotal wines found: {len(wines)}')
for wine in wines[:5]:
    print(f"  {wine.get('name')} - ${wine.get('price')}")
