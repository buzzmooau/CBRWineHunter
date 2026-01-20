import React from 'react'

function WineryCard({ winery }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Winery Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-wine-burgundy to-wine-deep-red flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h3 className="text-2xl font-display font-semibold">
            {winery.name.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h3>
        </div>
      </div>

      {/* Winery Info */}
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold text-wine-burgundy mb-2">
          {winery.name}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {winery.address && (
            <p className="flex items-start">
              <span className="mr-2">📍</span>
              <span>{winery.address}</span>
            </p>
          )}
          
          {winery.phone && (
            <p className="flex items-center">
              <span className="mr-2">📞</span>
              <span>{winery.phone}</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <a
          href={winery.shop_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-wine-burgundy text-white py-2 px-4 rounded hover:bg-wine-deep-red transition-colors duration-200"
        >
          Visit Wine Shop →
        </a>
      </div>
    </div>
  )
}

export default WineryCard
