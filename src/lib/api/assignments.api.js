import { api } from './client.js'

export const fetchAssignments = (params = {}) => {
    const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    return api.get(`/assignments?${search}`)
}

export const fetchAssignment = (id) => api.get(`/assignments/${id}`)
export const createAssignment = (data) => api.post('/assignments', data)
export const updateAssignment = (id, data) => api.put(`/assignments/${id}`, data)
export const returnAssignment = (id, data) => api.patch(`/assignments/${id}/return`, data)
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`)
