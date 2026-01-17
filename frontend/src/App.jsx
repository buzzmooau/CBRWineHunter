import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* TODO: Add more routes */}
          {/* <Route path="/wine/:id" element={<WineDetailPage />} /> */}
          {/* <Route path="/winery/:slug" element={<WineryPage />} /> */}
          {/* <Route path="/map" element={<MapPage />} /> */}
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
