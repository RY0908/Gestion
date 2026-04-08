import { api } from './client.js'

export const authApi = {
    login: (payload) => api.post('/auth/login', payload),
    logout: () => api.post('/auth/logout', {}),
    me: () => api.get('/auth/me'),
}
