import { http, HttpResponse, delay } from 'msw'
import { users } from '../fixtures/users.fixtures.js'

export const authHandlers = [
    http.post('/api/auth/login', async ({ request }) => {
        await delay(400)
        const body = await request.json().catch(() => ({}))
        const { email, password } = body
        
        const user = users.find(u => u.email === email)
        
        if (!user || password !== 'sigma2024') {
            return HttpResponse.json({ success: false, message: 'Identifiants invalides' }, { status: 401 })
        }
        
        return HttpResponse.json({ 
            success: true, 
            user, 
            token: `mock-jwt-token-for-${user.id}` 
        })
    }),

    http.get('/api/auth/me', async ({ request }) => {
        await delay(300)
        const auth = request.headers.get('Authorization')
        if (!auth) {
            return HttpResponse.json({ success: false }, { status: 401 })
        }
        // Extract id from mock-jwt-token-for-usr-X
        const id = auth.split('-').pop()
        const user = users.find(u => u.id === `usr-${id}`) || users[0]
        
        return HttpResponse.json({ success: true, data: user })
    }),

    http.post('/api/auth/logout', async () => {
        await delay(200)
        return HttpResponse.json({ success: true })
    })
]
