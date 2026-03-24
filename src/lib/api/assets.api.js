import { api } from './client.js'

export const fetchAssets = (params = {}) => {
    const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    return api.get(`/assets?${search}`)
}

export const fetchAsset = (id) => api.get(`/assets/${id}`)
export const createAsset = (data) => api.post('/assets', data)
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data)
export const deleteAsset = (id) => api.delete(`/assets/${id}`)
export const retireAsset = (id) => api.patch(`/assets/${id}/retire`)
