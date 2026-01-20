import api from './api'

/**
 * Winery API service
 */

export const getWineries = async (params = {}) => {
  try {
    const response = await api.get('/wineries/', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching wineries:', error)
    throw error
  }
}

export const getWineryById = async (id) => {
  try {
    const response = await api.get(`/wineries/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching winery:', error)
    throw error
  }
}

export const getWineryBySlug = async (slug) => {
  try {
    const response = await api.get(`/wineries/slug/${slug}`)
    return response.data
  } catch (error) {
    console.error('Error fetching winery:', error)
    throw error
  }
}
