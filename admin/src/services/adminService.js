import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.50.121:8000/api';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });
  }

  // Wine operations
  async getWines(params = {}) {
    const response = await this.api.get('/wines/', { params });
    return response.data;
  }

  async getWine(id) {
    const response = await this.api.get(`/wines/${id}`);
    return response.data;
  }

  async createWine(wineData) {
    const response = await this.api.post('/wines/', wineData);
    return response.data;
  }

  async updateWine(id, wineData) {
    const response = await this.api.put(`/wines/${id}`, wineData);
    return response.data;
  }

  async deleteWine(id) {
    const response = await this.api.delete(`/wines/${id}`);
    return response.data;
  }

  // Winery operations
  async getWineries() {
    const response = await this.api.get('/wineries/');
    return response.data;
  }

  async getVarieties() {
    const response = await this.api.get('/wines/varieties/list');
    return response.data;
  }

  async getVintages() {
    const response = await this.api.get('/wines/vintages/list');
    return response.data;
  }

  // ============================================================================
  // Review Workflow Methods (NEW)
  // ============================================================================

  async getPendingWines(params = {}) {
    const response = await this.api.get('/wines/admin/pending', { params });
    return response.data;
  }

  async getWineStats() {
    const response = await this.api.get('/wines/admin/stats');
    return response.data;
  }

  async approveWine(wineId) {
    const response = await this.api.patch(`/wines/admin/${wineId}/approve`);
    return response.data;
  }

  async rejectWine(wineId) {
    const response = await this.api.patch(`/wines/admin/${wineId}/reject`);
    return response.data;
  }

  async updateWineStatus(wineId, status) {
    const response = await this.api.patch(`/wines/admin/${wineId}/status`, { status });
    return response.data;
  }

  async getAllWinesAdmin(params = {}) {
    const response = await this.api.get('/wines/admin/all', { params });
    return response.data;
  }
}

export default new AdminService();
