import { http, HttpResponse, delay } from 'msw'
import { bonReceptions } from '../fixtures/bon-receptions.fixtures.js'

export const bonReceptionHandlers = [
    http.get('/api/bon-receptions', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const q = url.searchParams.get('q')?.toLowerCase()

        let filtered = [...bonReceptions]
        if (status) filtered = filtered.filter(br => br.status === status)
        if (q) filtered = filtered.filter(br =>
            br.receptionNumber.toLowerCase().includes(q) ||
            br.supplier.name.toLowerCase().includes(q) ||
            br.commandeNumber.toLowerCase().includes(q)
        )

        return HttpResponse.json({ data: filtered, total: filtered.length })
    }),

    http.get('/api/bon-receptions/:id', async ({ params }) => {
        await delay(150)
        const br = bonReceptions.find(b => b.id === params.id)
        if (!br) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: br, success: true })
    }),

    http.post('/api/bon-receptions', async ({ request }) => {
        await delay(400)
        const body = await request.json()
        const newBR = { ...body, id: crypto.randomUUID(), status: 'PENDING', createdAt: new Date().toISOString() }
        bonReceptions.push(newBR)
        return HttpResponse.json({ data: newBR, success: true }, { status: 201 })
    }),

    http.patch('/api/bon-receptions/:id/validate', async ({ params }) => {
        await delay(300)
        const idx = bonReceptions.findIndex(b => b.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        bonReceptions[idx].status = 'VALIDATED'
        return HttpResponse.json({ data: bonReceptions[idx], success: true })
    }),
]
