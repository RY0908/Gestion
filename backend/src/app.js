import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth.js'

// Import all routes
import authRoutes       from './routes/auth.routes.js'
import assetsRoutes     from './routes/assets.routes.js'
import usersRoutes      from './routes/users.routes.js'
import assignmentsRoutes from './routes/assignments.routes.js'
import requestsRoutes   from './routes/requests.routes.js'
import maintenanceRoutes from './routes/maintenance.routes.js'
import licensesRoutes   from './routes/licenses.routes.js'
import auditRoutes      from './routes/audit.routes.js'
import documentsRoutes  from './routes/documents.routes.js'

const app = express()

// Global Middleware
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Healthcheck (public)
app.get('/api/health', (req, res) => {
    res.json({ status: 'SIGMA Backend OK (PostgreSQL)', version: '2.0.0', ts: new Date().toISOString() })
})

// Public routes
app.use('/api/auth', authRoutes)

// All other routes require valid JWT
app.use('/api', authMiddleware)

app.use('/api/assets',          assetsRoutes)
app.use('/api/users',           usersRoutes)
app.use('/api/assignments',     assignmentsRoutes)
app.use('/api/requests',        requestsRoutes)
app.use('/api/maintenance',     maintenanceRoutes)
app.use('/api/licenses',        licensesRoutes)
app.use('/api/audit',           auditRoutes)

// Documents: unified archive + sub-routes for BC, BR, DCH
app.use('/api/documents',       documentsRoutes)

// Dynamic notifications endpoint — built from real DB data
app.get('/api/notifications', async (req, res) => {
    try {
        const { getPool } = await import('./db/index.js')
        const pool = getPool()
        const notifications = []
        let id = 1

        // Non-compliant licenses
        const { rows: lics } = await pool.query(
            `SELECT nom_logiciel, statut_conformite, date_expiration FROM licences WHERE statut_conformite != 'COMPLIANT'`
        )
        for (const l of lics) {
            notifications.push({
                id: id++, category: 'license', read: false,
                title: `Licence non conforme : ${l.nom_logiciel}`,
                desc: `Statut : ${l.statut_conformite}${l.date_expiration ? ` — expire le ${new Date(l.date_expiration).toLocaleDateString('fr-FR')}` : ''}`,
                time: 'Maintenant',
            })
        }

        // In-progress maintenance (open tickets)
        const { rows: maintenances } = await pool.query(
            `SELECT m.id, e.code_inventaire, e.marque, e.modele, m.description_panne, m.date_creation
             FROM maintenance m JOIN equipements e ON m.id_equipement = e.id
             WHERE m.statut IN ('SCHEDULED','IN_PROGRESS')
             ORDER BY m.date_creation DESC LIMIT 5`
        )
        for (const m of maintenances) {
            notifications.push({
                id: id++, category: 'maintenance', read: false,
                title: `Ticket maintenance ouvert — ${m.marque} ${m.modele}`,
                desc: m.description_panne || `Équipement ${m.code_inventaire}`,
                time: new Date(m.date_creation).toLocaleDateString('fr-FR'),
            })
        }

        // Pending requests (unassigned)
        const { rows: reqs } = await pool.query(
            `SELECT num_demande, objet, priorite, date_demande FROM demandes WHERE statut = 'PENDING' ORDER BY date_demande DESC LIMIT 5`
        )
        for (const r of reqs) {
            notifications.push({
                id: id++, category: 'request', read: false,
                title: `Ticket en attente d'assignation`,
                desc: `${r.num_demande} — ${r.objet} (priorité : ${r.priorite})`,
                time: new Date(r.date_demande).toLocaleDateString('fr-FR'),
            })
        }

        // Overdue assignments
        const { rows: overdue } = await pool.query(
            `SELECT a.id, e.code_inventaire, emp.nom_complet, a.date_affectation
             FROM affectations a
             JOIN equipements e ON a.id_equipement = e.id
             JOIN employes emp ON a.id_employe = emp.id
             WHERE a.statut = 'ACTIVE' AND a.date_affectation < NOW() - INTERVAL '6 months'`
        )
        for (const o of overdue) {
            notifications.push({
                id: id++, category: 'assignment', read: false,
                title: `Affectation longue durée — ${o.code_inventaire}`,
                desc: `Affecté à ${o.nom_complet} depuis ${new Date(o.date_affectation).toLocaleDateString('fr-FR')}`,
                time: 'Vérifier',
            })
        }

        res.json({ data: notifications, total: notifications.length, success: true })
    } catch (err) {
        console.error('[Notifications]', err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('[Error]', err)
    res.status(500).json({ success: false, message: 'Erreur serveur interne.', details: err.message })
})

// 404 Fallback
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint introuvable.' })
})

export default app
