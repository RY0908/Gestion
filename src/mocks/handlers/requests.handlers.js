import { http, HttpResponse, delay } from 'msw'
import { requests } from '../fixtures/requests.fixtures.js'
import { assets } from '../fixtures/assets.fixtures.js'

export const requestHandlers = [
    http.get('/api/requests', async ({ request }) => {
        await delay(350)
        const url = new URL(request.url)
        const status = url.searchParams.get('status')

        let filtered = [...requests]
        if (status) filtered = filtered.filter(r => r.status === status)

        return HttpResponse.json({ data: filtered, total: filtered.length, page: 1, pageSize: 50, totalPages: 1 })
    }),

    http.get('/api/requests/:id', async ({ params }) => {
        await delay(150)
        const req = requests.find(r => r.id === params.id)
        if (!req) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: req, success: true })
    }),

    http.post('/api/requests', async ({ request }) => {
        await delay(500)
        const body = await request.json()
        const newReq = { ...body, id: crypto.randomUUID(), status: 'PENDING', requestNumber: `REQ-2024-${Math.floor(Math.random() * 9000) + 1000}` }
        requests.unshift(newReq)
        return HttpResponse.json({ data: newReq, success: true }, { status: 201 })
    }),

    http.put('/api/requests/:id', async ({ params, request }) => {
        await delay(300)
        const body = await request.json()
        const idx = requests.findIndex(r => r.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        requests[idx] = { ...requests[idx], ...body }
        return HttpResponse.json({ data: requests[idx], success: true })
    }),

    http.patch('/api/requests/:id/assign', async ({ params, request }) => {
        await delay(450)
        const body = await request.json()
        const idx = requests.findIndex(r => r.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })

        requests[idx].status = 'ASSIGNED'
        // Mock finding the user
        const { users } = await import('../fixtures/users.fixtures.js')
        const technician = users.find(u => u.id === body.assignedToId)
        if (technician) requests[idx].assignedTo = technician;

        return HttpResponse.json({ data: requests[idx], success: true })
    }),

    http.patch('/api/requests/:id/resolve', async ({ params, request }) => {
        await delay(450)
        const body = await request.json()
        const idx = requests.findIndex(r => r.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })

        requests[idx].status = 'RESOLVED'
        requests[idx].resolvedAt = new Date().toISOString()
        requests[idx].notes = body.notes

        return HttpResponse.json({ data: requests[idx], success: true })
    }),

    http.delete('/api/requests/:id', async ({ params }) => {
        await delay(200)
        const idx = requests.findIndex(r => r.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        requests.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
