import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function formatHistoryLabel(action, entityType) {
    const act = String(action || '').toUpperCase()
    const ent = String(entityType || '').toUpperCase()

    if (ent === 'EQUIPEMENT') {
        if (act === 'CREATE') return 'création de l’équipement'
        if (act === 'UPDATE') return 'mise à jour de l’équipement'
        if (act === 'DELETE') return 'retrait de l’équipement'
    }

    if (ent === 'MAINTENANCE') {
        if (act === 'CREATE') return 'ouverture du ticket de maintenance'
        if (act === 'UPDATE') return 'mise à jour du ticket de maintenance'
        if (act === 'DELETE') return 'suppression du ticket de maintenance'
    }

    if (ent === 'AFFECTATION') {
        if (act === 'ASSIGN') return 'création de l’affectation'
        if (act === 'RETURN') return 'retour du matériel'
        if (act === 'UPDATE') return 'mise à jour de l’affectation'
        if (act === 'DELETE') return 'suppression de l’affectation'
    }

    if (ent === 'DEMANDE') {
        if (act === 'CREATE') return 'création de la demande'
        if (act === 'UPDATE') return 'mise à jour de la demande'
        if (act === 'ASSIGN') return 'validation de la demande'
        if (act === 'RESOLVE') return 'clôture de la demande'
        if (act === 'DELETE') return 'suppression de la demande'
    }

    if (act === 'LOGIN') return 'connexion'
    if (act === 'LOGOUT') return 'déconnexion'
    return act ? act.toLowerCase() : 'événement'
}

function mapHistoryRow(r) {
    return {
        id: `aud-${r.id}`,
        action: r.type_action,
        label: formatHistoryLabel(r.type_action, r.entite_type),
        description: r.description,
        performedAt: r.date_action,
        performedBy: r.user_nom
            ? {
                fullName: r.user_nom,
                email: r.user_email,
                role: r.user_role,
            }
            : null,
        entityType: r.entite_type,
        entityId: r.entite_id,
        changes: r.modifications_json,
    }
}

