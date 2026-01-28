import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// Regions data
const regionsData = {
  murrumbateman: {
    title: "Murrumbateman",
    tags: ["Granite Soils", "Heart of Region", "Most Cellar Doors"],
    desc: "The engine room of the Canberra District. Murrumbateman accounts for the majority of the region's plantings. The decomposed granite soils here are famous for producing the region's signature spicy Shiraz and floral Riesling. It is a village surrounded by vines.",
    wineries: "Clonakilla, Helm Wines, Shaw Wines, Eden Road, Four Winds, The Vintner's Daughter."
  },
  lakegeorge: {
    title: "Lake George",
    tags: ["Shale Soils", "Cooler", "Historic Vines"],
    desc: "Located on the western escarpment of the mysterious Lake George. The soils here are sedimentary (shale and sandstone), distinct from Murrumbateman. The large body of water (when full) and escarpment creates a unique microclimate that is often cooler.",
    wineries: "Lark Hill (Biodynamic), Lerida Estate, Lake George Winery."
  },
  hall: {
    title: "Hall / ACT",
    tags: ["Volcanic Soil", "Closest to City", "Historic Village"],
    desc: "Just minutes from the suburbs, the Hall region features pockets of volcanic soil, notably limestone at Mount Majura. This unique terroir allows varieties like Tempranillo to thrive alongside the classics.",
    wineries: "Mount Majura Vineyard, Capital Wines, Pankhurst Wines."
  },
  bungendore: {
    title: "Bungendore / Wamboin",
    tags: ["High Altitude", "Pinot Noir Country", "Coolest"],
    desc: "These areas sit at higher altitudes (up to 800m). It is significantly cooler here, making it the prime location for Pinot Noir and Chardonnay, which require a longer, cooler ripening period.",
    wineries: "Contentious Character, Norton Road Wines, Lark Hill (Wamboin vineyard)."
  }
}

// Varietal data
const varietalData = {
  shiraz: {
    title: "Shiraz Viognier",
    subtitle: '"The Flagship Blend"',
    icon: "🍷",
    flavor: "Dark cherry, white pepper, spice, and floral violet notes. Often co-fermented with a small percentage of white Viognier grapes for aroma and texture.",
    pairing: "Roast lamb, duck, or mushroom risotto.",
    example: "Clonakilla Shiraz Viognier (often cited as one of Australia's greatest wines)."
  },
  riesling: {
    title: "Riesling",
    subtitle: '"Liquid Gold"',
    icon: "🥂",
    flavor: "Bone dry, crisp acid, intense citrus (lime and lemon), developing toasty honey notes with age. Pure and unadulterated.",
    pairing: "Fresh oysters, spicy Thai curry, or fish and chips.",
    example: "Helm Wines Premium Riesling (Ken Helm is a champion of the variety)."
  },
  alt: {
    title: "The Alternatives",
    subtitle: '"The New Wave"',
    icon: "🍇",
    flavor: "The region is experimenting with Spanish and Italian varieties that suit the continental climate. Tempranillo, Sangiovese, and Gruner Veltliner are rising stars.",
    pairing: "Tapas plates, charcuterie, or paella.",
    example: "Mount Majura Tempranillo (Single site specific)."
  }
}

// Trivia data
const triviaData = [
  {
    icon: "🍄",
    title: "Ideally Suited for Truffles",
    text: "The same cool winter climate that allows vines to rest makes the Canberra region one of the best places in Australia for growing black truffles. Many wineries host truffle hunts in winter!"
  },
  {
    icon: "🧬",
    title: "The Busby Clone",
    text: "Much of the Shiraz in the region is grown from a clone dating back to James Busby's original 1832 collection. This 'old' genetic material contributes to the unique savory character of the wine."
  },
  {
    icon: "❄️",
    title: "Frost Fighting",
    text: "Spring frost is the biggest danger here. You'll often see large fans in vineyards. These mix the warmer air inversion layer with the freezing ground air to save the buds from burning."
  }
]

