import { users } from './users.fixtures.js'

export const audit = Array.from({ length: 20 }).map((_, index) => {
    const date = new Date()
    date.setHours(date.getHours() - index * 6)

    const actions = ['ASSET_CREATED', 'ASSET_ASSIGNED', 'LICENSE_PURCHASED', 'MAINTENANCE_SCHEDULED', 'REQUEST_APPROVED']
    const action = actions[index % actions.length]
    const performedBy = users[index % users.length]

    let description = ''
    if (action === 'ASSET_CREATED') description = 'Nouvel actif informatique ajouté à l\'inventaire'
    if (action === 'ASSET_ASSIGNED') description = `Actif affecté à ${users[(index + 1) % users.length].fullName}`
    if (action === 'LICENSE_PURCHASED') description = 'Nouvelle licence d\'entreprise acquise'
    if (action === 'MAINTENANCE_SCHEDULED') description = 'Intervention planifiée avec fournisseur'
    if (action === 'REQUEST_APPROVED') description = 'Demande de matériel informatique approuvée'

    return {
        id: `aud-${1000 + index}`,
        action,
        entityType: action.split('_')[0],
        entityId: `id-${index}`,
        description,
        performedBy,
        performedAt: date.toISOString(),
        changes: {}
    }
})
