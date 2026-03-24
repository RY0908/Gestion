import { apiClient } from './client.js'

export const purchaseOrdersApi = {
    getAll: (params = {}) => apiClient.get('/api/purchase-orders', { params }),
    getById: (id) => apiClient.get(`/api/purchase-orders/${id}`),
    create: (data) => apiClient.post('/api/purchase-orders', data),
    update: (id, data) => apiClient.put(`/api/purchase-orders/${id}`, data),
    delete: (id) => apiClient.delete(`/api/purchase-orders/${id}`),
}