function LearnPage() {
  const [selectedRegion, setSelectedRegion] = useState('murrumbateman')
  const [selectedVarietal, setSelectedVarietal] = useState('shiraz')
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0)
  const [isRegionTransitioning, setIsRegionTransitioning] = useState(false)

  const selectRegion = (regionKey) => {
    if (regionKey === selectedRegion) return
    
    setIsRegionTransitioning(true)
    setTimeout(() => {
      setSelectedRegion(regionKey)
      setIsRegionTransitioning(false)
    }, 150)
  }

  const nextTrivia = () => {
    setCurrentTriviaIndex((prev) => (prev + 1) % triviaData.length)
  }

  const prevTrivia = () => {
    setCurrentTriviaIndex((prev) => (prev - 1 + triviaData.length) % triviaData.length)
  }

  const currentRegion = regionsData[selectedRegion]
  const currentVarietal = varietalData[selectedVarietal]
  const currentTrivia = triviaData[currentTriviaIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wine-burgundy via-wine-deep-red to-wine-charcoal text-white py-20 pb-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-wine-gold rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-wine-rose rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">Learn About The Region</h1>
            <p className="text-xl md:text-2xl text-wine-cream mb-4 italic">"Cool Climate. Serious Wine."</p>
            <p className="text-lg text-wine-cream opacity-90 max-w-2xl mx-auto leading-relaxed">
              Explore the Canberra District Wine Region. Home to 140 vineyards and 40 wineries, defined by high altitudes, ancient soils, and a pioneering spirit.
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Climate Dashboard */}
      <section className="py-16 bg-gray-50 relative -mt-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-wine-burgundy mb-4 font-serif">
                The Cool Climate Advantage
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                What makes Canberra wine unique? It's the <strong>Diurnal Range</strong>. The region experiences hot summer days (ripening the fruit) and significantly cool nights (retaining acidity). This contrast creates wines with intense flavor complexity and elegance.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white rounded-xl shadow-md hover:shadow-wine transition-all p-6 text-center transform hover:scale-105">
                <div className="text-4xl mb-2">🏔️</div>
                <div className="text-2xl font-bold text-wine-burgundy">500-850m</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">Altitude Range</div>
              </div>
              <div className="bg-white rounded-xl shadow-md hover:shadow-wine transition-all p-6 text-center transform hover:scale-105">
                <div className="text-4xl mb-2">🌡️</div>
                <div className="text-2xl font-bold text-wine-burgundy">12°C</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">Diurnal Swing</div>
              </div>
              <div className="bg-white rounded-xl shadow-md hover:shadow-wine transition-all p-6 text-center transform hover:scale-105">
                <div className="text-4xl mb-2">🍇</div>
                <div className="text-2xl font-bold text-wine-burgundy">140+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">Vineyards</div>
              </div>
              <div className="bg-white rounded-xl shadow-md hover:shadow-wine transition-all p-6 text-center transform hover:scale-105">
                <div className="text-4xl mb-2">🕒</div>
                <div className="text-2xl font-bold text-wine-burgundy">35 min</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">From CBD</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map/Regions */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-wine-burgundy mb-4 font-serif">
                Explore the Sub-Regions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The district is not a single block but a collection of micro-climates. Click the zones below to discover the unique terroir of each area.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* The Interactive Grid Map */}
              <div className="lg:col-span-1">
                <div className="grid grid-cols-2 gap-3">
                  {/* Hall */}
                  <button
                    onClick={() => selectRegion('hall')}
                    className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center h-32 ${
                      selectedRegion === 'hall'
                        ? 'bg-white border-wine-burgundy shadow-wine'
                        : 'bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">🌋</span>
                    <span className="font-bold text-gray-700">Hall / ACT</span>
                  </button>

                  {/* Murrumbateman */}
                  <button
                    onClick={() => selectRegion('murrumbateman')}
                    className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center h-32 relative ${
                      selectedRegion === 'murrumbateman'
                        ? 'bg-white border-wine-burgundy shadow-wine'
                        : 'bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="absolute top-2 right-2 text-wine-burgundy animate-pulse">●</div>
                    <span className="text-2xl mb-2">⛰️</span>
                    <span className="font-bold text-gray-700">Murrumbateman</span>
                  </button>

                  {/* City Center */}
                  <div className="p-4 rounded-lg bg-wine-charcoal text-white text-center flex flex-col items-center justify-center h-32 opacity-90 cursor-default">
                    <span className="text-2xl mb-2">🏙️</span>
                    <span className="font-bold">CANBERRA</span>
                    <span className="text-xs text-gray-400">City Hub</span>
                  </div>

                  {/* Bungendore */}
                  <button
                    onClick={() => selectRegion('bungendore')}
                    className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center h-32 ${
                      selectedRegion === 'bungendore'
                        ? 'bg-white border-wine-burgundy shadow-wine'
                        : 'bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">🌬️</span>
                    <span className="font-bold text-gray-700 text-sm">Bungendore / Wamboin</span>
                  </button>

                  {/* Lake George */}
                  <button
                    onClick={() => selectRegion('lakegeorge')}
                    className={`col-span-2 p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center justify-center h-32 ${
                      selectedRegion === 'lakegeorge'
                        ? 'bg-white border-wine-burgundy shadow-wine'
                        : 'bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">🌊</span>
                    <span className="font-bold text-gray-700">Lake George</span>
                  </button>
                </div>
              </div>

              {/* Detail Panel */}
              <div className={`lg:col-span-2 bg-wine-cream p-8 rounded-xl shadow-inner border border-gray-200 transition-opacity duration-300 ${
                isRegionTransitioning ? 'opacity-50' : 'opacity-100'
              }`}>
                <h3 className="text-2xl md:text-3xl font-serif text-wine-burgundy mb-3">
                  {currentRegion.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentRegion.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {currentRegion.desc}
                </p>
                <div className="bg-white p-4 rounded-lg border-l-4 border-wine-burgundy">
                  <h4 className="font-bold text-gray-800 mb-2">Notable Vineyards & Wineries</h4>
                  <p className="text-sm text-gray-600">{currentRegion.wineries}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Varietals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-wine-burgundy mb-6 font-serif">
                  What We Grow
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  While over 30 varieties are planted, two reign supreme. The <strong>Shiraz</strong> here is medium-bodied and savory (unlike the heavy Barossa style), and the <strong>Riesling</strong> is world-renowned for its crisp, dry purity.
                </p>

                {/* Varietal Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 text-center">
                    Estimated Varietal Plantings
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Shiraz</span>
                        <span className="text-sm font-medium text-wine-burgundy">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-wine-burgundy h-3 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Riesling</span>
                        <span className="text-sm font-medium text-wine-gold">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-wine-gold h-3 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Cabernet Sauvignon</span>
                        <span className="text-sm font-medium text-wine-deep-red">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-wine-deep-red h-3 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Pinot Noir</span>
                        <span className="text-sm font-medium text-wine-rose">10%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-wine-rose h-3 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Others</span>
                        <span className="text-sm font-medium text-gray-500">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gray-500 h-3 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Wine Explorer */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="flex border-b">
                  <button
                    onClick={() => setSelectedVarietal('shiraz')}
                    className={`flex-1 py-4 text-center font-bold transition-colors ${
                      selectedVarietal === 'shiraz'
                        ? 'text-wine-burgundy border-b-2 border-wine-burgundy'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Shiraz
                  </button>
                  <button
                    onClick={() => setSelectedVarietal('riesling')}
                    className={`flex-1 py-4 text-center font-bold transition-colors ${
                      selectedVarietal === 'riesling'
                        ? 'text-wine-burgundy border-b-2 border-wine-burgundy'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Riesling
                  </button>
                  <button
                    onClick={() => setSelectedVarietal('alt')}
                    className={`flex-1 py-4 text-center font-bold transition-colors text-sm ${
                      selectedVarietal === 'alt'
                        ? 'text-wine-burgundy border-b-2 border-wine-burgundy'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Alternatives
                  </button>
                </div>

                <div className="p-8 min-h-[400px]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-3xl font-serif text-gray-900">{currentVarietal.title}</h3>
                    <span className="text-4xl">{currentVarietal.icon}</span>
                  </div>
                  <p className="text-lg text-gray-600 italic mb-6">{currentVarietal.subtitle}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">
                        Flavor Profile
                      </h4>
                      <p className="text-gray-600">{currentVarietal.flavor}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">
                        Food Pairing
                      </h4>
                      <p className="text-gray-600">{currentVarietal.pairing}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">
                        Famous Example
                      </h4>
                      <p className="text-gray-600">{currentVarietal.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 bg-wine-charcoal text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center font-serif">
              A Timeline of Resilience
            </h2>

            <div className="relative space-y-12">
              {/* Timeline events */}
              <div className="relative pl-8 md:pl-12">
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-wine-burgundy border-4 border-wine-charcoal"></div>
                <h3 className="text-2xl font-serif text-wine-cream mb-2">1840s</h3>
                <h4 className="text-gray-400 font-bold mb-2">The Beginnings</h4>
                <p className="text-gray-300 leading-relaxed">
                  First vines are planted in the district by settlers, but the industry fizzles out due to economic factors and lack of market demand.
                </p>
              </div>

              <div className="relative pl-8 md:pl-12">
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-white border-4 border-wine-charcoal"></div>
                <h3 className="text-2xl font-serif text-wine-cream mb-2">1971</h3>
                <h4 className="text-gray-400 font-bold mb-2">The Scientific Renaissance</h4>
                <p className="text-gray-300 leading-relaxed">
                  Dr. Edgar Riek and John Kirk (a scientist at CSIRO) plant the first modern vines. Ken Helm follows closely in 1973. This marks the birth of the modern industry.
                </p>
              </div>

              <div className="relative pl-8 md:pl-12">
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-wine-burgundy border-4 border-wine-charcoal"></div>
                <h3 className="text-2xl font-serif text-wine-cream mb-2">1993</h3>
                <h4 className="text-gray-400 font-bold mb-2">The Game Changer</h4>
                <p className="text-gray-300 leading-relaxed">
                  Tim Kirk (Clonakilla) travels to the Rhône Valley, tastes Côte Rôtie, and returns to produce the first commercial Shiraz Viognier in Canberra. It changes the perception of Australian Shiraz forever.
                </p>
              </div>

              <div className="relative pl-8 md:pl-12">
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-white border-4 border-wine-charcoal"></div>
                <h3 className="text-2xl font-serif text-wine-cream mb-2">Present Day</h3>
                <h4 className="text-gray-400 font-bold mb-2">Global Recognition</h4>
                <p className="text-gray-300 leading-relaxed">
                  The region is now home to 140 vineyards and is widely considered Australia's premier cool-climate wine district.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Did You Know / Trivia */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-wine-burgundy mb-8 text-center font-serif">
              Did You Know?
            </h2>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-5xl md:text-6xl mb-6">{currentTrivia.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  {currentTrivia.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {currentTrivia.text}
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <button
                  onClick={prevTrivia}
                  className="text-gray-400 hover:text-wine-burgundy font-bold transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="text-sm text-gray-400">
                  {currentTriviaIndex + 1} / {triviaData.length}
                </span>
                <button
                  onClick={nextTrivia}
                  className="text-gray-400 hover:text-wine-burgundy font-bold transition-colors flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-wine-burgundy mb-4 font-serif">
            Ready to Explore?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover wines from across the Canberra Region and find your next favorite bottle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/wines"
              className="px-8 py-4 bg-wine-burgundy text-white rounded-lg font-semibold hover:bg-wine-deep-red transition-all shadow-md hover:shadow-wine"
            >
              Browse Wines
            </Link>
            <Link
              to="/wineries"
              className="px-8 py-4 bg-transparent border-2 border-wine-burgundy text-wine-burgundy rounded-lg font-semibold hover:bg-wine-burgundy hover:text-white transition-all"
            >
              View Wineries
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LearnPage
