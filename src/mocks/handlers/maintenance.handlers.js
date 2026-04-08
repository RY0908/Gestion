import { http, HttpResponse, delay } from 'msw'
import { maintenance } from '../fixtures/maintenance.fixtures.js'

export const maintenanceHandlers = [
    http.get('/api/maintenance', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const status = url.searchParams.get('status')

        let filtered = [...maintenance]
        if (status) filtered = filtered.filter(m => m.status === status)

        return HttpResponse.json({ data: filtered, total: filtered.length, page: 1, pageSize: 50, totalPages: 1 })
    }),

    http.get('/api/maintenance/:id', async ({ params }) => {
        await delay(150)
        const mte = maintenance.find(m => m.id === params.id)
        if (!mte) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: mte, success: true })
    }),

    http.post('/api/maintenance', async ({ request }) => {
        await delay(450)
        const body = await request.json()
        const newMte = { ...body, id: crypto.randomUUID(), status: 'SCHEDULED' }
        maintenance.unshift(newMte)
        return HttpResponse.json({ data: newMte, success: true }, { status: 201 })
    }),

    http.patch('/api/maintenance/:id', async ({ params, request }) => {
        await delay(300)
        const body = await request.json()
        const idx = maintenance.findIndex(m => m.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        maintenance[idx] = { ...maintenance[idx], ...body }
        return HttpResponse.json({ data: maintenance[idx], success: true })
    }),

    http.patch('/api/maintenance/:id/complete', async ({ params, request }) => {
        await delay(400)
        const body = await request.json()
        const idx = maintenance.findIndex(m => m.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })

        maintenance[idx].status = 'COMPLETED'
        maintenance[idx].endDate = new Date().toISOString()
        maintenance[idx].cost = body.cost || maintenance[idx].cost
        maintenance[idx].description = body.description || maintenance[idx].description

        return HttpResponse.json({ data: maintenance[idx], success: true })
    }),

    http.delete('/api/maintenance/:id', async ({ params }) => {
        await delay(200)
        const idx = maintenance.findIndex(m => m.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        maintenance.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
