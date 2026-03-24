import { users } from './users.fixtures.js'
import { assets } from './assets.fixtures.js'
import { DEPARTMENTS } from './departments.fixtures.js'

export const assignments = []

assets.forEach((asset) => {
    if (asset.assignedTo && asset.assignedAt) {
        assignments.push({
            id: `asg-active-${asset.id}`,
            asset,
            assignedTo: asset.assignedTo,
            assignedBy: users.find(u => u.role === 'IT_MANAGER') || users[0],
            assignedAt: asset.assignedAt,
            returnedAt: null,
            expectedReturn: new Date(new Date(asset.assignedAt).getTime() + 86400000 * 365).toISOString(),
            reason: 'Matériel de fonction',
            status: 'ACTIVE',
            returnCondition: null,
            returnNotes: null
        })
    }
})

// Add some historical ones
for (let i = 0; i < 10; i++) {
    const asset = assets[i]
    const returnedAt = new Date()
    returnedAt.setMonth(returnedAt.getMonth() - i - 1)

    assignments.push({
        id: `asg-hist-${i}`,
        asset,
        assignedTo: users[(i + 5) % users.length],
        assignedBy: users.find(u => u.role === 'IT_MANAGER') || users[0],
        assignedAt: new Date(returnedAt.getTime() - 86400000 * 180).toISOString(),
        returnedAt: returnedAt.toISOString(),
        expectedReturn: new Date(returnedAt.getTime() + 86400000 * 10).toISOString(),
        reason: 'Projet temporaire',
        status: 'RETURNED',
        returnCondition: 'GOOD',
        returnNotes: 'RAS'
    })
}
