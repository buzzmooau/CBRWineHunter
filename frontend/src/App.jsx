import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WineriesPage from './pages/WineriesPage'
import WinesPage from './pages/WinesPage'
import LearnPage from './pages/LearnPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation */}
        <nav className="bg-wine-burgundy text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-2xl font-display font-bold hover:text-wine-cream transition-colors">
                CBR Wine Hunter
              </Link>
              <div className="flex space-x-6">
                <Link to="/" className="hover:text-wine-cream transition-colors">
                  Home
                </Link>
                <Link to="/wines" className="hover:text-wine-cream transition-colors">
                  Wines
                </Link>
                <Link to="/wineries" className="hover:text-wine-cream transition-colors">
                  Wineries
                </Link>
                <Link to="/learn" className="hover:text-wine-cream transition-colors">
                  Learn
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {/* Routes */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wines" element={<WinesPage />} />
            <Route path="/wineries" element={<WineriesPage />} />
            <Route path="/learn" element={<LearnPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
