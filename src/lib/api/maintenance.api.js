import { api } from './client.js'

export const fetchMaintenances = (params = {}) => {
    const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    return api.get(`/maintenance?${search}`)
}

export const fetchMaintenance = (id) => api.get(`/maintenance/${id}`)
export const createMaintenance = (data) => api.post('/maintenance', data)
export const updateMaintenance = (id, data) => api.put(`/maintenance/${id}`, data)
export const completeMaintenance = (id, data) => api.patch(`/maintenance/${id}/complete`, data)
export const deleteMaintenance = (id) => api.delete(`/maintenance/${id}`)
