import React, { useState, useEffect } from 'react';

const WineFilters = ({ onFilterChange, varieties, vintages, wineries }) => {
  const [filters, setFilters] = useState({
    search: '',
    variety: '',
    vintage: '',
    winery: '',
    minPrice: '',
    maxPrice: ''
  });

  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      variety: '',
      vintage: '',
      winery: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="filter-panel rounded-lg p-6 mb-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-2xl font-bold">Find Your Wine</h2>
          {activeFilterCount > 0 && (
            <span className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-white hover:text-[#D4AF37] transition-colors"
        >
          <svg 
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className={`
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4
        ${isExpanded ? 'block' : 'hidden lg:grid'}
      `}>
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="block text-sm font-semibold mb-2 opacity-90">
            Search Wine
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Wine name..."
              className="filter-input w-full px-4 py-2.5 rounded-lg"
            />
            <svg 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Variety */}
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-90">
            Variety
          </label>
          <select
            value={filters.variety}
            onChange={(e) => handleChange('variety', e.target.value)}
            className="filter-input wine-filter-select w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer"
          >
            <option value="">All Varieties</option>
            {varieties?.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Vintage */}
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-90">
            Vintage
          </label>
          <select
            value={filters.vintage}
            onChange={(e) => handleChange('vintage', e.target.value)}
            className="filter-input wine-filter-select w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer"
          >
            <option value="">All Vintages</option>
            {vintages?.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Winery */}
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-90">
            Winery
          </label>
          <select
            value={filters.winery}
            onChange={(e) => handleChange('winery', e.target.value)}
            className="filter-input wine-filter-select w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer"
          >
            <option value="">All Wineries</option>
            {wineries?.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-semibold mb-2 opacity-90">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              placeholder="Min"
              className="filter-input w-full px-3 py-2.5 rounded-lg"
              min="0"
            />
            <span className="flex items-center opacity-60">-</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              placeholder="Max"
              className="filter-input w-full px-3 py-2.5 rounded-lg"
              min="0"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="
              w-full px-4 py-2.5 rounded-lg
              bg-white/10 hover:bg-white/20
              border-2 border-white/30 hover:border-white/50
              font-semibold transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Quick Filters / Popular Searches */}
      <div className={`mt-6 pt-6 border-t border-white/20 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <p className="text-sm font-semibold mb-3 opacity-90">Quick Filters:</p>
        <div className="flex flex-wrap gap-2">
          {['Shiraz', 'Chardonnay', 'Riesling', 'Pinot Noir', 'Rosé', 'Sparkling'].map(variety => (
            <button
              key={variety}
              onClick={() => handleChange('variety', variety)}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold
                transition-all duration-200
                ${filters.variety === variety 
                  ? 'bg-[#D4AF37] text-white shadow-lg' 
                  : 'bg-white/10 hover:bg-white/20 border border-white/30'}
              `}
            >
              {variety}
            </button>
          ))}
          <button
            onClick={() => {
              handleChange('minPrice', '');
              handleChange('maxPrice', '30');
            }}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold
              transition-all duration-200
              ${filters.maxPrice === '30' 
                ? 'bg-[#D4AF37] text-white shadow-lg' 
                : 'bg-white/10 hover:bg-white/20 border border-white/30'}
            `}
          >
            Under $30
          </button>
          <button
            onClick={() => {
              handleChange('minPrice', '50');
              handleChange('maxPrice', '');
            }}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold
              transition-all duration-200
              ${filters.minPrice === '50' 
                ? 'bg-[#D4AF37] text-white shadow-lg' 
                : 'bg-white/10 hover:bg-white/20 border border-white/30'}
            `}
          >
            Premium ($50+)
          </button>
        </div>
      </div>
    </div>
  );
};

export default WineFilters;
