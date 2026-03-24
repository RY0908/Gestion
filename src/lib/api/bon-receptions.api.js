import { apiClient } from './client.js'

export const bonReceptionsApi = {
    getAll: (params = {}) => apiClient.get('/api/bon-receptions', { params }),
    getById: (id) => apiClient.get(`/api/bon-receptions/${id}`),
    create: (data) => apiClient.post('/api/bon-receptions', data),
    update: (id, data) => apiClient.put(`/api/bon-receptions/${id}`, data),
    validate: (id) => apiClient.patch(`/api/bon-receptions/${id}/validate`),
}
