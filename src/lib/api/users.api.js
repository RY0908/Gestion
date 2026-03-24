import { api } from './client.js'

export const fetchUsers = (params = {}) => {
    const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    return api.get(`/users?${search}`)
}

export const fetchUser = (id) => api.get(`/users/${id}`)
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
