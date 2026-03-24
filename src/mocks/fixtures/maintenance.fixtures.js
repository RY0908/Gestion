import { assets } from './assets.fixtures.js'

const TYPES = ['PREVENTIVE', 'CORRECTIVE', 'UPGRADE', 'INSPECTION']
const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const DESCRIPTIONS = [
    'Nettoyage interne et remplacement pâte thermique',
    'Mise à jour RAM de 8Go à 16Go',
    'Remplacement disque dur HDD par SSD',
    'Réparation écran défectueux',
    "Inspection annuelle d'onduleur",
    'Changement batterie défaillante'
]

export const maintenance = Array.from({ length: 15 }).map((_, index) => {
    const asset = assets[index % assets.length]
    const type = TYPES[index % TYPES.length]
    let status = STATUSES[index % STATUSES.length]
    if (asset.status === 'IN_MAINTENANCE') status = 'IN_PROGRESS'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (index * 5))

    const endDate = status === 'COMPLETED' ? new Date(startDate.getTime() + 86400000 * 2) : null

    return {
        id: `mte-${1000 + index}`,
        asset,
        type,
        description: DESCRIPTIONS[index % DESCRIPTIONS.length],
        technicianName: 'Tech Externe CEVITAL IT',
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        cost: (index % 3 === 0) ? 0 : 5000 + (Math.random() * 20000), // Some under warranty
        status,
        nextMaintenanceDate: type === 'PREVENTIVE' ? new Date(startDate.getTime() + 86400000 * 180).toISOString() : null
    }
})
