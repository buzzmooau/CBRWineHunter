import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking...')
  const [stats, setStats] = useState({ wines: 0, wineries: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    
    // Test API connection and fetch stats
    Promise.all([
      fetch(`${apiUrl.replace('/api', '')}`),
      fetch(`${apiUrl}/wines`),
      fetch(`${apiUrl}/wineries`)
    ])
      .then(async ([rootRes, winesRes, wineriesRes]) => {
        const rootData = await rootRes.json()
        const winesData = await winesRes.json()
        const wineriesData = await wineriesRes.json()
        
        setApiStatus(`Connected! ${rootData.service} v${rootData.version}`)
        setStats({
          wines: winesData.total || winesData.wines?.length || 0,
          wineries: wineriesData.wineries?.length || 0
        })
        setIsLoading(false)
      })
      .catch(err => {
        setApiStatus(`Not connected: ${err.message}`)
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wine-burgundy via-wine-deep-red to-wine-burgundy text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-wine-gold rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-wine-rose rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif animate-fade-in">
              CBR Wine Hunter
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-wine-cream opacity-90">
              Discover exceptional wines from across the Canberra Region
            </p>
            <p className="text-lg mb-12 text-wine-cream opacity-75 max-w-2xl mx-auto">
              Your comprehensive guide to discovering wines from 40+ local wineries, all in one place
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/wines"
                className="group relative px-8 py-4 bg-wine-gold text-wine-burgundy font-semibold rounded-lg shadow-gold hover:shadow-gold-lg transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🍷 Browse Wines
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Link>
              
              <Link 
                to="/wineries"
                className="group px-8 py-4 bg-transparent border-2 border-wine-cream text-wine-cream font-semibold rounded-lg hover:bg-wine-cream hover:text-wine-burgundy transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  🗺️ Explore Wineries
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="bg-gray-50 py-12 relative -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Wines Count */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-wine">
              <div className="text-5xl font-bold text-wine-burgundy mb-2">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span>{stats.wines}</span>
                )}
              </div>
              <div className="text-gray-600 font-medium">Wines Listed</div>
            </div>

            {/* Wineries Count */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-wine">
              <div className="text-5xl font-bold text-wine-deep-red mb-2">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span>{stats.wineries}</span>
                )}
              </div>
              <div className="text-gray-600 font-medium">Wineries</div>
            </div>

            {/* Updates */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-wine">
              <div className="text-5xl font-bold text-wine-gold mb-2">
                Daily
              </div>
              <div className="text-gray-600 font-medium">Updated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-wine-burgundy mb-4 font-serif">
              Features
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to discover and explore Canberra's finest wines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1: Wine Search */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-wine-lg p-8 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🍷</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-wine-burgundy group-hover:text-wine-deep-red transition-colors">
                    Wine Search & Filter
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Search and filter wines by variety, vintage, price range, and winery. Find your perfect bottle with ease.
                  </p>
                  <Link 
                    to="/wines"
                    className="inline-flex items-center gap-2 text-wine-deep-red font-medium hover:gap-3 transition-all"
                  >
                    Explore wines
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature 2: Learn About The Region */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-wine-lg p-8 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🎓</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-wine-burgundy group-hover:text-wine-deep-red transition-colors">
                    Learn About The Region
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover the Canberra District's unique terroir, climate, history, and varietals. Explore sub-regions and what makes this cool-climate wine region special.
                  </p>
                  <Link 
                    to="/learn"
                    className="inline-flex items-center gap-2 text-wine-deep-red font-medium hover:gap-3 transition-all"
                  >
                    Explore now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature 3: Price Tracking */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-wine-lg p-8 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="text-5xl">📊</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-wine-burgundy group-hover:text-wine-deep-red transition-colors">
                    Price Tracking
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Track wine prices over time and get notified of price changes. Never miss a great deal.
                  </p>
                  <div className="inline-flex items-center gap-2 text-gray-400 font-medium">
                    Coming soon
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Daily Updates */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-wine-lg p-8 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🔄</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-wine-burgundy group-hover:text-wine-deep-red transition-colors">
                    Automatic Updates
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Automatically updated daily with the latest wines and prices. Always get the most current information.
                  </p>
                  <div className="inline-flex items-center gap-2 text-wine-gold font-medium">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wine-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-wine-gold"></span>
                    </span>
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-wine-burgundy mb-4 font-serif">
              How It Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-wine-burgundy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2 text-wine-burgundy">
                  Search
                </h3>
                <p className="text-gray-600">
                  Browse wines by variety, vintage, or price range
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-wine-deep-red text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2 text-wine-burgundy">
                  Discover
                </h3>
                <p className="text-gray-600">
                  Find new wines from local Canberra wineries
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-wine-gold text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2 text-wine-burgundy">
                  Purchase
                </h3>
                <p className="text-gray-600">
                  Visit the winery or buy online directly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Status (collapsible) */}
      {apiStatus.includes('Connected') && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <details className="max-w-2xl mx-auto">
              <summary className="cursor-pointer bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <span className="font-medium text-wine-burgundy">System Status</span>
              </summary>
              <div className="mt-4 bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="font-mono text-sm text-gray-700">{apiStatus}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  All systems operational
                </p>
              </div>
            </details>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-wine-burgundy text-wine-cream py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4 font-serif flex items-center gap-2">
                🍷 CBR Wine Hunter
              </h3>
              <p className="text-wine-cream opacity-75 mb-4">
                Canberra Region
              </p>
              <p className="text-sm opacity-75">
                Your comprehensive guide to discovering exceptional wines from the Canberra wine region. 
                Explore wines from 40+ local wineries, all in one place.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-wine-cream opacity-75 hover:opacity-100 transition-opacity">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/wines" className="text-wine-cream opacity-75 hover:opacity-100 transition-opacity">
                    Browse Wines
                  </Link>
                </li>
                <li>
                  <Link to="/wineries" className="text-wine-cream opacity-75 hover:opacity-100 transition-opacity">
                    Wineries
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-lg font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li className="flex items-center gap-2">
                  <span>✓</span> {stats.wines}+ Wines Listed
                </li>
                <li className="flex items-center gap-2">
                  <span>✓</span> {stats.wineries}+ Wineries
                </li>
                <li className="flex items-center gap-2">
                  <span>✓</span> Updated Daily
                </li>
                <li className="flex items-center gap-2">
                  <span>✓</span> Canberra Region
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-wine-cream border-opacity-20 pt-8 text-center">
            <p className="text-sm opacity-75">
              © 2026 CBR Wine Hunter. Built with{' '}
              <span className="text-wine-rose">❤️</span>{' '}
              for the Canberra wine community.
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <a href="#" className="opacity-75 hover:opacity-100 transition-opacity">
                Privacy Policy
              </a>
              <a href="#" className="opacity-75 hover:opacity-100 transition-opacity">
                Terms of Service
              </a>
              <a href="#" className="opacity-75 hover:opacity-100 transition-opacity">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