// GET /api/assets
router.get('/', async (req, res) => {
    try {
        const { status, category, search, q, page = 1, pageSize = 50 } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status) {
            conditions.push(`e.etat = $${idx++}`)
            params.push(status)
        }
        if (category) {
            conditions.push(`e.categorie = $${idx++}`)
            params.push(category)
        }
        if (!status) {
            conditions.push(`e.etat <> 'RETIRED'`)
        }
        const term = search || q
        if (term) {
            conditions.push(`(e.code_inventaire ILIKE $${idx} OR e.marque ILIKE $${idx} OR e.modele ILIKE $${idx} OR e.num_serie ILIKE $${idx})`)
            params.push(`%${term}%`)
            idx++
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
        const offset = (Number(page) - 1) * Number(pageSize)

        const countRes = await pool.query(`SELECT COUNT(*) FROM equipements e ${where}`, params)
        const total = parseInt(countRes.rows[0].count, 10)

        const { rows } = await pool.query(`
            SELECT e.id, e.code_inventaire, e.num_serie, e.categorie as category, e.marque as brand, e.modele as model,
                   e.etat as status, e.condition_physique as condition, e.localisation as location,
                   e.prix_achat, e.valeur_actuelle, e.date_acquisition, e.date_garantie,
                   e.fournisseur, e.num_facture, e.notes, e.specifications, e.date_creation, e.date_modification,
                   af.id as aff_id, af.date_affectation, emp.id as assigned_to_id, emp.nom_complet as assigned_to_name,
                   emp.poste_occupe as assigned_to_position, emp.structure as assigned_to_structure
            FROM equipements e
            LEFT JOIN affectations af ON af.id_equipement = e.id AND af.statut = 'ACTIVE'
            LEFT JOIN employes emp ON af.id_employe = emp.id
            ${where}
            ORDER BY e.date_creation DESC
            LIMIT $${idx} OFFSET $${idx + 1}
        `, [...params, Number(pageSize), offset])

        const data = rows.map((r) => ({
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
            assignedAt: r.date_affectation || null,
            assignedTo: r.aff_id
                ? {
                    id: `usr-${r.assigned_to_id}`,
                    fullName: r.assigned_to_name,
                    position: r.assigned_to_position,
                    structure: r.assigned_to_structure,
                }
                : null,
        }))

        res.json({ data, total, page: Number(page), pageSize: Number(pageSize), success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

// GET /api/assets/:id/history
router.get('/:id/history', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'ast')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Invalid asset id.' })

        const pool = getPool()
        const assetExists = await pool.query('SELECT id FROM equipements WHERE id = $1', [cleanId])
        if (!assetExists.rows.length) return res.status(404).json({ success: false, message: 'Asset not found.' })

        const maintenanceIdsRes = await pool.query('SELECT id FROM maintenance WHERE id_equipement = $1', [cleanId])
        const assignmentIdsRes = await pool.query('SELECT id, id_demande FROM affectations WHERE id_equipement = $1', [cleanId])

        const maintenanceIds = maintenanceIdsRes.rows.map(row => row.id)
        const assignmentIds = assignmentIdsRes.rows.map(row => row.id)
        const requestIds = assignmentIdsRes.rows.map(row => row.id_demande).filter(Boolean)

        const conditions = ['(ja.entite_type = $1 AND ja.entite_id = $2)']
        const params = ['EQUIPEMENT', cleanId]
        let idx = 3

        if (maintenanceIds.length) {
            conditions.push(`(ja.entite_type = 'MAINTENANCE' AND ja.entite_id = ANY($${idx++}::int[]))`)
            params.push(maintenanceIds)
        }

        if (assignmentIds.length) {
            conditions.push(`(ja.entite_type = 'AFFECTATION' AND ja.entite_id = ANY($${idx++}::int[]))`)
            params.push(assignmentIds)
        }

        if (requestIds.length) {
            conditions.push(`(ja.entite_type = 'DEMANDE' AND ja.entite_id = ANY($${idx++}::int[]))`)
            params.push(requestIds)
        }

        const { rows } = await pool.query(`
            SELECT ja.id, ja.type_action, ja.entite_type, ja.entite_id, ja.description,
                   ja.modifications_json, ja.date_action,
                   u.nom_complet as user_nom, u.email as user_email, u.role as user_role
            FROM journal_audit ja
            LEFT JOIN utilisateurs u ON ja.id_utilisateur = u.id
            WHERE ${conditions.join(' OR ')}
            ORDER BY ja.date_action DESC
            LIMIT 200
        `, params)

        res.json({ success: true, data: rows.map(mapHistoryRow) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'ast')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Invalid asset id.' })

        const pool = getPool()
        const { rows } = await pool.query(`
            SELECT e.*, af.id as aff_id, af.date_affectation, emp.nom_complet as assigned_to_name, emp.poste_occupe
            FROM equipements e
            LEFT JOIN affectations af ON af.id_equipement = e.id AND af.statut = 'ACTIVE'
            LEFT JOIN employes emp ON af.id_employe = emp.id
            WHERE e.id = $1
        `, [cleanId])

        if (!rows.length) return res.status(404).json({ success: false, message: 'Asset not found.' })
        const r = rows[0]

        const maint = await pool.query(
            'SELECT * FROM maintenance WHERE id_equipement = $1 ORDER BY date_creation DESC LIMIT 5',
            [cleanId],
        )
        const history = await pool.query(`
            SELECT ja.id, ja.type_action, ja.entite_type, ja.entite_id, ja.description,
                   ja.modifications_json, ja.date_action,
                   u.nom_complet as user_nom, u.email as user_email, u.role as user_role
            FROM journal_audit ja
            LEFT JOIN utilisateurs u ON ja.id_utilisateur = u.id
            WHERE ja.entite_type = $1 AND ja.entite_id = $2
            ORDER BY ja.date_action DESC
            LIMIT 100
        `, ['EQUIPEMENT', cleanId])

        res.json({
            success: true,
            data: {
                id: `ast-${r.id}`,
                assetTag: r.code_inventaire,
                serialNumber: r.num_serie,
                category: r.categorie,
                brand: r.marque,
                model: r.modele,
                status: r.etat,
                condition: r.condition_physique,
                location: r.localisation,
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
                assignedAt: r.aff_id ? r.date_affectation : null,
                assignedTo: r.aff_id
                    ? {
                        fullName: r.assigned_to_name,
                        position: r.poste_occupe,
                        date: r.date_affectation,
                    }
                    : null,
                maintenanceHistory: maint.rows,
                history: history.rows.map(mapHistoryRow),
            },
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

// POST /api/assets - ADMIN, SUPERVISOR
router.post('/', requireRole('ADMIN', 'TECHNICIAN'), async (req, res) => {
    try {
        const {
            assetTag,
            serialNumber,
            category,
            brand,
            model,
            status = 'IN_STOCK',
            condition = 'NEW',
            location,
            purchasePrice,
            currentValue,
            acquisitionDate,
            warrantyDate,
            supplier,
            invoiceNumber,
            notes,
            specifications,
        } = req.body

        const payloadCondition = condition === 'EXCELLENT' ? 'NEW' : condition
        const pool = getPool()

        const { rows } = await pool.query(
            `
            INSERT INTO equipements
                (code_inventaire, num_serie, categorie, marque, modele, etat, condition_physique,
                 localisation, prix_achat, valeur_actuelle, date_acquisition, date_garantie,
                 fournisseur, num_facture, notes, specifications)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING id
        `,
            [
                assetTag,
                serialNumber || null,
                category,
                brand,
                model,
                status,
                payloadCondition,
                location || null,
                purchasePrice || null,
                currentValue || null,
                acquisitionDate || null,
                warrantyDate || null,
                supplier || null,
                invoiceNumber || null,
                notes || null,
                specifications ? JSON.stringify(specifications) : null,
            ],
        )

        await logAudit({
            action: 'CREATE',
            entityType: 'EQUIPEMENT',
            entityId: rows[0].id,
            description: `Asset created: ${assetTag}`,
            userId: req.user?.id,
        })
        res.status(201).json({ success: true, data: { id: `ast-${rows[0].id}` }, message: 'Asset created.' })
    } catch (err) {
        console.error(err)
        if (err.code === '23505') return res.status(409).json({ success: false, message: 'Asset tag already exists.' })
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

// PUT /api/assets/:id
router.put('/:id', requireRole('ADMIN', 'TECHNICIAN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'ast')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Invalid asset id.' })

        const pool = getPool()
        const existing = await pool.query('SELECT id FROM equipements WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Asset not found.' })

        const {
            assetTag,
            serialNumber,
            category,
            brand,
            model,
            status,
            condition,
            location,
            purchasePrice,
            currentValue,
            acquisitionDate,
            warrantyDate,
            supplier,
            invoiceNumber,
            notes,
            specifications,
        } = req.body

        const payloadCondition = condition === 'EXCELLENT' ? 'NEW' : condition

        await pool.query(
            `
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
        `,
            [
                assetTag || null,
                serialNumber || null,
                category || null,
                brand || null,
                model || null,
                status || null,
                payloadCondition || null,
                location || null,
                purchasePrice || null,
                currentValue || null,
                acquisitionDate || null,
                warrantyDate || null,
                supplier || null,
                invoiceNumber || null,
                notes || null,
                specifications ? JSON.stringify(specifications) : null,
                cleanId,
            ],
        )

        await logAudit({
            action: 'UPDATE',
            entityType: 'EQUIPEMENT',
            entityId: Number(cleanId),
            description: `Asset updated: ${cleanId}`,
            userId: req.user?.id,
        })
        res.json({ success: true, message: 'Asset updated.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

// PATCH /api/assets/:id/retire - ADMIN only
router.patch('/:id/retire', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'ast')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Invalid asset id.' })

        const pool = getPool()
        const existing = await pool.query('SELECT id FROM equipements WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Asset not found.' })

        await pool.query('UPDATE equipements SET etat = $1 WHERE id = $2', ['RETIRED', cleanId])
        await logAudit({
            action: 'DELETE',
            entityType: 'EQUIPEMENT',
            entityId: Number(cleanId),
            description: `Asset retired: ${cleanId}`,
            userId: req.user?.id,
        })
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

// DELETE /api/assets/:id - ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'ast')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Invalid asset id.' })

        const pool = getPool()
        const existing = await pool.query('SELECT id FROM equipements WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Asset not found.' })

        await pool.query('UPDATE equipements SET etat = $1 WHERE id = $2', ['RETIRED', cleanId])
        await logAudit({
            action: 'DELETE',
            entityType: 'EQUIPEMENT',
            entityId: Number(cleanId),
            description: `Asset retired: ${cleanId}`,
            userId: req.user?.id,
        })
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
})

export default router
