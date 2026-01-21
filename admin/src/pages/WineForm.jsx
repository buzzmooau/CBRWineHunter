import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';

export default function WineForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [wineries, setWineries] = useState([]);

  const [formData, setFormData] = useState({
    winery_id: '',
    name: '',
    variety: '',
    vintage: '',
    price: '',
    description: '',
    product_url: '',
    image_url: '',
    alcohol_content: '',
    bottle_size: '750ml',
    is_available: true
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const wineriesData = await adminService.getWineries();
      setWineries(wineriesData.wineries || []);

      if (isEdit) {
        const wine = await adminService.getWine(id);
        setFormData({
          winery_id: wine.winery?.id || '',
          name: wine.name || '',
          variety: wine.variety || '',
          vintage: wine.vintage || '',
          price: wine.price || '',
          description: wine.description || '',
          product_url: wine.product_url || '',
          image_url: wine.image_url || '',
          alcohol_content: wine.alcohol_content || '',
          bottle_size: wine.bottle_size || '750ml',
          is_available: wine.is_available !== false
        });
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        winery_id: parseInt(formData.winery_id),
        price: parseFloat(formData.price) || null,
        // Remove empty strings
        variety: formData.variety || null,
        vintage: formData.vintage || null,
        description: formData.description || null,
        product_url: formData.product_url || null,
        image_url: formData.image_url || null,
        alcohol_content: formData.alcohol_content || null,
        bottle_size: formData.bottle_size || null
      };

      if (isEdit) {
        await adminService.updateWine(id, submitData);
      } else {
        await adminService.createWine(submitData);
      }

      navigate('/admin/wines');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save wine');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-wine-burgundy">
            {isEdit ? 'Edit Wine' : 'Add New Wine'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Winery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Winery <span className="text-red-500">*</span>
            </label>
            <select
              name="winery_id"
              value={formData.winery_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
            >
              <option value="">Select a winery</option>
              {wineries.map(winery => (
                <option key={winery.id} value={winery.id}>
                  {winery.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Reserve Shiraz"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
            />
          </div>

          {/* Variety and Vintage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variety
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g., Shiraz, Chardonnay"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vintage
              </label>
              <input
                type="text"
                name="vintage"
                value={formData.vintage}
                onChange={handleChange}
                placeholder="e.g., 2021, NV"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (AUD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="e.g., 45.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter wine description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product URL
              </label>
              <input
                type="url"
                name="product_url"
                value={formData.product_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alcohol Content
              </label>
              <input
                type="text"
                name="alcohol_content"
                value={formData.alcohol_content}
                onChange={handleChange}
                placeholder="e.g., 13.5%"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bottle Size
              </label>
              <input
                type="text"
                name="bottle_size"
                value={formData.bottle_size}
                onChange={handleChange}
                placeholder="e.g., 750ml"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-burgundy focus:border-transparent"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-wine-burgundy focus:ring-wine-burgundy border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Wine is available for purchase
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-wine-burgundy text-white py-2 px-4 rounded-lg hover:bg-wine-deep-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : (isEdit ? 'Update Wine' : 'Add Wine')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/wines')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
