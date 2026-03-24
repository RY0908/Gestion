import { http, HttpResponse, delay } from 'msw'
import { decharges } from '../fixtures/decharges.fixtures.js'

export const dechargeHandlers = [
    http.get('/api/decharges', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const q = url.searchParams.get('q')?.toLowerCase()

        let filtered = [...decharges]
        if (status) filtered = filtered.filter(d => d.status === status)
        if (q) filtered = filtered.filter(d =>
            d.items.some(item =>
                item.designation.toLowerCase().includes(q) ||
                item.marque.toLowerCase().includes(q) ||
                item.serialNumber.toLowerCase().includes(q)
            ) ||
            d.partieCedante.nom.toLowerCase().includes(q) ||
            d.partieRecevante.nom.toLowerCase().includes(q) ||
            d.partieRecevante.structure?.toLowerCase().includes(q)
        )

        return HttpResponse.json({ data: filtered, total: filtered.length })
    }),

    http.get('/api/decharges/:id', async ({ params }) => {
        await delay(150)
        const dch = decharges.find(d => d.id === params.id)
        if (!dch) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: dch, success: true })
    }),

    http.post('/api/decharges', async ({ request }) => {
        await delay(400)
        const body = await request.json()
        const newDch = { ...body, id: crypto.randomUUID(), status: 'PENDING', createdAt: new Date().toISOString() }
        decharges.push(newDch)
        return HttpResponse.json({ data: newDch, success: true }, { status: 201 })
    }),

    http.patch('/api/decharges/:id/sign', async ({ params }) => {
        await delay(300)
        const idx = decharges.findIndex(d => d.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        decharges[idx].status = 'SIGNED'
        decharges[idx].dateSignature = new Date().toISOString()
        return HttpResponse.json({ data: decharges[idx], success: true })
    }),

    http.delete('/api/decharges/:id', async ({ params }) => {
        await delay(200)
        const idx = decharges.findIndex(d => d.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        decharges.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
