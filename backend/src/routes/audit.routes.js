import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/audit
router.get('/', requireRole('ADMIN'), async (req, res) => {
    try {
        const { entityType, limit = 100 } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (entityType) { conditions.push(`ja.entite_type = $${idx++}`); params.push(entityType) }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

        const { rows } = await pool.query(`
            SELECT ja.id, ja.type_action, ja.entite_type, ja.entite_id, ja.description,
                   ja.modifications_json, ja.date_action,
                   u.nom_complet as user_nom, u.email as user_email, u.role as user_role
            FROM journal_audit ja
            LEFT JOIN utilisateurs u ON ja.id_utilisateur = u.id
            ${where}
            ORDER BY ja.date_action DESC
            LIMIT $${idx}
        `, [...params, Number(limit)])

        const data = rows.map(r => ({
            id: `aud-${r.id}`,
            action: r.type_action,
            entityType: r.entite_type,
            entityId: r.entite_id,
            description: r.description,
            changes: r.modifications_json,
            timestamp: r.date_action,
            user: r.user_nom ? { fullName: r.user_nom, email: r.user_email, role: r.user_role } : null,
        }))

        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
