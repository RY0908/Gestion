import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getPool } from '../db/index.js'
import { logAudit } from '../middleware/audit.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' })

        const pool = getPool()
        const { rows } = await pool.query(
            'SELECT * FROM utilisateurs WHERE email = $1 AND est_actif = TRUE',
            [email.toLowerCase()]
        )
        const user = rows[0]
        if (!user) return res.status(401).json({ success: false, message: 'Identifiants incorrects.' })

        const valid = await bcrypt.compare(password, user.mot_de_passe)
        if (!valid) return res.status(401).json({ success: false, message: 'Identifiants incorrects.' })

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, fullName: user.nom_complet },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        )

        await logAudit({ action: 'LOGIN', entityType: 'UTILISATEUR', entityId: user.id, description: `Connexion de ${user.email}`, userId: user.id })

        res.json({
            success: true,
            token,
            user: { id: `usr-${user.id}`, email: user.email, role: user.role, fullName: user.nom_complet }
        })
    } catch (err) {
        console.error('[Auth] Login error:', err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        if (req.user) {
            await logAudit({ action: 'LOGOUT', entityType: 'UTILISATEUR', entityId: req.user.id, description: `Déconnexion de ${req.user.email}`, userId: req.user.id })
        }
        res.json({ success: true })
    } catch {
        res.json({ success: true })
    }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false })
    try {
        const { rows } = await getPool().query('SELECT id, nom_complet, email, role FROM utilisateurs WHERE id = $1', [req.user.id])
        const u = rows[0]
        if (!u) return res.status(404).json({ success: false })
        res.json({ success: true, user: { id: `usr-${u.id}`, fullName: u.nom_complet, email: u.email, role: u.role } })
    } catch (err) {
        res.status(500).json({ success: false })
    }
})

export default router
