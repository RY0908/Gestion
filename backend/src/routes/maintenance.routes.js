import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'

const router = Router()

// GET /api/maintenance
router.get('/', async (req, res) => {
    try {
        const { status, assetId } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status)  { conditions.push(`m.statut = $${idx++}`);        params.push(status) }
        if (assetId) { conditions.push(`m.id_equipement = $${idx++}`); params.push(String(assetId).replace('ast-', '')) }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

        const { rows } = await pool.query(`
            SELECT m.id, m.type_maintenance, m.description_panne, m.date_debut, m.date_fin,
                   m.cout_reparation, m.technicien, m.pieces_utilisees, m.statut, m.date_creation,
                   e.id as eq_id, e.code_inventaire, e.categorie, e.marque, e.modele
            FROM maintenance m
            JOIN equipements e ON m.id_equipement = e.id
            ${where}
            ORDER BY m.date_creation DESC
        `, params)

        const data = rows.map(r => ({
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
            asset: { id: `ast-${r.eq_id}`, assetTag: r.code_inventaire, category: r.categorie, brand: r.marque, model: r.modele }
        }))

        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/maintenance
router.post('/', requireRole('ADMIN', 'SUPERVISOR', 'TECHNICIAN'), async (req, res) => {
    try {
        const { assetId, type, description, startDate, technician } = req.body
        const cleanAssetId = String(assetId).replace('ast-', '')

        const { rows } = await getPool().query(`
            INSERT INTO maintenance (id_equipement, type_maintenance, description_panne, date_debut, technicien, statut)
            VALUES ($1,$2,$3,$4,$5,'SCHEDULED') RETURNING id
        `, [cleanAssetId, type, description || null, startDate || new Date().toISOString().split('T')[0], technician || null])

        // Auto-set asset to IN_MAINTENANCE
        await getPool().query(`UPDATE equipements SET etat = 'IN_MAINTENANCE', date_modification = NOW() WHERE id = $1`, [cleanAssetId])

        await logAudit({ action: 'CREATE', entityType: 'MAINTENANCE', entityId: rows[0].id, description: `Ticket maintenance ouvert sur équipement ${cleanAssetId}`, userId: req.user?.id })
        res.status(201).json({ success: true, message: 'Ticket de maintenance créé.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/maintenance/:id
router.patch('/:id', requireRole('ADMIN', 'SUPERVISOR', 'TECHNICIAN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('mnt-', '')
        const { status, endDate, cost, partsUsed, technician } = req.body
        const pool = getPool()

        const prev = await pool.query('SELECT id_equipement, statut FROM maintenance WHERE id = $1', [cleanId])
        if (!prev.rows.length) return res.status(404).json({ success: false, message: 'Ticket introuvable.' })

        await pool.query(`
            UPDATE maintenance SET
                statut = COALESCE($1, statut),
                date_fin = COALESCE($2, date_fin),
                cout_reparation = COALESCE($3, cout_reparation),
                pieces_utilisees = COALESCE($4, pieces_utilisees),
                technicien = COALESCE($5, technicien)
            WHERE id = $6
        `, [status || null, endDate || null, cost || null, partsUsed || null, technician || null, cleanId])

        // If completed, put asset back IN_STOCK
        if (status === 'COMPLETED') {
            await pool.query(`UPDATE equipements SET etat = 'IN_STOCK', date_modification = NOW() WHERE id = $1`, [prev.rows[0].id_equipement])
        }

        await logAudit({ action: 'UPDATE', entityType: 'MAINTENANCE', entityId: Number(cleanId), description: `Ticket maintenance mis à jour: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, message: 'Ticket mis à jour.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/maintenance/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('mnt-', '')
        await getPool().query('DELETE FROM maintenance WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'MAINTENANCE', entityId: Number(cleanId), description: `Ticket maintenance supprimé: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
