import { api } from './client.js'

export const notificationsApi = {
    getAll: () => api.get('/notifications'),
}
