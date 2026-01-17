import { useState, useEffect } from 'react'

function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking...')

  useEffect(() => {
    // Test API connection
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    fetch(`${apiUrl.replace('/api', '')}`)
      .then(res => res.json())
      .then(data => {
        setApiStatus(`Connected! ${data.service} v${data.version}`)
      })
      .catch(err => {
        setApiStatus(`Not connected: ${err.message}`)
      })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-wine-burgundy mb-4">
          CBR Wine Hunter
        </h1>
        <p className="text-xl text-gray-600">
          Discover wines from across the Canberra Region
        </p>
      </header>

      {/* API Status */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-wine-deep-red">
            Backend Connection
          </h2>
          <p className="text-gray-700">
            Status: <span className="font-mono">{apiStatus}</span>
          </p>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-center text-wine-burgundy">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2 text-wine-deep-red">
              🍷 Wine Search
            </h3>
            <p className="text-gray-600">
              Search and filter wines by variety, vintage, price, and winery
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2 text-wine-deep-red">
              🗺️ Interactive Map
            </h3>
            <p className="text-gray-600">
              Explore wineries on an interactive map of the Canberra region
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2 text-wine-deep-red">
              📊 Price Tracking
            </h3>
            <p className="text-gray-600">
              Track wine prices and get notified of changes
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2 text-wine-deep-red">
              🔄 Daily Updates
            </h3>
            <p className="text-gray-600">
              Automatically updated with the latest wines and prices
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-500">
        <p>Built with ❤️ for the Canberra wine community</p>
      </footer>
    </div>
  )
}

export default HomePage
