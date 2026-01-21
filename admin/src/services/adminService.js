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
}

export default new AdminService();
