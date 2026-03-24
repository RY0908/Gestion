import { http, HttpResponse, delay } from 'msw'
import { users } from '../fixtures/users.fixtures.js'

export const userHandlers = [
    http.get('/api/users', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
        const q = url.searchParams.get('q')?.toLowerCase()

        let filtered = [...users]
        if (q) {
            filtered = filtered.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        }

        const total = filtered.length
        const data = filtered.slice((page - 1) * pageSize, page * pageSize)
        return HttpResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
    }),

    http.get('/api/users/:id', async ({ params }) => {
        await delay(150)
        const user = users.find(u => u.id === params.id)
        if (!user) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: user, success: true })
    }),

    http.post('/api/users', async ({ request }) => {
        await delay(400)
        const body = await request.json()
        const newUser = { ...body, id: crypto.randomUUID() }
        users.push(newUser)
        return HttpResponse.json({ data: newUser, success: true }, { status: 201 })
    }),

    http.put('/api/users/:id', async ({ params, request }) => {
        await delay(350)
        const body = await request.json()
        const idx = users.findIndex(u => u.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        users[idx] = { ...users[idx], ...body }
        return HttpResponse.json({ data: users[idx], success: true })
    }),

    http.delete('/api/users/:id', async ({ params }) => {
        await delay(250)
        const idx = users.findIndex(u => u.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        users.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
