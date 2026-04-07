import { http, HttpResponse, delay } from 'msw'
import { assignments } from '../fixtures/assignments.fixtures.js'

export const assignmentHandlers = [
    http.get('/api/assignments', async ({ request }) => {
        await delay(350)
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const userId = url.searchParams.get('userId')
        const page = Number(url.searchParams.get('page') ?? 1)
        const pageSize = Number(url.searchParams.get('pageSize') ?? 20)

        let filtered = [...assignments]
        if (status) filtered = filtered.filter(a => a.status === status)
        if (userId) filtered = filtered.filter(a =>
            a.assignedTo?.id === userId ||
            a.assignedTo === userId
        )

        const total = filtered.length
        const data = filtered.slice((page - 1) * pageSize, page * pageSize)
        return HttpResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
    }),

    http.get('/api/assignments/:id', async ({ params }) => {
        await delay(150)
        const assignment = assignments.find(a => a.id === params.id)
        if (!assignment) return new HttpResponse(null, { status: 404 })
        return HttpResponse.json({ data: assignment, success: true })
    }),

    http.post('/api/assignments', async ({ request }) => {
        await delay(400)
        const body = await request.json()
        const newAssignment = { ...body, id: crypto.randomUUID(), status: 'ACTIVE' }
        assignments.unshift(newAssignment)
        return HttpResponse.json({ data: newAssignment, success: true }, { status: 201 })
    }),

    http.put('/api/assignments/:id', async ({ params, request }) => {
        await delay(300)
        const body = await request.json()
        const idx = assignments.findIndex(a => a.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        assignments[idx] = { ...assignments[idx], ...body }
        return HttpResponse.json({ data: assignments[idx], success: true })
    }),

    http.patch('/api/assignments/:id/return', async ({ params, request }) => {
        await delay(350)
        const body = await request.json()
        const idx = assignments.findIndex(a => a.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })

        assignments[idx].status = 'RETURNED'
        assignments[idx].returnedAt = new Date().toISOString()
        assignments[idx].returnCondition = body.returnCondition
        assignments[idx].returnNotes = body.returnNotes

        return HttpResponse.json({ data: assignments[idx], success: true })
    }),

    http.delete('/api/assignments/:id', async ({ params }) => {
        await delay(200)
        const idx = assignments.findIndex(a => a.id === params.id)
        if (idx === -1) return new HttpResponse(null, { status: 404 })
        assignments.splice(idx, 1)
        return HttpResponse.json({ success: true })
    }),
]
