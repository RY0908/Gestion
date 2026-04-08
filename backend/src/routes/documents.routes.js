import { Router } from 'express'
import { getPool } from '../db/index.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function mapDocumentRow(r) {
    return {
        id: `doc-${r.id}`,
        type: r.type_document,
        numero: r.numero_document,
        date: r.date_generation,
        data: r.donnees_json,
        status: r.statut,
        createdBy: r.created_by ? `usr-${r.created_by}` : null,
        updatedAt: r.updated_at,
        workflow: r.workflow_json,
        affectationId: r.id_affectation ? `aff-${r.id_affectation}` : null,
    }
}

// GET /api/documents?type=BC|BR|DCH|...
router.get('/', async (req, res) => {
    try {
        const { type } = req.query
        const pool = getPool()
        const conditions = type ? ['type_document = $1'] : []
        const params = type ? [type] : []

        const { rows } = await pool.query(
            `SELECT id, type_document, numero_document, date_generation, donnees_json, statut, created_by, updated_at, workflow_json, id_affectation
             FROM documents
             ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
             ORDER BY date_generation DESC`,
            params
        )

        const data = rows.map(mapDocumentRow)

        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/documents — Archive a generated document
router.post('/', async (req, res) => {
    try {
        const { type, numero, data } = req.body
        if (!type || !numero) return res.status(400).json({ success: false, message: 'Type et numéro requis.' })

        const { rows } = await getPool().query(
            `INSERT INTO documents (type_document, numero_document, donnees_json, statut, created_by, workflow_json)
             VALUES ($1,$2,$3,'ARCHIVED',$4,$5) RETURNING id`,
            [type, numero, data ? JSON.stringify(data) : null, req.user?.id || null, JSON.stringify({ history: [{ action: 'CREATE', at: new Date().toISOString(), by: req.user?.id || null }] })]
        )

        await logAudit({ action: 'CREATE', entityType: 'DOCUMENT', entityId: rows[0].id, description: `Document archivé: ${type} — ${numero}`, userId: req.user?.id })
        const { rows: createdRows } = await getPool().query(
            `SELECT id, type_document, numero_document, date_generation, donnees_json, statut, created_by, updated_at, workflow_json, id_affectation
             FROM documents WHERE id = $1`,
            [rows[0].id]
        )
        res.status(201).json({ success: true, data: mapDocumentRow(createdRows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/documents/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'doc')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de document invalide.' })
        const { rows } = await getPool().query(
            `SELECT id, type_document, numero_document, date_generation, donnees_json, statut, created_by, updated_at, workflow_json, id_affectation
             FROM documents WHERE id = $1`,
            [cleanId]
        )
        if (!rows.length) return res.status(404).json({ success: false, message: 'Document introuvable.' })
        res.json({ success: true, data: mapDocumentRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/documents/:id
router.patch('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'doc')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de document invalide.' })
        const { data, status, workflow } = req.body
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM documents WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Document introuvable.' })
        await pool.query(
            `UPDATE documents
             SET donnees_json = COALESCE($1, donnees_json),
                 statut = COALESCE($2, statut),
                 workflow_json = COALESCE($3, workflow_json),
                 updated_at = NOW()
             WHERE id = $4`,
            [data ? JSON.stringify(data) : null, status || null, workflow ? JSON.stringify(workflow) : null, cleanId]
        )
        const { rows } = await pool.query(
            `SELECT id, type_document, numero_document, date_generation, donnees_json, statut, created_by, updated_at, workflow_json, id_affectation
             FROM documents WHERE id = $1`,
            [cleanId]
        )
        await logAudit({ action: 'UPDATE', entityType: 'DOCUMENT', entityId: Number(cleanId), description: `Document mis à jour: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, data: mapDocumentRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/documents/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'doc')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de document invalide.' })
        const { status } = req.body
        if (!status) return res.status(400).json({ success: false, message: 'Statut requis.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM documents WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Document introuvable.' })
        await pool.query(
            `UPDATE documents SET statut = $1, updated_at = NOW() WHERE id = $2`,
            [status, cleanId]
        )
        const { rows } = await pool.query(
            `SELECT id, type_document, numero_document, date_generation, donnees_json, statut, created_by, updated_at, workflow_json, id_affectation
             FROM documents WHERE id = $1`,
            [cleanId]
        )
        await logAudit({ action: 'UPDATE', entityType: 'DOCUMENT', entityId: Number(cleanId), description: `Statut document mis à jour: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, data: mapDocumentRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'doc')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de document invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM documents WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Document introuvable.' })
        await pool.query('DELETE FROM documents WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'DOCUMENT', entityId: Number(cleanId), description: `Document supprimé: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/documents/purchase-orders — Bons de commande
router.get('/purchase-orders', async (req, res) => {
    try {
        const { rows } = await getPool().query(
            `SELECT id, numero_document as "orderNumber", donnees_json, date_generation as date
             FROM documents WHERE type_document = 'BC' ORDER BY date_generation DESC`
        )
        const data = rows.map(r => ({
            id: r.id,
            orderNumber: r.orderNumber,
            date: r.date,
            ...(r.donnees_json || {}),
        }))
        res.json({ data, success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/documents/bon-receptions — Bons de réception
router.get('/bon-receptions', async (req, res) => {
    try {
        const { rows } = await getPool().query(
            `SELECT id, numero_document as "receptionNumber", donnees_json, date_generation as "livraisonDate"
             FROM documents WHERE type_document = 'BR' ORDER BY date_generation DESC`
        )
        const data = rows.map(r => ({
            id: r.id,
            receptionNumber: r.receptionNumber,
            livraisonDate: r.livraisonDate,
            ...(r.donnees_json || {}),
        }))
        res.json({ data, success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/documents/decharges — Décharges matériel
router.get('/decharges', async (req, res) => {
    try {
        const { rows } = await getPool().query(
            `SELECT id, numero_document, donnees_json, date_generation as date
             FROM documents WHERE type_document = 'DCH' ORDER BY date_generation DESC`
        )
        const data = rows.map(r => ({
            id: r.id,
            ...(r.donnees_json || {}),
            date: r.date,
        }))
        res.json({ data, success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
