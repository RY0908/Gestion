import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function mapUserRow(row) {
    return {
        id: `usr-${row.id}`,
        fullName: row.nom_complet,
        email: row.email,
        role: row.role,
        isActive: row.est_actif,
        createdAt: row.date_creation,
        employeeId: row.matricule || null,
        structure: row.structure || null,
        department: row.structure ? { code: row.structure, name: row.structure } : null,
        position: row.poste_occupe || null,
        phone: row.telephone || null,
        hireDate: row.date_embauche || null,
    }
}

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const { rows } = await getPool().query(`
            SELECT u.id, u.nom_complet, u.email, u.role, u.est_actif, u.date_creation,
                   e.matricule, e.structure, e.poste_occupe, e.telephone, e.date_embauche
            FROM utilisateurs u
            LEFT JOIN employes e ON u.email = e.email
            ORDER BY u.id
        `)
        const data = rows.map(mapUserRow)
        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'usr')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant utilisateur invalide.' })
        const { rows } = await getPool().query(`
            SELECT u.id, u.nom_complet, u.email, u.role, u.est_actif, u.date_creation,
                   e.matricule, e.structure, e.poste_occupe, e.telephone, e.date_embauche
            FROM utilisateurs u
            LEFT JOIN employes e ON u.email = e.email
            WHERE u.id = $1
        `, [cleanId])

        if (!rows.length) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
        res.json({ success: true, data: mapUserRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/users — Admin only
router.post('/', requireRole('ADMIN'), async (req, res) => {
    try {
        const { fullName, email, role, password, structure, position, matricule, telephone } = req.body
        if (!fullName || !email || !role) return res.status(400).json({ success: false, message: 'Champs requis manquants.' })

        const hash = await bcrypt.hash(password || 'sigma2024', 10)
        const pool = getPool()

        const existing = await pool.query('SELECT id FROM utilisateurs WHERE email = $1', [email])
        if (existing.rows.length > 0) return res.status(409).json({ success: false, message: 'Email déjà utilisé.' })

        const { rows } = await pool.query(
            `INSERT INTO utilisateurs (nom_complet, email, mot_de_passe, role) VALUES ($1,$2,$3,$4) RETURNING id`,
            [fullName, email, hash, role]
        )
        const newId = rows[0].id

        const parts = fullName.split(' ')
        const prenom = parts[0]
        const nom = parts.slice(1).join(' ') || prenom

        await pool.query(
            `INSERT INTO employes (matricule, nom, prenom, email, telephone, structure, poste_occupe, position, role)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (email) DO NOTHING`,
            [
                matricule || `STR-${String(newId).padStart(5, '0')}`,
                nom, prenom, email,
                telephone || null,
                structure || null,
                position || null,
                position || null,
                role
            ]
        )

        const { rows: createdRows } = await pool.query(`
            SELECT u.id, u.nom_complet, u.email, u.role, u.est_actif, u.date_creation,
                   e.matricule, e.structure, e.poste_occupe, e.telephone, e.date_embauche
            FROM utilisateurs u
            LEFT JOIN employes e ON u.email = e.email
            WHERE u.id = $1
        `, [newId])

        await logAudit({ action: 'CREATE', entityType: 'UTILISATEUR', entityId: newId, description: `Utilisateur créé: ${email}`, userId: req.user?.id })
        res.status(201).json({ success: true, data: mapUserRow(createdRows[0]), message: 'Utilisateur créé.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/users/:id — Admin only
router.patch('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'usr')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant utilisateur invalide.' })
        const { fullName, role, isActive, structure, position, phone, password } = req.body
        const pool = getPool()

        const existing = await pool.query('SELECT id FROM utilisateurs WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })

        if (password) {
            const hash = await bcrypt.hash(password, 10)
            await pool.query('UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2', [hash, cleanId])
        }

        await pool.query(
            `UPDATE utilisateurs SET nom_complet = COALESCE($1, nom_complet), role = COALESCE($2, role), est_actif = COALESCE($3, est_actif) WHERE id = $4`,
            [fullName || null, role || null, isActive !== undefined ? isActive : null, cleanId]
        )

        if (structure || position) {
            const { rows } = await pool.query('SELECT email FROM utilisateurs WHERE id = $1', [cleanId])
            if (rows.length > 0) {
                await pool.query(
                    `UPDATE employes SET structure = COALESCE($1, structure), poste_occupe = COALESCE($2, poste_occupe), telephone = COALESCE($3, telephone) WHERE email = $4`,
                    [structure || null, position || null, phone || null, rows[0].email]
                )
            }
        }

        const { rows: updatedRows } = await pool.query(`
            SELECT u.id, u.nom_complet, u.email, u.role, u.est_actif, u.date_creation,
                   e.matricule, e.structure, e.poste_occupe, e.telephone, e.date_embauche
            FROM utilisateurs u
            LEFT JOIN employes e ON u.email = e.email
            WHERE u.id = $1
        `, [cleanId])

        await logAudit({ action: 'UPDATE', entityType: 'UTILISATEUR', entityId: Number(cleanId), description: `Utilisateur modifié: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, data: mapUserRow(updatedRows[0]), message: 'Utilisateur modifié.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/users/:id — Admin only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'usr')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant utilisateur invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM utilisateurs WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
        await pool.query('UPDATE utilisateurs SET est_actif = FALSE WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'UTILISATEUR', entityId: Number(cleanId), description: `Utilisateur désactivé: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
