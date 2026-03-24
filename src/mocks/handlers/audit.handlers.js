import { http, HttpResponse, delay } from 'msw'
import { audit } from '../fixtures/audit.fixtures.js'

export const auditHandlers = [
    http.get('/api/audit', async ({ request }) => {
        await delay(300)

        // Just return top 10 for dashboard
        return HttpResponse.json({ data: audit.slice(0, 10), total: audit.length, page: 1, pageSize: 10, totalPages: Math.ceil(audit.length / 10) })
    }),
]
