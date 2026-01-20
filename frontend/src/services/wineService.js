import api from './api'

/**
 * Wine API service
 */

export const getWines = async (params = {}) => {
  try {
    const response = await api.get('/wines/', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching wines:', error)
    throw error
  }
}

export const getWineById = async (id) => {
  try {
    const response = await api.get(`/wines/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching wine:', error)
    throw error
  }
}

export const getVarieties = async () => {
  try {
    const response = await api.get('/wines/varieties/list')
    return response.data
  } catch (error) {
    console.error('Error fetching varieties:', error)
    throw error
  }
}

export const getVintages = async () => {
  try {
    const response = await api.get('/wines/vintages/list')
    return response.data
  } catch (error) {
    console.error('Error fetching vintages:', error)
    throw error
  }
}
