import { Router } from 'express'
import { getPool } from '../db/index.js'
import { logAudit } from '../middleware/audit.js'

const router = Router()

// GET /api/documents?type=BC|BR|DCH|...
router.get('/', async (req, res) => {
    try {
        const { type } = req.query
        const pool = getPool()
        const conditions = type ? ['type_document = $1'] : []
        const params = type ? [type] : []

        const { rows } = await pool.query(
            `SELECT id, type_document, numero_document, date_generation, donnees_json
             FROM documents
             ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
             ORDER BY date_generation DESC`,
            params
        )

        const data = rows.map(r => ({
            id: r.id,
            type: r.type_document,
            numero: r.numero_document,
            date: r.date_generation,
            data: r.donnees_json,
        }))

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
            `INSERT INTO documents (type_document, numero_document, donnees_json) VALUES ($1,$2,$3) RETURNING id`,
            [type, numero, data ? JSON.stringify(data) : null]
        )

        await logAudit({ action: 'CREATE', entityType: 'DOCUMENT', entityId: rows[0].id, description: `Document archivé: ${type} — ${numero}`, userId: req.user?.id })
        res.status(201).json({ success: true, id: rows[0].id })
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
