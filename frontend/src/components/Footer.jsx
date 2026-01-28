import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Footer() {
  const [stats, setStats] = useState({ wines: 0, wineries: 0 })

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    
    // Fetch stats for footer
    Promise.all([
      fetch(`${apiUrl}/wines`),
      fetch(`${apiUrl}/wineries`)
    ])
      .then(async ([winesRes, wineriesRes]) => {
        const winesData = await winesRes.json()
        const wineriesData = await wineriesRes.json()
        
        setStats({
          wines: winesData.total || winesData.wines?.length || 0,
          wineries: wineriesData.wineries?.length || 0
        })
      })
      .catch(() => {
        // Silently fail - footer will show 0s
      })
  }, [])

  return (
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
            
            {/* GitHub link */}
            <div className="mt-4">
              <a 
                href="https://github.com/buzzmooau/CBRWineHunter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-wine-cream opacity-75 hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            </div>
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
              <li>
                <Link to="/learn" className="text-wine-cream opacity-75 hover:opacity-100 transition-opacity">
                  Learn About Region
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li className="flex items-center gap-2">
                <span>✓</span> {stats.wines > 0 ? `${stats.wines}+` : '500+'} Wines Listed
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> {stats.wineries > 0 ? `${stats.wineries}+` : '40+'} Wineries
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
  )
}

export default Footer
