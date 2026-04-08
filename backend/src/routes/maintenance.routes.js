import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function mapMaintenanceRow(r) {
    return {
        id: `mnt-${r.id}`,
        type: r.type_maintenance,
        description: r.description_panne,
        startDate: r.date_debut,
        endDate: r.date_fin,
        cost: r.cout_reparation,
        technician: r.technicien,
        partsUsed: r.pieces_utilisees,
        status: r.statut,
        createdAt: r.date_creation,
        sourceRequest: r.req_id ? {
            id: `req-${r.req_id}`,
            requestNumber: r.req_num_demande,
            status: r.req_statut,
        } : null,
        asset: {
            id: `ast-${r.eq_id}`,
            assetTag: r.code_inventaire,
            category: r.categorie,
            brand: r.marque,
            model: r.modele,
        },
    }
}

function maintenanceSelect(whereClause = '') {
    return `
        SELECT m.id, m.type_maintenance, m.description_panne, m.date_debut, m.date_fin,
               m.cout_reparation, m.technicien, m.pieces_utilisees, m.statut, m.date_creation,
               e.id as eq_id, e.code_inventaire, e.categorie, e.marque, e.modele,
               d.id as req_id, d.num_demande as req_num_demande, d.statut as req_statut
        FROM maintenance m
        JOIN equipements e ON m.id_equipement = e.id
        LEFT JOIN demandes d ON m.id_demande = d.id
        ${whereClause}
        ORDER BY m.date_creation DESC
    `
}

async function updateMaintenanceRecord(req, res, { complete = false } = {}) {
    const cleanId = parsePrefixedId(req.params.id, 'mnt')
    if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de maintenance invalide.' })

    const { status, endDate, cost, partsUsed, technician } = req.body
    const pool = getPool()

    const prev = await pool.query('SELECT id_equipement FROM maintenance WHERE id = $1', [cleanId])
    if (!prev.rows.length) return res.status(404).json({ success: false, message: 'Ticket introuvable.' })

    const nextStatus = complete ? 'COMPLETED' : (status || null)

    await pool.query(
        `UPDATE maintenance SET
            statut = COALESCE($1, statut),
            date_fin = COALESCE($2, date_fin),
            cout_reparation = COALESCE($3, cout_reparation),
            pieces_utilisees = COALESCE($4, pieces_utilisees),
            technicien = COALESCE($5, technicien)
         WHERE id = $6`,
        [nextStatus, endDate || null, cost || null, partsUsed || null, technician || null, cleanId]
    )

    if (nextStatus === 'COMPLETED') {
        await pool.query(`UPDATE equipements SET etat = 'IN_STOCK', date_modification = NOW() WHERE id = $1`, [prev.rows[0].id_equipement])
    }

    await logAudit({
        action: 'UPDATE',
        entityType: 'MAINTENANCE',
        entityId: Number(cleanId),
        description: complete
            ? `Ticket maintenance cloture: ${cleanId}`
            : `Ticket maintenance mis a jour: ${cleanId}`,
        userId: req.user?.id,
    })

    const { rows } = await pool.query(maintenanceSelect('WHERE m.id = $1'), [cleanId])
    return res.json({
        success: true,
        data: mapMaintenanceRow(rows[0]),
        message: complete ? 'Ticket cloture.' : 'Ticket mis a jour.',
    })
}

// GET /api/maintenance
router.get('/', async (req, res) => {
    try {
        const { status, assetId } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status) {
            conditions.push(`m.statut = $${idx++}`)
            params.push(status)
        }
        if (assetId) {
            const cleanAssetId = parsePrefixedId(assetId, 'ast')
            if (!cleanAssetId) return res.status(400).json({ success: false, message: 'Identifiant equipement invalide.' })
            conditions.push(`m.id_equipement = $${idx++}`)
            params.push(cleanAssetId)
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
        const { rows } = await pool.query(maintenanceSelect(where), params)
        res.json({ data: rows.map(mapMaintenanceRow), success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'mnt')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de maintenance invalide.' })
        const { rows } = await getPool().query(maintenanceSelect('WHERE m.id = $1'), [cleanId])
        if (!rows.length) return res.status(404).json({ success: false, message: 'Ticket introuvable.' })
        res.json({ success: true, data: mapMaintenanceRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/maintenance
router.post('/', requireRole('ADMIN', 'SUPERVISOR', 'TECHNICIAN'), async (req, res) => {
    try {
        const { assetId, type, description, startDate, technician, requestId } = req.body
        const cleanAssetId = parsePrefixedId(assetId, 'ast')
        if (!cleanAssetId) return res.status(400).json({ success: false, message: 'Identifiant equipement invalide.' })
        const cleanRequestId = requestId ? parsePrefixedId(requestId, 'req') : null

        const assetExists = await getPool().query('SELECT id FROM equipements WHERE id = $1', [cleanAssetId])
        if (!assetExists.rows.length) return res.status(404).json({ success: false, message: 'Equipement introuvable.' })
        if (cleanRequestId) {
            const requestExists = await getPool().query('SELECT id FROM demandes WHERE id = $1', [cleanRequestId])
            if (!requestExists.rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })
        }

        const { rows } = await getPool().query(
            `INSERT INTO maintenance (id_equipement, type_maintenance, description_panne, date_debut, technicien, statut, id_demande)
             VALUES ($1,$2,$3,$4,$5,'SCHEDULED',$6) RETURNING id`,
            [cleanAssetId, type, description || null, startDate || new Date().toISOString().split('T')[0], technician || null, cleanRequestId]
        )

        await getPool().query(
            `UPDATE equipements SET etat = 'IN_MAINTENANCE', date_modification = NOW() WHERE id = $1`,
            [cleanAssetId]
        )

        await logAudit({
            action: 'CREATE',
            entityType: 'MAINTENANCE',
            entityId: rows[0].id,
            description: `Ticket maintenance ouvert sur equipement ${cleanAssetId}`,
            userId: req.user?.id,
        })

        const { rows: createdRows } = await getPool().query(maintenanceSelect('WHERE m.id = $1'), [rows[0].id])
        res.status(201).json({ success: true, data: mapMaintenanceRow(createdRows[0]), message: 'Ticket de maintenance cree.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/maintenance/:id
router.patch('/:id', requireRole('ADMIN', 'SUPERVISOR', 'TECHNICIAN'), async (req, res) => {
    try {
        await updateMaintenanceRecord(req, res)
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PUT /api/maintenance/:id - compatibility alias for older clients
router.put('/:id', requireRole('ADMIN', 'SUPERVISOR', 'TECHNICIAN'), async (req, res) => {
    try {
        await updateMaintenanceRecord(req, res)
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/maintenance/:id/complete
router.patch('/:id/complete', requireRole('ADMIN', 'SUPERVISOR', 'TECHNICIAN'), async (req, res) => {
    try {
        await updateMaintenanceRecord(req, res, { complete: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/maintenance/:id
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'mnt')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de maintenance invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM maintenance WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Ticket introuvable.' })
        await pool.query('DELETE FROM maintenance WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'MAINTENANCE', entityId: Number(cleanId), description: `Ticket maintenance supprime: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
