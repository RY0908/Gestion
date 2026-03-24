import { users } from './users.fixtures.js'

const CATEGORIES = ['LAPTOP', 'DESKTOP', 'MONITOR', 'SMARTPHONE', 'PERIPHERAL']
const JUSTIFICATIONS = [
    'Nouvelle recrue',
    'Remplacement matériel obsolète',
    'Besoin de deuxième écran pour télétravail',
    'Téléphone cassé',
    "Besoin de puissance pour exécution de modèles IA"
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED']

export const requests = Array.from({ length: 20 }).map((_, index) => {
    const requestedBy = users[index % users.length]
    const status = STATUSES[index % STATUSES.length]
    const priority = PRIORITIES[index % PRIORITIES.length]
    const requestedFor = (index % 5 === 0) ? users[(index + 1) % users.length] : requestedBy

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - (index * 2))

    return {
        id: `req-${1000 + index}`,
        requestNumber: `REQ-2024-${String(156 + index).padStart(4, '0')}`,
        requestedBy,
        requestedFor,
        assetCategory: CATEGORIES[index % CATEGORIES.length],
        justification: JUSTIFICATIONS[index % JUSTIFICATIONS.length],
        priority,
        status,
        createdAt: createdAt.toISOString(),
        reviewedBy: status !== 'PENDING' && status !== 'CANCELLED' ? (users.find(u => u.role === 'IT_MANAGER') || users[0]) : null,
        reviewedAt: status !== 'PENDING' && status !== 'CANCELLED' ? new Date(createdAt.getTime() + 86400000).toISOString() : null,
        reviewNotes: status === 'REJECTED' ? 'Budget indisponible' : (status === 'APPROVED' ? 'OK pour commande' : null),
        fulfilledWithAsset: null // In real app, links to asset when FULFILLED
    }
})
