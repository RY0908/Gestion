import { api } from './client.js'

export const fetchLicenses = (params = {}) => {
    const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    return api.get(`/licenses?${search}`)
}

export const fetchLicense = (id) => api.get(`/licenses/${id}`)
export const createLicense = (data) => api.post('/licenses', data)
export const updateLicense = (id, data) => api.put(`/licenses/${id}`, data)
export const deleteLicense = (id) => api.delete(`/licenses/${id}`)
