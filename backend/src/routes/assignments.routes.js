import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'

const router = Router()

// GET /api/assignments
router.get('/', async (req, res) => {
    try {
        const { status, employeeId } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status)     { conditions.push(`a.statut = $${idx++}`);      params.push(status) }
        if (employeeId) { conditions.push(`a.id_employe = $${idx++}`);  params.push(String(employeeId).replace('usr-', '')) }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

        const { rows } = await pool.query(`
            SELECT a.id, a.date_affectation, a.date_retour, a.motif, a.statut, a.condition_retour, a.notes_retour, a.date_creation,
                   e.id as eq_id, e.code_inventaire, e.categorie, e.marque, e.modele, e.etat as eq_etat,
                   emp.id as emp_id, emp.nom_complet, emp.poste_occupe, emp.structure,
                   att.id as att_id, att.nom_complet as att_nom
            FROM affectations a
            JOIN equipements e ON a.id_equipement = e.id
            JOIN employes emp ON a.id_employe = emp.id
            LEFT JOIN employes att ON a.id_attribue_par = att.id
            ${where}
            ORDER BY a.date_creation DESC
        `, params)

        const data = rows.map(r => ({
            id: `aff-${r.id}`,
            assignmentDate: r.date_affectation,
            returnDate: r.date_retour,
            reason: r.motif,
            status: r.statut,
            returnCondition: r.condition_retour,
            returnNotes: r.notes_retour,
            createdAt: r.date_creation,
            asset: { id: `ast-${r.eq_id}`, assetTag: r.code_inventaire, category: r.categorie, brand: r.marque, model: r.modele, status: r.eq_etat },
            employee: { id: `emp-${r.emp_id}`, fullName: r.nom_complet, position: r.poste_occupe, structure: r.structure },
            assignedBy: r.att_id ? { id: `emp-${r.att_id}`, fullName: r.att_nom } : null,
        }))

        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/assignments — SUPERVISOR, ADMIN
router.post('/', requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const { assetId, employeeId, reason, assignmentDate } = req.body
        const pool = getPool()
        const cleanAssetId  = String(assetId).replace('ast-', '')
        const cleanEmpId    = String(employeeId).replace(/^(emp|usr)-/, '')

        // RG04: enforce one active assignment per asset
        const existing = await pool.query(
            'SELECT id FROM affectations WHERE id_equipement = $1 AND statut = $2',
            [cleanAssetId, 'ACTIVE']
        )
        if (existing.rows.length > 0)
            return res.status(409).json({ success: false, message: 'Équipement déjà affecté à un employé actif.' })

        // Find assigner employee record
        const assignerRes = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
        const assignerId  = assignerRes.rows[0]?.id || null

        const { rows } = await pool.query(`
            INSERT INTO affectations (date_affectation, id_equipement, id_employe, id_attribue_par, motif, statut)
            VALUES ($1,$2,$3,$4,$5,'ACTIVE') RETURNING id
        `, [assignmentDate || new Date().toISOString().split('T')[0], cleanAssetId, cleanEmpId, assignerId, reason || null])

        // Update asset status
        await pool.query('UPDATE equipements SET etat = $1, date_modification = NOW() WHERE id = $2', ['ASSIGNED', cleanAssetId])

        await logAudit({ action: 'ASSIGN', entityType: 'AFFECTATION', entityId: rows[0].id, description: `Équipement ${cleanAssetId} affecté à employé ${cleanEmpId}`, userId: req.user?.id })
        res.status(201).json({ success: true, message: 'Affectation créée.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/assignments/:id/return
router.patch('/:id/return', requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('aff-', '')
        const { returnCondition, notes } = req.body
        const pool = getPool()

        const { rows } = await pool.query('SELECT id_equipement FROM affectations WHERE id = $1', [cleanId])
        if (!rows.length) return res.status(404).json({ success: false, message: 'Affectation introuvable.' })

        const assetId = rows[0].id_equipement

        await pool.query(
            `UPDATE affectations SET statut = 'RETURNED', date_retour = NOW(), condition_retour = $1, notes_retour = $2 WHERE id = $3`,
            [returnCondition || 'GOOD', notes || null, cleanId]
        )
        await pool.query(`UPDATE equipements SET etat = 'IN_STOCK', date_modification = NOW() WHERE id = $1`, [assetId])

        await logAudit({ action: 'RETURN', entityType: 'AFFECTATION', entityId: Number(cleanId), description: `Retour équipement: affectation ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, message: 'Retour enregistré. Équipement remis en stock.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/assignments/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('aff-', '')
        await getPool().query('DELETE FROM affectations WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'AFFECTATION', entityId: Number(cleanId), description: `Affectation supprimée: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
