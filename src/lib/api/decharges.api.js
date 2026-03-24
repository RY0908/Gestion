import { apiClient } from './client.js'

export const dechargesApi = {
    getAll: (params = {}) => apiClient.get('/api/decharges', { params }),
    getById: (id) => apiClient.get(`/api/decharges/${id}`),
    create: (data) => apiClient.post('/api/decharges', data),
    sign: (id) => apiClient.patch(`/api/decharges/${id}/sign`),
    delete: (id) => apiClient.delete(`/api/decharges/${id}`),
}
