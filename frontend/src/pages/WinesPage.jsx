import { useState, useEffect } from 'react';
import { getWines, getVarieties, getVintages } from '../services/wineService';
import { getWineries } from '../services/wineryService';
import WineCard from '../components/WineCard';

export default function WinesPage() {
  const [wines, setWines] = useState([]);
  const [wineries, setWineries] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [vintages, setVintages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWines, setTotalWines] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedVintage, setSelectedVintage] = useState('');
  const [selectedWinery, setSelectedWinery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Pagination states
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadWines();
  }, [searchTerm, selectedVariety, selectedVintage, selectedWinery, minPrice, maxPrice, limit, offset, showAll]);

  const loadData = async () => {
    try {
      const [varietiesData, vintagesData, wineriesData] = await Promise.all([
        getVarieties(),
        getVintages(),
        getWineries()
      ]);
      setVarieties(varietiesData.varieties?.map(v => v.name) || []);
      setVintages(vintagesData.vintages?.map(v => v.year) || []);
      setWineries(wineriesData.wineries || []);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const loadWines = async () => {
    setLoading(true);
    console.log('Loading wines with:', { limit: showAll ? 1000 : limit, offset: showAll ? 0 : offset, showAll });
    try {
      const params = {
        limit: showAll ? 1000 : limit,
        offset: showAll ? 0 : offset,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedVariety) params.variety = selectedVariety;
      if (selectedVintage) params.vintage = selectedVintage;
      if (selectedWinery) params.winery_id = selectedWinery;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      const data = await getWines(params);
      setWines(data.wines || []);
      setTotalWines(data.total || 0);
    } catch (error) {
      console.error('Error loading wines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = () => {
    setShowAll(true);
    setOffset(0);
  };

  const handleNext = () => {
    if (offset + limit < totalWines) {
      setOffset(offset + limit);
      setShowAll(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
      setShowAll(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetPagination = () => {
    setOffset(0);
    setShowAll(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVariety('');
    setSelectedVintage('');
    setSelectedWinery('');
    setMinPrice('');
    setMaxPrice('');
    handleResetPagination();
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalWines / limit);
  const showingFrom = offset + 1;
  const showingTo = showAll ? totalWines : Math.min(offset + limit, totalWines);

  return (
    <div className="min-h-screen bg-wine-cream">
      {/* Header */}
      <div className="bg-wine-burgundy text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Canberra Region Wines</h1>
          <p className="text-wine-cream">
            Browse {totalWines} wines from across the region
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-wine-burgundy">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-wine-burgundy hover:text-wine-deep-red"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Wine name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleResetPagination();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy"
                />
              </div>

              {/* Winery Filter */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Winery
                </label>
                <select
                  value={selectedWinery}
                  onChange={(e) => {
                    setSelectedWinery(e.target.value);
                    handleResetPagination();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy bg-white"
                >
                  <option value="">All Wineries</option>
                  {wineries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((winery) => (
                      <option key={winery.id} value={winery.id}>
                        {winery.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Variety Filter */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Variety
                </label>
                <select
                  value={selectedVariety}
                  onChange={(e) => {
                    setSelectedVariety(e.target.value);
                    handleResetPagination();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy bg-white"
                >
                  <option value="">All Varieties</option>
                  {varieties.map((variety) => (
                    <option key={variety} value={variety}>
                      {variety}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vintage Filter */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Vintage
                </label>
                <select
                  value={selectedVintage}
                  onChange={(e) => {
                    setSelectedVintage(e.target.value);
                    handleResetPagination();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy bg-white"
                >
                  <option value="">All Vintages</option>
                  {vintages.map((vintage) => (
                    <option key={vintage} value={vintage}>
                      {vintage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      handleResetPagination();
                    }}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      handleResetPagination();
                    }}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wines Grid */}
          <div className="lg:col-span-3">
            {/* Results Info and Pagination Controls */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-gray-600">
                Showing {showingFrom}-{showingTo} of {totalWines} wines
              </div>
              
              <div className="flex gap-2">
                {!showAll && totalWines > limit && (
                  <button
                    onClick={handleShowAll}
                    className="px-4 py-2 bg-wine-burgundy text-white rounded-md hover:bg-wine-deep-red transition-colors"
                  >
                    Show All
                  </button>
                )}
                
                {!showAll && (
                  <>
                    <button
                      onClick={handlePrevious}
                      disabled={offset === 0}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        offset === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-wine-burgundy text-white hover:bg-wine-deep-red'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={handleNext}
                      disabled={offset + limit >= totalWines}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        offset + limit >= totalWines
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-wine-burgundy text-white hover:bg-wine-deep-red'
                      }`}
                    >
                      Next
                    </button>
                  </>
                )}

                {showAll && (
                  <button
                    onClick={() => {
                      setShowAll(false);
                      setOffset(0);
                    }}
                    className="px-4 py-2 bg-wine-burgundy text-white rounded-md hover:bg-wine-deep-red transition-colors"
                  >
                    Show Paginated
                  </button>
                )}
              </div>
            </div>

            {/* Page indicator (when not showing all) */}
            {!showAll && totalPages > 1 && (
              <div className="mb-4 text-center text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-wine-burgundy"></div>
                <p className="mt-4 text-gray-600">Loading wines...</p>
              </div>
            ) : wines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No wines found matching your criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-wine-burgundy hover:text-wine-deep-red"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {wines.map((wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </div>
            )}

            {/* Bottom Pagination Controls */}
            {wines.length > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600">
                  Showing {showingFrom}-{showingTo} of {totalWines} wines
                </div>
                
                <div className="flex gap-2">
                  {!showAll && totalWines > limit && (
                    <button
                      onClick={handleShowAll}
                      className="px-4 py-2 bg-wine-burgundy text-white rounded-md hover:bg-wine-deep-red transition-colors"
                    >
                      Show All
                    </button>
                  )}
                  
                  {!showAll && (
                    <>
                      <button
                        onClick={handlePrevious}
                        disabled={offset === 0}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          offset === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-wine-burgundy text-white hover:bg-wine-deep-red'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <button
                        onClick={handleNext}
                        disabled={offset + limit >= totalWines}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          offset + limit >= totalWines
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-wine-burgundy text-white hover:bg-wine-deep-red'
                        }`}
                      >
                        Next
                      </button>
                    </>
                  )}

                  {showAll && (
                    <button
                      onClick={() => {
                        setShowAll(false);
                        setOffset(0);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-wine-burgundy text-white rounded-md hover:bg-wine-deep-red transition-colors"
                    >
                      Show Paginated
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
