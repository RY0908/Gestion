import { http, HttpResponse, delay } from 'msw'
import { purchaseOrders } from '../fixtures/purchase-orders.fixtures.js'

export const purchaseOrderHandlers = [
    http.get('/api/purchase-orders', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const q = url.searchParams.get('q')?.toLowerCase()

        let filtered = [...purchaseOrders]
        if (status) filtered = filtered.filter(po => po.status === status)
        if (q) filtered = filtered.filter(po =>
            po.orderNumber.toLowerCase().includes(q) ||
            po.supplier.name.toLowerCase().includes(q) ||
            po.items.some(item => item.designation.toLowerCase().includes(q))
        )

        return HttpResponse.json({ data: filtered, total: filtered.length })
    }),

    http.get('/api/purchase-orders/:id', async ({ params }) => {
        await delay(150)
        const po = purchaseOrders.find(p => p.id === params.id)
        if (!po) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: po, success: true })
    }),

    http.post('/api/purchase-orders', async ({ request }) => {
        await delay(400)
        const body = await request.json()
        const newPO = { ...body, id: crypto.randomUUID(), status: 'PENDING', createdAt: new Date().toISOString() }
        purchaseOrders.push(newPO)
        return HttpResponse.json({ data: newPO, success: true }, { status: 201 })
    }),

    http.put('/api/purchase-orders/:id', async ({ params, request }) => {
        await delay(300)
        const body = await request.json()
        const idx = purchaseOrders.findIndex(p => p.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        purchaseOrders[idx] = { ...purchaseOrders[idx], ...body }
        return HttpResponse.json({ data: purchaseOrders[idx], success: true })
    }),

    http.delete('/api/purchase-orders/:id', async ({ params }) => {
        await delay(200)
        const idx = purchaseOrders.findIndex(p => p.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        purchaseOrders.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
