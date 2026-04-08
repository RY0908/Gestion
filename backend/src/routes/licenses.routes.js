import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function mapLicenseRow(r) {
    return {
        id: `lic-${r.id}`,
        softwareName: r.nom_logiciel,
        publisher: r.editeur,
        vendor: r.editeur,
        version: r.version,
        licenseKey: r.cle_licence,
        licenseType: r.type_licence,
        seatsLicensed: r.nb_postes_autorises,
        totalSeats: r.nb_postes_autorises,
        seatsUsed: r.nb_postes_utilises,
        usedSeats: r.nb_postes_utilises,
        acquisitionDate: r.date_acquisition,
        expirationDate: r.date_expiration,
        expiryDate: r.date_expiration,
        annualCost: r.cout_annuel,
        cost: r.cout_annuel,
        complianceStatus: r.statut_conformite,
        createdAt: r.date_creation,
    }
}

// GET /api/licenses
router.get('/', async (req, res) => {
    try {
        const { compliance, type } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (compliance) { conditions.push(`l.statut_conformite = $${idx++}`); params.push(compliance) }
        if (type)       { conditions.push(`l.type_licence = $${idx++}`);       params.push(type) }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

        const { rows } = await pool.query(`
            SELECT l.id, l.nom_logiciel, l.editeur, l.version, l.cle_licence, l.type_licence,
                   l.nb_postes_autorises, l.nb_postes_utilises, l.date_acquisition, l.date_expiration,
                   l.cout_annuel, l.statut_conformite, l.date_creation
            FROM licences l
            ${where}
            ORDER BY l.date_creation DESC
        `, params)

        const data = rows.map(mapLicenseRow)

        res.json({ data, success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/licenses/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'lic')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de licence invalide.' })
        const { rows } = await getPool().query(`
            SELECT id, nom_logiciel, editeur, version, cle_licence, type_licence,
                   nb_postes_autorises, nb_postes_utilises, date_acquisition, date_expiration,
                   cout_annuel, statut_conformite, date_creation
            FROM licences
            WHERE id = $1
        `, [cleanId])

        if (!rows.length) return res.status(404).json({ success: false, message: 'Licence introuvable.' })
        res.json({ success: true, data: mapLicenseRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/licenses
router.post('/', requireRole('ADMIN'), async (req, res) => {
    try {
        const {
            softwareName, publisher, vendor, version, licenseKey, licenseType = 'PERPETUAL',
            seatsLicensed = 1, totalSeats, seatsUsed = 0, usedSeats, acquisitionDate, expirationDate, expiryDate,
            annualCost = 0, cost, complianceStatus = 'COMPLIANT'
        } = req.body

        const finalPublisher = publisher || vendor
        const finalSeats = seatsLicensed ?? totalSeats ?? 1
        const finalUsed = seatsUsed ?? usedSeats ?? 0
        const finalCost = annualCost ?? cost ?? 0
        const finalExpiry = expirationDate || expiryDate || null

        const { rows } = await getPool().query(`
            INSERT INTO licences (nom_logiciel, editeur, version, cle_licence, type_licence, nb_postes_autorises, nb_postes_utilises, date_acquisition, date_expiration, cout_annuel, statut_conformite)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id
        `, [softwareName, finalPublisher, version || null, licenseKey || null, licenseType, finalSeats, finalUsed, acquisitionDate || null, finalExpiry, finalCost, complianceStatus])

        await logAudit({ action: 'CREATE', entityType: 'LICENCE', entityId: rows[0].id, description: `Licence ajoutée: ${softwareName}`, userId: req.user?.id })
        const { rows: createdRows } = await getPool().query(`
            SELECT id, nom_logiciel, editeur, version, cle_licence, type_licence,
                   nb_postes_autorises, nb_postes_utilises, date_acquisition, date_expiration,
                   cout_annuel, statut_conformite, date_creation
            FROM licences
            WHERE id = $1
        `, [rows[0].id])
        res.status(201).json({ success: true, data: mapLicenseRow(createdRows[0]), message: 'Licence créée.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PUT /api/licenses/:id
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'lic')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de licence invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM licences WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Licence introuvable.' })
        const {
            softwareName, publisher, vendor, version, licenseKey, licenseType,
            seatsLicensed, totalSeats, seatsUsed, usedSeats, acquisitionDate, expirationDate, expiryDate,
            annualCost, cost, complianceStatus
        } = req.body

        const finalPublisher = publisher || vendor
        const finalSeats = seatsLicensed ?? totalSeats
        const finalUsed = seatsUsed ?? usedSeats
        const finalCost = annualCost ?? cost
        const finalExpiry = expirationDate || expiryDate || null

        await pool.query(`
            UPDATE licences SET
                nom_logiciel = COALESCE($1, nom_logiciel),
                editeur = COALESCE($2, editeur),
                version = COALESCE($3, version),
                cle_licence = COALESCE($4, cle_licence),
                type_licence = COALESCE($5, type_licence),
                nb_postes_autorises = COALESCE($6, nb_postes_autorises),
                nb_postes_utilises = COALESCE($7, nb_postes_utilises),
                date_acquisition = COALESCE($8, date_acquisition),
                date_expiration = COALESCE($9, date_expiration),
                cout_annuel = COALESCE($10, cout_annuel),
                statut_conformite = COALESCE($11, statut_conformite)
            WHERE id = $12
        `, [softwareName || null, finalPublisher || null, version || null, licenseKey || null, licenseType || null,
            finalSeats || null, finalUsed || null, acquisitionDate || null, finalExpiry || null,
            finalCost || null, complianceStatus || null, cleanId])

        await logAudit({ action: 'UPDATE', entityType: 'LICENCE', entityId: Number(cleanId), description: `Licence modifiée: ${cleanId}`, userId: req.user?.id })
        const { rows } = await pool.query(`
            SELECT id, nom_logiciel, editeur, version, cle_licence, type_licence,
                   nb_postes_autorises, nb_postes_utilises, date_acquisition, date_expiration,
                   cout_annuel, statut_conformite, date_creation
            FROM licences
            WHERE id = $1
        `, [cleanId])
        res.json({ success: true, data: mapLicenseRow(rows[0]), message: 'Licence modifiée.' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/licenses/:id
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'lic')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de licence invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM licences WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Licence introuvable.' })
        await pool.query('DELETE FROM licences WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'LICENCE', entityId: Number(cleanId), description: `Licence supprimée: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
