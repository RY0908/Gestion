import { http, HttpResponse, delay } from 'msw'
import { licenses } from '../fixtures/licenses.fixtures.js'

export const licenseHandlers = [
    http.get('/api/licenses', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const complianceStatus = url.searchParams.get('complianceStatus')

        let filtered = [...licenses]
        if (complianceStatus) {
            filtered = filtered.filter(l => l.complianceStatus === complianceStatus)
        }

        return HttpResponse.json({ data: filtered, total: filtered.length, page: 1, pageSize: 100, totalPages: 1 })
    }),

    http.get('/api/licenses/:id', async ({ params }) => {
        await delay(150)
        const license = licenses.find(l => l.id === params.id)
        if (!license) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: license, success: true })
    }),

    http.post('/api/licenses', async ({ request }) => {
        await delay(400)
        const body = await request.json()
        const newLicense = { ...body, id: crypto.randomUUID(), complianceStatus: 'COMPLIANT' }
        licenses.unshift(newLicense)
        return HttpResponse.json({ data: newLicense, success: true }, { status: 201 })
    }),

    http.put('/api/licenses/:id', async ({ params, request }) => {
        await delay(350)
        const body = await request.json()
        const idx = licenses.findIndex(l => l.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        licenses[idx] = { ...licenses[idx], ...body }
        return HttpResponse.json({ data: licenses[idx], success: true })
    }),

    http.delete('/api/licenses/:id', async ({ params }) => {
        await delay(250)
        const idx = licenses.findIndex(l => l.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        licenses.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
