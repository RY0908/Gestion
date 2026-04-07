import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'

const router = Router()

// GET /api/assets
router.get('/', async (req, res) => {
    try {
        const { status, category, search, page = 1, pageSize = 50 } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status)   { conditions.push(`e.etat = $${idx++}`);      params.push(status) }
        if (category) { conditions.push(`e.categorie = $${idx++}`); params.push(category) }
        if (search)   {
            conditions.push(`(e.code_inventaire ILIKE $${idx} OR e.marque ILIKE $${idx} OR e.modele ILIKE $${idx} OR e.num_serie ILIKE $${idx})`)
            params.push(`%${search}%`); idx++
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
        const offset = (Number(page) - 1) * Number(pageSize)

        const countRes = await pool.query(`SELECT COUNT(*) FROM equipements e ${where}`, params)
        const total = parseInt(countRes.rows[0].count)

        const { rows } = await pool.query(`
            SELECT e.id, e.code_inventaire, e.num_serie, e.categorie as category, e.marque as brand, e.modele as model,
                   e.etat as status, e.condition_physique as condition, e.localisation as location,
                   e.prix_achat, e.valeur_actuelle, e.date_acquisition, e.date_garantie,
                   e.fournisseur, e.num_facture, e.notes, e.specifications, e.date_creation, e.date_modification,
                   af.id as aff_id, emp.nom_complet as assigned_to_name
            FROM equipements e
            LEFT JOIN affectations af ON af.id_equipement = e.id AND af.statut = 'ACTIVE'
            LEFT JOIN employes emp ON af.id_employe = emp.id
            ${where}
            ORDER BY e.date_creation DESC
            LIMIT $${idx} OFFSET $${idx + 1}
        `, [...params, Number(pageSize), offset])

        const data = rows.map(r => ({
            id: `ast-${r.id}`,
            assetTag: r.code_inventaire,
            serialNumber: r.num_serie,
            category: r.category,
            brand: r.brand,
            model: r.model,
            status: r.status,
            condition: r.condition,
            location: r.location,
            purchasePrice: r.prix_achat,
            currentValue: r.valeur_actuelle,
            acquisitionDate: r.date_acquisition,
            warrantyDate: r.date_garantie,
            supplier: r.fournisseur,
            invoiceNumber: r.num_facture,
            notes: r.notes,
            specifications: r.specifications,
            createdAt: r.date_creation,
            updatedAt: r.date_modification,
            assignedTo: r.aff_id ? { name: r.assigned_to_name } : null,
        }))

        res.json({ data, total, page: Number(page), pageSize: Number(pageSize), success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('ast-', '')
        const pool = getPool()
        const { rows } = await pool.query(`
            SELECT e.*, af.id as aff_id, af.date_affectation, emp.nom_complet as assigned_to_name, emp.poste_occupe
            FROM equipements e
            LEFT JOIN affectations af ON af.id_equipement = e.id AND af.statut = 'ACTIVE'
            LEFT JOIN employes emp ON af.id_employe = emp.id
            WHERE e.id = $1
        `, [cleanId])
        if (!rows.length) return res.status(404).json({ success: false, message: 'Équipement introuvable.' })
        const r = rows[0]

        // Fetch maintenance history
        const maint = await pool.query('SELECT * FROM maintenance WHERE id_equipement = $1 ORDER BY date_creation DESC LIMIT 5', [cleanId])

        res.json({
            success: true,
            data: {
                id: `ast-${r.id}`,
                assetTag: r.code_inventaire, serialNumber: r.num_serie, category: r.categorie,
                brand: r.marque, model: r.modele, status: r.etat, condition: r.condition_physique,
                location: r.localisation, purchasePrice: r.prix_achat, currentValue: r.valeur_actuelle,
                acquisitionDate: r.date_acquisition, warrantyDate: r.date_garantie,
                supplier: r.fournisseur, invoiceNumber: r.num_facture, notes: r.notes,
                specifications: r.specifications, createdAt: r.date_creation, updatedAt: r.date_modification,
                assignedTo: r.aff_id ? { name: r.assigned_to_name, position: r.poste_occupe, date: r.date_affectation } : null,
                maintenanceHistory: maint.rows
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/assets — ADMIN, SUPERVISOR
router.post('/', requireRole('ADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const {
            assetTag, serialNumber, category, brand, model, status = 'IN_STOCK',
            condition = 'NEW', location, purchasePrice, currentValue,
            acquisitionDate, warrantyDate, supplier, invoiceNumber, notes, specifications
        } = req.body

        const { rows } = await getPool().query(`
            INSERT INTO equipements
                (code_inventaire, num_serie, categorie, marque, modele, etat, condition_physique,
                 localisation, prix_achat, valeur_actuelle, date_acquisition, date_garantie,
                 fournisseur, num_facture, notes, specifications)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING id
        `, [assetTag, serialNumber || null, category, brand, model, status, condition,
            location || null, purchasePrice || null, currentValue || null,
            acquisitionDate || null, warrantyDate || null, supplier || null,
            invoiceNumber || null, notes || null,
            specifications ? JSON.stringify(specifications) : null])

        await logAudit({ action: 'CREATE', entityType: 'EQUIPEMENT', entityId: rows[0].id, description: `Équipement ajouté: ${assetTag}`, userId: req.user?.id })
        res.status(201).json({ success: true, data: { id: `ast-${rows[0].id}` }, message: 'Équipement créé.' })
    } catch (err) {
        console.error(err)
        if (err.code === '23505') return res.status(409).json({ success: false, message: 'Code inventaire déjà existant.' })
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PUT /api/assets/:id
router.put('/:id', requireRole('ADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('ast-', '')
        const {
            assetTag, serialNumber, category, brand, model, status, condition,
            location, purchasePrice, currentValue, acquisitionDate, warrantyDate,
            supplier, invoiceNumber, notes, specifications
        } = req.body

        await getPool().query(`
            UPDATE equipements SET
                code_inventaire = COALESCE($1, code_inventaire),
                num_serie = COALESCE($2, num_serie),
                categorie = COALESCE($3, categorie),
                marque = COALESCE($4, marque),
                modele = COALESCE($5, modele),
                etat = COALESCE($6, etat),
                condition_physique = COALESCE($7, condition_physique),
                localisation = COALESCE($8, localisation),
                prix_achat = COALESCE($9, prix_achat),
                valeur_actuelle = COALESCE($10, valeur_actuelle),
                date_acquisition = COALESCE($11, date_acquisition),
                date_garantie = COALESCE($12, date_garantie),
                fournisseur = COALESCE($13, fournisseur),
                num_facture = COALESCE($14, num_facture),
                notes = COALESCE($15, notes),
                specifications = COALESCE($16, specifications),
                date_modification = NOW()
            WHERE id = $17
        `, [assetTag || null, serialNumber || null, category || null, brand || null, model || null,
            status || null, condition || null, location || null, purchasePrice || null,
            currentValue || null, acquisitionDate || null, warrantyDate || null,
            supplier || null, invoiceNumber || null, notes || null,
            specifications ? JSON.stringify(specifications) : null, cleanId])

        await logAudit({ action: 'UPDATE', entityType: 'EQUIPEMENT', entityId: Number(cleanId), description: `Équipement modifié: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, message: 'Équipement modifié.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/assets/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = String(req.params.id).replace('ast-', '')
        await getPool().query('UPDATE equipements SET etat = $1 WHERE id = $2', ['RETIRED', cleanId])
        await logAudit({ action: 'DELETE', entityType: 'EQUIPEMENT', entityId: Number(cleanId), description: `Équipement retiré: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
