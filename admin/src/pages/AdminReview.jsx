import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';

export default function AdminReview() {
  const [pendingWines, setPendingWines] = useState([]);
  const [stats, setStats] = useState({ pending: 0, live: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});
  const [editingWine, setEditingWine] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pending, statsData] = await Promise.all([
        adminService.getPendingWines(),
        adminService.getWineStats()
      ]);
      
      setPendingWines(pending.wines || []);
      
      // Parse stats
      const statsObj = {};
      statsData.stats.forEach(s => {
        statsObj[s.status] = s.count;
      });
      setStats(statsObj);
      
    } catch (err) {
      setError('Failed to load pending wines');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (wine) => {
    setEditingWine(wine);
    setEditForm({
      name: wine.name,
      variety: wine.variety || '',
      vintage: wine.vintage || '',
      price: wine.price || '',
      description: wine.description || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingWine) return;
    
    setProcessing(prev => ({ ...prev, [editingWine.id]: 'saving' }));
    
    try {
      await adminService.updateWine(editingWine.id, editForm);
      
      // Update local state
      setPendingWines(pendingWines.map(w => 
        w.id === editingWine.id 
          ? { ...w, ...editForm } 
          : w
      ));
      
      setEditingWine(null);
      setEditForm({});
    } catch (err) {
      alert('Failed to update wine');
      console.error(err);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[editingWine.id];
        return newState;
      });
    }
  };

  const handleApprove = async (wineId, wineName) => {
    if (!confirm(`Approve "${wineName}" and make it live on the public site?`)) return;
    
    setProcessing(prev => ({ ...prev, [wineId]: 'approving' }));
    
    try {
      await adminService.approveWine(wineId);
      setPendingWines(pendingWines.filter(w => w.id !== wineId));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, live: prev.live + 1 }));
    } catch (err) {
      alert('Failed to approve wine');
      console.error(err);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[wineId];
        return newState;
      });
    }
  };

  const handleReject = async (wineId, wineName) => {
    if (!confirm(`Reject and delete "${wineName}"? This cannot be undone.`)) return;
    
    setProcessing(prev => ({ ...prev, [wineId]: 'rejecting' }));
    
    try {
      await adminService.rejectWine(wineId);
      setPendingWines(pendingWines.filter(w => w.id !== wineId));
      setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
    } catch (err) {
      alert('Failed to reject wine');
      console.error(err);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[wineId];
        return newState;
      });
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Review Pending Wines</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <Link
              to="/admin/wines"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Wine Management
            </Link>
            <Link
              to="/admin/review"
              className="py-4 px-1 border-b-2 border-red-500 text-red-600 font-medium"
            >
              Review ({stats.pending || 0})
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Live Wines</div>
            <div className="text-3xl font-bold text-green-600">{stats.live || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">
              {(stats.pending || 0) + (stats.live || 0)}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {pendingWines.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No wines pending review at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Winery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variety
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vintage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingWines.map((wine) => (
                  <tr key={wine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{wine.name}</div>
                      {wine.product_url && (
                        <a
                          href={wine.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View on winery site →
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {wine.winery?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {wine.variety || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {wine.vintage || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${wine.price?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(wine)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleApprove(wine.id, wine.name)}
                        disabled={processing[wine.id]}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing[wine.id] === 'approving' ? (
                          <>⏳ Approving...</>
                        ) : (
                          <>✓ Approve</>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(wine.id, wine.name)}
                        disabled={processing[wine.id]}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing[wine.id] === 'rejecting' ? (
                          <>⏳ Rejecting...</>
                        ) : (
                          <>✗ Reject</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingWine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Wine: {editingWine.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wine Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety
                    </label>
                    <input
                      type="text"
                      value={editForm.variety}
                      onChange={(e) => setEditForm({ ...editForm, variety: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vintage
                    </label>
                    <input
                      type="text"
                      value={editForm.vintage}
                      onChange={(e) => setEditForm({ ...editForm, vintage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2024 or NV"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingWine(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={processing[editingWine.id]}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing[editingWine.id] === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
