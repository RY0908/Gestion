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
const STATUSES = ['PENDING', 'ASSIGNED', 'RESOLVED']

export const requests = Array.from({ length: 20 }).map((_, index) => {
    // Users create requests (roles: USER), let's assign index 0 and 1 to Ahmed Boudiaf (Admin) for testing
    let requestedBy = users.find(u => u.role === 'USER' && u.id === `usr-${1010 + (index % 10)}`) || users[15]
    if (index === 0 || index === 1) {
        requestedBy = users.find(u => u.id === 'usr-1') || requestedBy; // Ahmed Boudiaf
    }
    const status = STATUSES[index % STATUSES.length]
    const priority = PRIORITIES[index % PRIORITIES.length]
    const requestedFor = requestedBy

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - (index * 2))

    let assignedTo = null;
    let assignedBy = null;
    let resolvedAt = null;

    if (['ASSIGNED', 'RESOLVED'].includes(status)) {
        // Find a technician
        assignedTo = users.find(u => u.role === 'TECHNICIAN');
        // Find a supervisor
        assignedBy = users.find(u => u.role === 'SUPERVISOR');
    }

    if (status === 'RESOLVED') {
        resolvedAt = new Date(createdAt.getTime() + 86400000).toISOString();
    }

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
        assignedTo,
        assignedBy,
        resolvedAt,
        notes: status === 'RESOLVED' ? 'Intervention terminée avec succès' : null,
        fulfilledWithAsset: null
    }
})
