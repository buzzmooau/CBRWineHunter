import React from 'react'

function WineCard({ wine }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Wine Header */}
      <div className="bg-gradient-to-r from-wine-burgundy to-wine-deep-red p-4 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {wine.variety && (
              <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">
                {wine.variety}
              </span>
            )}
          </div>
          {wine.vintage && (
            <span className="text-2xl font-display font-bold">
              {wine.vintage}
            </span>
          )}
        </div>
      </div>

      {/* Wine Info */}
      <div className="p-6">
        <h3 className="text-lg font-display font-semibold text-wine-burgundy mb-2 line-clamp-2">
          {wine.name}
        </h3>
        
        <div className="text-sm text-gray-600 mb-3">
          <p className="font-semibold">{wine.winery.name}</p>
        </div>

        {wine.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {wine.description}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-2xl font-bold text-wine-burgundy">
            {wine.price ? `$${wine.price.toFixed(2)}` : 'Price N/A'}
          </div>
          
          {wine.product_url && (
            <a
              href={wine.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-wine-burgundy text-white px-4 py-2 rounded hover:bg-wine-deep-red transition-colors duration-200 text-sm font-semibold"
            >
              Buy →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default WineCard
