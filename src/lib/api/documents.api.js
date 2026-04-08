import { api } from './client.js'

const unwrap = (res) => res?.data ?? []

export const documentsApi = {
    getAll: (params = {}) => {
        const search = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
        return api.get(`/documents${search.toString() ? `?${search}` : ''}`)
    },
    getById: (id) => api.get(`/documents/${id}`),
    createArchive: (payload) => api.post('/documents', payload),
    update: (id, payload) => api.patch(`/documents/${id}`, payload),
    updateStatus: (id, status) => api.patch(`/documents/${id}/status`, { status }),
    delete: (id) => api.delete(`/documents/${id}`),
    getPurchaseOrders: async () => unwrap(await api.get('/documents/purchase-orders')),
    getBonReceptions: async () => unwrap(await api.get('/documents/bon-receptions')),
    getDecharges: async () => unwrap(await api.get('/documents/decharges')),
}
