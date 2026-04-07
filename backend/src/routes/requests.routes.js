import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'

const router = Router()

// GET /api/requests
router.get('/', async (req, res) => {
    try {
        const { status, priority } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status)   { conditions.push(`d.statut = $${idx++}`);   params.push(status) }
        if (priority) { conditions.push(`d.priorite = $${idx++}`); params.push(priority) }

        // RBAC filtering
        if (req.query.mine === 'true') {
            // "Mes demandes" view: only show requests requested by the current user, regardless of their role.
            const emp = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
            if (emp.rows.length) { conditions.push(`d.id_demandeur = $${idx++}`); params.push(emp.rows[0].id) }
            else { conditions.push('1 = 0') }
        } else if (req.user?.role === 'USER') {
            const emp = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
            if (emp.rows.length) { conditions.push(`d.id_demandeur = $${idx++}`); params.push(emp.rows[0].id) }
            else { conditions.push('1 = 0') }
        } else if (req.user?.role === 'TECHNICIAN') {
            const tech = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
            if (tech.rows.length) {
                conditions.push(`(d.id_technicien_assigne = $${idx} OR d.statut = 'PENDING')`)
                params.push(tech.rows[0].id); idx++
            }
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

        const { rows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes,
                   dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                   tech.id as tech_id, tech.nom_complet as tech_nom,
                   sup.id as sup_id, sup.nom_complet as sup_nom
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
            LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
            ${where}
            ORDER BY d.date_demande DESC
        `, params)

        const data = rows.map(r => ({
            id: `req-${r.id}`,
            requestNumber: r.num_demande,
            objet: r.objet,
            description: r.description,
            priority: r.priorite,
            status: r.statut,
            createdAt: r.date_demande,
            resolvedAt: r.date_resolution,
            notes: r.notes,
            requestedBy: { id: `usr-${r.dem_id}`, fullName: r.dem_nom, position: r.dem_poste },
            assignedTo: r.tech_id ? { id: `usr-${r.tech_id}`, fullName: r.tech_nom } : null,
            assignedBy: r.sup_id ? { id: `usr-${r.sup_id}`, fullName: r.sup_nom } : null,
        }))

        const stats = {
            pendingCount:  data.filter(d => d.status === 'PENDING').length,
            assignedCount: data.filter(d => d.status === 'ASSIGNED').length,
            resolvedCount: data.filter(d => d.status === 'RESOLVED').length,
            urgentCount:   data.filter(d => d.priority === 'URGENT' && d.status !== 'RESOLVED').length,
        }

        res.json({ data, ...stats, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/requests/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('req-', '')
        const pool = getPool()

        const { rows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes,
                   dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                   tech.id as tech_id, tech.nom_complet as tech_nom,
                   sup.id as sup_id, sup.nom_complet as sup_nom
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
            LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
            WHERE d.id = $1
        `, [cleanId])

        if (!rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })

        const r = rows[0]
        
        // RBAC Check for standard users
        if (req.user?.role === 'USER') {
            const emp = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
            if (emp.rows[0]?.id !== r.dem_id) {
                return res.status(403).json({ success: false, message: 'Accès non autorisé.' })
            }
        }

        const data = {
            id: `req-${r.id}`,
            requestNumber: r.num_demande,
            objet: r.objet,
            description: r.description,
            priority: r.priorite,
            status: r.statut,
            createdAt: r.date_demande,
            resolvedAt: r.date_resolution,
            notes: r.notes,
            requestedBy: { id: `usr-${r.dem_id}`, fullName: r.dem_nom, position: r.dem_poste },
            assignedTo: r.tech_id ? { id: `usr-${r.tech_id}`, fullName: r.tech_nom } : null,
            assignedBy: r.sup_id ? { id: `usr-${r.sup_id}`, fullName: r.sup_nom } : null,
        }

        // Fetch audit logs for this specific request
        const { rows: auditRows } = await pool.query(`
            SELECT a.id, a.action, a.description, a.date_action, u.nom_complet as user_nom
            FROM journal_audit a
            LEFT JOIN utilisateurs u ON a.id_utilisateur = u.id
            WHERE a.type_entite = 'DEMANDE' AND a.id_entite = $1
            ORDER BY a.date_action DESC
        `, [cleanId])

        data.history = auditRows.map(log => ({
            id: log.id,
            action: log.action,
            description: log.description,
            date: log.date_action,
            user: log.user_nom || 'Système'
        }))

        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/requests
router.post('/', async (req, res) => {
    try {
        const { objet, description, priority, assetCategory, reason } = req.body
        const finalObjet = objet || assetCategory || 'Demande Matériel'
        const finalDesc = description || reason || null
        const pool = getPool()

        const emp = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
        if (!emp.rows.length) return res.status(404).json({ success: false, message: 'Employé introuvable.' })

        const year = new Date().getFullYear()
        const seq = await pool.query(`SELECT COUNT(*) FROM demandes WHERE EXTRACT(YEAR FROM date_demande) = $1`, [year])
        const num = `REQ-${year}-${String(parseInt(seq.rows[0].count) + 1).padStart(4, '0')}`

        const { rows } = await pool.query(
            `INSERT INTO demandes (num_demande, objet, description, priorite, id_demandeur) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
            [num, finalObjet, finalDesc, priority || 'MEDIUM', emp.rows[0].id]
        )

        await logAudit({ action: 'CREATE', entityType: 'DEMANDE', entityId: rows[0].id, description: `Ticket créé: ${num}`, userId: req.user?.id })
        res.status(201).json({ success: true, message: 'Demande soumise avec succès.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/requests/:id/assign — SUPERVISOR, ADMIN
router.patch('/:id/assign', requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('req-', '')
        const { assignedToId } = req.body
        const pool = getPool()

        const assignant = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
        const techId = String(assignedToId).replace(/^(usr|emp)-/, '')

        const demande = await pool.query('SELECT id FROM demandes WHERE id = $1', [cleanId])
        if (!demande.rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })

        await pool.query(
            `UPDATE demandes SET statut = 'ASSIGNED', id_technicien_assigne = $1, id_superviseur_assignant = $2 WHERE id = $3`,
            [techId, assignant.rows[0]?.id || null, cleanId]
        )

        await logAudit({ action: 'ASSIGN', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket assigné n°${cleanId}`, userId: req.user?.id })
        res.json({ success: true, message: 'Demande assignée.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/requests/:id/resolve — TECHNICIAN, ADMIN
router.patch('/:id/resolve', requireRole('TECHNICIAN', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('req-', '')
        const { notes } = req.body
        const pool = getPool()

        const { rows } = await pool.query('SELECT * FROM demandes WHERE id = $1', [cleanId])
        if (!rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })

        if (req.user?.role !== 'ADMIN') {
            const tech = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
            if (rows[0].id_technicien_assigne !== tech.rows[0]?.id)
                return res.status(403).json({ success: false, message: 'Non autorisé.' })
        }

        await pool.query(
            `UPDATE demandes SET statut = 'RESOLVED', date_resolution = NOW(), notes = $1 WHERE id = $2`,
            [notes || null, cleanId]
        )

        await logAudit({ action: 'RESOLVE', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket résolu n°${cleanId}`, userId: req.user?.id })
        res.json({ success: true, message: 'Demande clôturée.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/requests/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('req-', '')
        await getPool().query('DELETE FROM demandes WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket supprimé: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
