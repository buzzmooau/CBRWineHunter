import { useState, useEffect } from 'react'
import { getWineries } from '../services/wineryService'
import WineryCard from '../components/WineryCard'

function WineriesPage() {
  const [wineries, setWineries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchWineries()
  }, [])

  const fetchWineries = async () => {
    try {
      setLoading(true)
      const data = await getWineries()
      setWineries(data.wineries)
      setTotalCount(data.total)
      setError(null)
    } catch (err) {
      setError('Failed to load wineries. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-wine-burgundy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wineries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchWineries}
            className="bg-wine-burgundy text-white px-6 py-2 rounded hover:bg-wine-deep-red"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-display font-bold text-wine-burgundy">
            Canberra Region Wineries
          </h1>
          <p className="text-gray-600 mt-2">
            Discover {totalCount} wineries across the Canberra wine region
          </p>
        </div>
      </header>

      {/* Wineries Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wineries.map((winery) => (
            <WineryCard key={winery.id} winery={winery} />
          ))}
        </div>

        {/* Empty State */}
        {wineries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No wineries found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>Built with ❤️ for the Canberra wine community</p>
        </div>
      </footer>
    </div>
  )
}

export default WineriesPage
