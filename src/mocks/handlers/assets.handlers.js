import { http, HttpResponse, delay } from 'msw'
import { assets } from '../fixtures/assets.fixtures.js'

export const assetHandlers = [
    http.get('/api/assets', async ({ request }) => {
        await delay(350)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
        const status = url.searchParams.get('status')
        const category = url.searchParams.get('category')
        const q = url.searchParams.get('q')?.toLowerCase()

        let filtered = [...assets]
        if (status) filtered = filtered.filter(a => a.status === status)
        if (category) filtered = filtered.filter(a => a.category === category)
        if (q) filtered = filtered.filter(a =>
            a.assetTag.toLowerCase().includes(q) ||
            a.serialNumber.toLowerCase().includes(q) ||
            a.model.toLowerCase().includes(q) ||
            a.brand.toLowerCase().includes(q)
        )

        const total = filtered.length
        const data = filtered.slice((page - 1) * pageSize, page * pageSize)
        return HttpResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
    }),

    http.get('/api/assets/:id', async ({ params }) => {
        await delay(150)
        const asset = assets.find(a => a.id === params.id)
        if (!asset) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: asset, success: true })
    }),

    http.post('/api/assets', async ({ request }) => {
        await delay(500)
        const body = await request.json()
        const newAsset = {
            ...body,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        assets.push(newAsset)
        return HttpResponse.json({ data: newAsset, success: true, message: 'Actif créé avec succès' }, { status: 201 })
    }),

    http.put('/api/assets/:id', async ({ params, request }) => {
        await delay(350)
        const body = await request.json()
        const idx = assets.findIndex(a => a.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        assets[idx] = { ...assets[idx], ...body, updatedAt: new Date().toISOString() }
        return HttpResponse.json({ data: assets[idx], success: true })
    }),

    http.patch('/api/assets/:id/retire', async ({ params }) => {
        await delay(300)
        const idx = assets.findIndex(a => a.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        assets[idx].status = 'RETIRED'
        assets[idx].updatedAt = new Date().toISOString()
        return HttpResponse.json({ data: assets[idx], success: true })
    }),

    http.delete('/api/assets/:id', async ({ params }) => {
        await delay(250)
        const idx = assets.findIndex(a => a.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        assets.splice(idx, 1)
        return HttpResponse.json({ success: true, message: 'Actif supprimé' })
    }),
]
