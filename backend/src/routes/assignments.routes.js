import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function formatHistoryLabel(action, entityType) {
    const act = String(action || '').toUpperCase()
    const ent = String(entityType || '').toUpperCase()

    if (ent === 'AFFECTATION') {
        if (act === 'ASSIGN') return 'création de l’affectation'
        if (act === 'RETURN') return 'retour du matériel'
        if (act === 'UPDATE') return 'mise à jour de l’affectation'
        if (act === 'DELETE') return 'suppression de l’affectation'
    }

    if (ent === 'DEMANDE') {
        if (act === 'CREATE') return 'création de la demande'
        if (act === 'ASSIGN') return 'validation de la demande'
        if (act === 'RESOLVE') return 'clôture de la demande'
        if (act === 'UPDATE') return 'mise à jour de la demande'
        if (act === 'DELETE') return 'suppression de la demande'
    }

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

function mapAssignmentRow(r) {
    return {
        id: `aff-${r.id}`,
        assignedAt: r.date_affectation,
        returnedAt: r.date_retour,
        reason: r.motif,
        status: r.statut,
        returnCondition: r.condition_retour,
        returnNotes: r.notes_retour,
        createdAt: r.date_creation,
        sourceRequest: r.req_id ? {
            id: `req-${r.req_id}`,
            requestNumber: r.req_num_demande,
            status: r.req_statut,
            description: r.req_description,
            requestedBy: r.req_dem_id ? {
                id: `usr-${r.req_dem_id}`,
                fullName: r.req_dem_nom,
            } : null,
        } : null,
        asset: {
            id: `ast-${r.eq_id}`,
            assetTag: r.code_inventaire,
            serialNumber: r.num_serie,
            category: r.categorie,
            brand: r.marque,
            model: r.modele,
            status: r.eq_etat,
            condition: r.eq_condition,
            location: r.eq_localisation,
            purchasePrice: r.eq_prix_achat,
            currentValue: r.eq_valeur_actuelle,
            acquisitionDate: r.eq_date_acquisition,
            warrantyDate: r.eq_date_garantie,
            supplier: r.eq_fournisseur,
            invoiceNumber: r.eq_num_facture,
            notes: r.eq_notes,
            specifications: r.eq_specifications,
        },
        employee: {
            id: `usr-${r.emp_id}`,
            fullName: r.nom_complet,
            position: r.poste_occupe,
            structure: r.structure,
        },
        assignedBy: r.att_id ? { id: `usr-${r.att_id}`, fullName: r.att_nom } : null,
    }
}

async function resolveEmployeeIdFromUserId(pool, userId) {
    const cleanUserId = parsePrefixedId(userId, 'usr')
    if (!cleanUserId) return null

    const directEmployee = await pool.query(
        'SELECT id FROM employes WHERE id = $1',
        [cleanUserId]
    )
    if (directEmployee.rows.length) return directEmployee.rows[0].id

    const linkedEmployee = await pool.query(
        `SELECT e.id
         FROM employes e
         JOIN utilisateurs u ON LOWER(u.email) = LOWER(e.email)
         WHERE u.id = $1
         LIMIT 1`,
        [cleanUserId]
    )
    if (linkedEmployee.rows.length) return linkedEmployee.rows[0].id

    return null
}

function buildAssignmentSelect(whereClause = '') {
    return `
        SELECT a.id, a.date_affectation, a.date_retour, a.motif, a.statut, a.condition_retour, a.notes_retour, a.date_creation,
               d.id as req_id, d.num_demande as req_num_demande, d.statut as req_statut, d.description as req_description,
               reqdem.id as req_dem_id, reqdem.nom_complet as req_dem_nom,
               e.id as eq_id, e.code_inventaire, e.num_serie, e.categorie, e.marque, e.modele, e.etat as eq_etat,
               e.condition_physique as eq_condition, e.localisation as eq_localisation,
               e.prix_achat as eq_prix_achat, e.valeur_actuelle as eq_valeur_actuelle,
               e.date_acquisition as eq_date_acquisition, e.date_garantie as eq_date_garantie,
               e.fournisseur as eq_fournisseur, e.num_facture as eq_num_facture,
               e.notes as eq_notes, e.specifications as eq_specifications,
               emp.id as emp_id, emp.nom_complet, emp.poste_occupe, emp.structure,
               att.id as att_id, att.nom_complet as att_nom
        FROM affectations a
        LEFT JOIN demandes d ON a.id_demande = d.id
        LEFT JOIN employes reqdem ON d.id_demandeur = reqdem.id
        JOIN equipements e ON a.id_equipement = e.id
        JOIN employes emp ON a.id_employe = emp.id
        LEFT JOIN employes att ON a.id_attribue_par = att.id
        ${whereClause}
        ORDER BY a.date_creation DESC
    `
}

// GET /api/assignments
router.get('/', async (req, res) => {
    try {
        const { status, employeeId, userId } = req.query
        const pool = getPool()
        const conditions = []
        const params = []
        let idx = 1

        if (status) {
            conditions.push(`a.statut = $${idx++}`)
            params.push(status)
        }

        const employeeFilter = employeeId || userId
        if (employeeFilter) {
            let cleanEmployeeId = null

            if (String(employeeFilter).startsWith('emp')) {
                cleanEmployeeId = parsePrefixedId(employeeFilter, 'emp')
            } else {
                cleanEmployeeId = await resolveEmployeeIdFromUserId(pool, employeeFilter)
            }

            if (!cleanEmployeeId) return res.status(400).json({ success: false, message: 'Identifiant employe invalide.' })
            conditions.push(`a.id_employe = $${idx++}`)
            params.push(cleanEmployeeId)
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
        const { rows } = await pool.query(buildAssignmentSelect(where), params)
        res.json({ data: rows.map(mapAssignmentRow), success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// GET /api/assignments/:id
router.get('/:id/history', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'aff')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant d\'affectation invalide.' })

        const pool = getPool()
        const assignmentRes = await pool.query('SELECT id_demande FROM affectations WHERE id = $1', [cleanId])
        if (!assignmentRes.rows.length) return res.status(404).json({ success: false, message: 'Affectation introuvable.' })

        const requestId = assignmentRes.rows[0].id_demande
        const conditions = ['(ja.entite_type = $1 AND ja.entite_id = $2)']
        const params = ['AFFECTATION', cleanId]
        let idx = 3

        if (requestId) {
            conditions.push(`(ja.entite_type = 'DEMANDE' AND ja.entite_id = $${idx++})`)
            params.push(requestId)
        }

        const { rows } = await pool.query(`
            SELECT ja.id, ja.type_action, ja.entite_type, ja.entite_id, ja.description,
                   ja.modifications_json, ja.date_action,
                   u.nom_complet as user_nom, u.email as user_email, u.role as user_role
            FROM journal_audit ja
            LEFT JOIN utilisateurs u ON ja.id_utilisateur = u.id
            WHERE ${conditions.join(' OR ')}
            ORDER BY ja.date_action DESC
            LIMIT 100
        `, params)

        res.json({ success: true, data: rows.map(mapHistoryRow) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'aff')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant d\'affectation invalide.' })
        const { rows } = await getPool().query(buildAssignmentSelect('WHERE a.id = $1'), [cleanId])
        if (!rows.length) return res.status(404).json({ success: false, message: 'Affectation introuvable.' })
        res.json({ success: true, data: mapAssignmentRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// POST /api/assignments
router.post('/', requireRole('TECHNICIAN', 'SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const { requestId, assetId, reason, notes, assignmentDate } = req.body
        const pool = getPool()

        const cleanRequestId = parsePrefixedId(requestId, 'req')
        if (!cleanRequestId) return res.status(400).json({ success: false, message: 'Identifiant de demande requis.' })

        const cleanAssetId = parsePrefixedId(assetId, 'ast')
        if (!cleanAssetId) return res.status(400).json({ success: false, message: 'Identifiant d\'equipement invalide.' })

        const assetExists = await pool.query('SELECT id, etat FROM equipements WHERE id = $1', [cleanAssetId])
        if (!assetExists.rows.length) return res.status(404).json({ success: false, message: 'Equipement introuvable.' })
        if (assetExists.rows[0].etat !== 'IN_STOCK') {
            return res.status(409).json({ success: false, message: 'L\'equipement doit etre en stock pour etre affecte.' })
        }

        const requestRes = await pool.query(`
            SELECT d.id, d.statut, d.id_demandeur, d.num_demande, dem.nom_complet
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            WHERE d.id = $1
        `, [cleanRequestId])
        if (!requestRes.rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })
        if (requestRes.rows[0].statut !== 'ASSIGNED') {
            return res.status(409).json({ success: false, message: 'La demande doit etre confirmee avant de creer l\'affectation.' })
        }

        const requestAlreadyLinked = await pool.query('SELECT id FROM affectations WHERE id_demande = $1', [cleanRequestId])
        if (requestAlreadyLinked.rows.length) {
            return res.status(409).json({ success: false, message: 'Cette demande possede deja une affectation.' })
        }

        const assignerRes = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
        if (!assignerRes.rows.length) return res.status(404).json({ success: false, message: 'Assignateur introuvable.' })

        const existing = await pool.query(
            'SELECT id FROM affectations WHERE id_equipement = $1 AND statut = $2',
            [cleanAssetId, 'ACTIVE']
        )
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Equipement deja affecte a un employe actif.' })
        }

        const { rows } = await pool.query(
            `INSERT INTO affectations (date_affectation, id_equipement, id_employe, id_attribue_par, id_demande, motif, statut)
             VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE') RETURNING id`,
            [
                assignmentDate || new Date().toISOString().split('T')[0],
                cleanAssetId,
                requestRes.rows[0].id_demandeur,
                assignerRes.rows[0].id,
                cleanRequestId,
                reason || notes || requestRes.rows[0].nom_complet || null,
            ]
        )

        await pool.query('UPDATE equipements SET etat = $1, date_modification = NOW() WHERE id = $2', ['ASSIGNED', cleanAssetId])
        await pool.query(
            `UPDATE demandes
             SET statut = 'RESOLVED',
                 date_resolution = NOW(),
                 notes = COALESCE($1, notes)
             WHERE id = $2`,
            [notes || reason || null, cleanRequestId]
        )

        const created = await pool.query(buildAssignmentSelect('WHERE a.id = $1'), [rows[0].id])
        await logAudit({
            action: 'ASSIGN',
            entityType: 'AFFECTATION',
            entityId: rows[0].id,
            description: `Equipement ${cleanAssetId} affecte via demande ${cleanRequestId}`,
            userId: req.user?.id,
        })
        res.status(201).json({ success: true, data: mapAssignmentRow(created.rows[0]), message: 'Affectation creee.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PUT /api/assignments/:id
router.put('/:id', requireRole('TECHNICIAN', 'SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'aff')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant d\'affectation invalide.' })
        const { reason, notes, status } = req.body
        const pool = getPool()

        const existing = await pool.query('SELECT id FROM affectations WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Affectation introuvable.' })

        await pool.query(
            `UPDATE affectations
             SET motif = COALESCE($1, motif),
                 statut = COALESCE($2, statut),
                 notes_retour = COALESCE($3, notes_retour)
             WHERE id = $4`,
            [reason || notes || null, status || null, notes || null, cleanId]
        )

        const { rows } = await pool.query(buildAssignmentSelect('WHERE a.id = $1'), [cleanId])
        await logAudit({ action: 'UPDATE', entityType: 'AFFECTATION', entityId: Number(cleanId), description: `Affectation mise a jour: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, data: mapAssignmentRow(rows[0]) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/assignments/:id/return
router.patch('/:id/return', requireRole('TECHNICIAN', 'SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'aff')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant d\'affectation invalide.' })
        const { returnCondition, notes } = req.body
        const pool = getPool()

        const assignment = await pool.query('SELECT id_equipement FROM affectations WHERE id = $1', [cleanId])
        if (!assignment.rows.length) return res.status(404).json({ success: false, message: 'Affectation introuvable.' })

        await pool.query(
            `UPDATE affectations SET statut = 'RETURNED', date_retour = NOW(), condition_retour = $1, notes_retour = $2 WHERE id = $3`,
            [returnCondition || 'GOOD', notes || null, cleanId]
        )
        await pool.query(`UPDATE equipements SET etat = 'IN_STOCK', date_modification = NOW() WHERE id = $1`, [assignment.rows[0].id_equipement])

        await logAudit({ action: 'RETURN', entityType: 'AFFECTATION', entityId: Number(cleanId), description: `Retour equipement: affectation ${cleanId}`, userId: req.user?.id })
        res.json({ success: true, message: 'Retour enregistre. Equipement remis en stock.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/assignments/:id
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'aff')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant d\'affectation invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM affectations WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Affectation introuvable.' })
        await pool.query('DELETE FROM affectations WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'AFFECTATION', entityId: Number(cleanId), description: `Affectation supprimee: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
