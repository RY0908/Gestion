import { api } from './client.js'

export const fetchRequests = (params = {}) => {
    const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    return api.get(`/requests?${search}`)
}

export const fetchRequest = (id) => api.get(`/requests/${id}`)
export const createRequest = (data) => api.post('/requests', data)
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data)
export const deleteRequest = (id) => api.delete(`/requests/${id}`)
export const approveRequest = (id, data) => api.patch(`/requests/${id}/approve`, data)
export const rejectRequest = (id, data) => api.patch(`/requests/${id}/reject`, data)
