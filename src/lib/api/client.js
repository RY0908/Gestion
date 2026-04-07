import { useAuthStore } from '@/store/authStore.js'

const BASE_URL = '/api'

/**
 * Base fetch wrapper with error handling
 * @param {string} endpoint
 * @param {RequestInit} options
 */
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`
    
    // Inject Authorization header if token exists
    const token = useAuthStore.getState().token
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(url, {
        ...options,
        headers,
    })
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Erreur réseau' }))
        throw new Error(error.message || `HTTP ${res.status}`)
    }
    return res.json()
}

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

