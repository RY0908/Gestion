import { Router } from 'express'
import { getPool } from '../db/index.js'
import { requireRole } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'
import { parsePrefixedId } from '../utils/ids.js'

const router = Router()

function mapRequestRow(r, stockCounts = {}) {
    const categoryKey = r.categorie_actif || r.objet || null
    const availableCount = categoryKey ? Number(stockCounts[categoryKey] || 0) : Number(stockCounts.__total || 0)
    return {
        id: `req-${r.id}`,
        requestNumber: r.num_demande,
        assetCategory: r.categorie_actif || r.objet || null,
        objet: r.objet,
        description: r.description,
        specifications: r.specifications || null,
        priority: r.priorite,
        status: r.statut,
        createdAt: r.date_demande,
        resolvedAt: r.date_resolution,
        notes: r.notes,
        requestedBy: { id: `usr-${r.dem_id}`, fullName: r.dem_nom, position: r.dem_poste },
        assignedTo: r.tech_id ? { id: `usr-${r.tech_id}`, fullName: r.tech_nom } : null,
        assignedBy: r.sup_id ? { id: `usr-${r.sup_id}`, fullName: r.sup_nom } : null,
        stockAvailability: {
            availableCount,
            hasStock: availableCount > 0,
        },
    }
}

function mapMaintenanceTicketRow(r) {
    return {
        id: `mnt-${r.id}`,
        type: r.type_maintenance,
        description: r.description_panne,
        startDate: r.date_debut,
        endDate: r.date_fin,
        cost: r.cout_reparation,
        technician: r.technicien,
        partsUsed: r.pieces_utilisees,
        status: r.statut,
        createdAt: r.date_creation,
        asset: {
            id: `ast-${r.eq_id}`,
            assetTag: r.code_inventaire,
            category: r.categorie,
            brand: r.marque,
            model: r.modele,
        },
    }
}

function mapMaintenanceAsset(row) {
    return row ? {
        assetDbId: row.assetDbId,
        assetId: row.assetId,
        assetTag: row.assetTag,
        assetStatus: row.assetStatus,
    } : null
}

async function resolveMaintenanceAsset(pool, requestRow) {
    const category = requestRow.categorie_actif || requestRow.objet || null
    if (String(category || '').toUpperCase() !== 'MAINTENANCE') return null

    const specs = requestRow.specifications && typeof requestRow.specifications === 'object'
        ? requestRow.specifications
        : {}
    const rawAssetId = specs.assetId || specs.asset_id || null
    const cleanAssetId = parsePrefixedId(rawAssetId, 'ast')

    if (!cleanAssetId) {
        return {
            assetDbId: null,
            assetId: null,
            assetTag: null,
            assetStatus: null,
        }
    }

    const { rows } = await pool.query(
        'SELECT id, code_inventaire, etat FROM equipements WHERE id = $1',
        [cleanAssetId],
    )

    if (!rows.length) {
        return {
            assetDbId: null,
            assetId: `ast-${cleanAssetId}`,
            assetTag: null,
            assetStatus: null,
        }
    }

    const asset = rows[0]
    return {
        assetDbId: asset.id,
        assetId: `ast-${asset.id}`,
        assetTag: asset.code_inventaire,
        assetStatus: asset.etat,
    }
}

async function getStockCounts(pool) {
    const { rows } = await pool.query(`
        SELECT categorie, COUNT(*)::int AS count
        FROM equipements
        WHERE etat = 'IN_STOCK'
        GROUP BY categorie
    `)

    const counts = { __total: 0 }
    for (const row of rows) {
        counts[row.categorie] = Number(row.count)
        counts.__total += Number(row.count)
    }
    return counts
}

// GET /api/requests
router.get('/', async (req, res) => {
    try {
        const { status, priority } = req.query
        const pool = getPool()
        const stockCounts = await getStockCounts(pool)
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
            if (tech.rows.length && (!status || status === 'PENDING')) {
                conditions.push(`(d.id_technicien_assigne = $${idx} OR d.statut = 'PENDING')`)
                params.push(tech.rows[0].id); idx++
            }
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

        const { rows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes,
                   d.categorie_actif, d.specifications,
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

        const data = await Promise.all(rows.map(async (r) => {
            const requestData = mapRequestRow(r, stockCounts)
            requestData.maintenanceAsset = mapMaintenanceAsset(await resolveMaintenanceAsset(pool, r))
            return requestData
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
        const cleanId = parsePrefixedId(req.params.id, 'req')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de demande invalide.' })
        const pool = getPool()
        const stockCounts = await getStockCounts(pool)

        const { rows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes,
                   d.categorie_actif, d.specifications,
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

        const data = mapRequestRow(r, stockCounts)

        const { rows: maintenanceRows } = await pool.query(`
            SELECT m.id, m.type_maintenance, m.description_panne, m.date_debut, m.date_fin,
                   m.cout_reparation, m.technicien, m.pieces_utilisees, m.statut, m.date_creation,
                   e.id as eq_id, e.code_inventaire, e.categorie, e.marque, e.modele
            FROM maintenance m
            JOIN equipements e ON m.id_equipement = e.id
            WHERE m.id_demande = $1
            ORDER BY m.date_creation DESC
            LIMIT 1
        `, [cleanId])
        data.maintenanceTicket = maintenanceRows[0] ? mapMaintenanceTicketRow(maintenanceRows[0]) : null
        data.maintenanceAsset = mapMaintenanceAsset(await resolveMaintenanceAsset(pool, r))

        // Fetch audit logs for this specific request
        const { rows: auditRows } = await pool.query(`
            SELECT a.id, a.type_action, a.description, a.date_action, u.nom_complet as user_nom
            FROM journal_audit a
            LEFT JOIN utilisateurs u ON a.id_utilisateur = u.id
            WHERE a.entite_type = 'DEMANDE' AND a.entite_id = $1
            ORDER BY a.date_action DESC
        `, [cleanId])

        data.history = auditRows.map(log => ({
            id: log.id,
            action: log.type_action,
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
        const { objet, description, priority, assetCategory, reason, specifications } = req.body
        const finalCategory = assetCategory || objet || null
        const finalObjet = objet || assetCategory || 'Demande Matériel'
        const finalDesc = description || reason || null
        const finalSpecifications = specifications && typeof specifications === 'object'
            ? specifications
            : typeof specifications === 'string'
                ? (() => { try { return JSON.parse(specifications) } catch { return null } })()
                : null
        const pool = getPool()

        const emp = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
        if (!emp.rows.length) return res.status(404).json({ success: false, message: 'Employé introuvable.' })

        if (String(finalCategory || '').toUpperCase() === 'MAINTENANCE') {
            const maintenanceSpecs = finalSpecifications || {}
            const rawAssetId = maintenanceSpecs.assetId || maintenanceSpecs.asset_id || null
            const cleanAssetId = parsePrefixedId(rawAssetId, 'ast')
            if (!cleanAssetId) {
                return res.status(409).json({ success: false, message: 'La demande de maintenance doit préciser un équipement affecté.' })
            }

            const assignedAsset = await pool.query(
                `SELECT a.id, e.id as asset_id
                 FROM affectations a
                 JOIN equipements e ON a.id_equipement = e.id
                 JOIN employes em ON a.id_employe = em.id
                 WHERE a.statut = 'ACTIVE'
                   AND e.id = $1
                   AND em.id = $2`,
                [cleanAssetId, emp.rows[0].id]
            )
            if (!assignedAsset.rows.length) {
                return res.status(409).json({ success: false, message: 'Cet équipement n’est pas affecté à votre compte.' })
            }
        }

        const year = new Date().getFullYear()
        const seq = await pool.query(`SELECT COUNT(*) FROM demandes WHERE EXTRACT(YEAR FROM date_demande) = $1`, [year])
        const num = `REQ-${year}-${String(parseInt(seq.rows[0].count) + 1).padStart(4, '0')}`

        const { rows } = await pool.query(
            `INSERT INTO demandes (num_demande, objet, categorie_actif, description, specifications, priorite, id_demandeur) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [num, finalObjet, finalCategory, finalDesc, finalSpecifications, priority || 'MEDIUM', emp.rows[0].id]
        )

        await logAudit({ action: 'CREATE', entityType: 'DEMANDE', entityId: rows[0].id, description: `Ticket créé: ${num}`, userId: req.user?.id })
        const { rows: createdRows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes, d.categorie_actif, d.specifications,
                   dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                   tech.id as tech_id, tech.nom_complet as tech_nom,
                   sup.id as sup_id, sup.nom_complet as sup_nom
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
            LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
            WHERE d.id = $1
        `, [rows[0].id])

        res.status(201).json({ success: true, data: mapRequestRow(createdRows[0]), message: 'Demande soumise avec succès.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PUT /api/requests/:id
router.put('/:id', async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'req')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de demande invalide.' })
        const { status, notes, description, priority, specifications } = req.body
        const pool = getPool()

        const existing = await pool.query('SELECT id FROM demandes WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })

        const currentRequest = await pool.query('SELECT categorie_actif, objet, statut, description, notes, specifications, id_demandeur, num_demande FROM demandes WHERE id = $1', [cleanId])
        const requestData = currentRequest.rows[0]
        const requestCategory = requestData?.categorie_actif || requestData?.objet || null
        const requestSpecifications = requestData?.specifications && typeof requestData.specifications === 'object'
            ? requestData.specifications
            : {}

        if (status === 'ASSIGNED') {
            if (String(requestCategory).toUpperCase() === 'MAINTENANCE') {
                const maintenanceAsset = await resolveMaintenanceAsset(pool, requestData)
                if (!maintenanceAsset?.assetId) {
                    return res.status(409).json({ success: false, message: 'La demande de maintenance doit preciser un equipement.' })
                }

                const existingTicket = await pool.query('SELECT id FROM maintenance WHERE id_demande = $1', [cleanId])
                if (!existingTicket.rows.length) {
                    const maintenanceType = ['PREVENTIVE', 'CORRECTIVE', 'UPGRADE', 'INSPECTION'].includes(String(requestSpecifications.maintenanceType || '').toUpperCase())
                        ? String(requestSpecifications.maintenanceType).toUpperCase()
                        : 'CORRECTIVE'

                    const { rows: maintenanceRows } = await pool.query(
                        `INSERT INTO maintenance (id_equipement, type_maintenance, description_panne, date_debut, technicien, statut, id_demande)
                         VALUES ($1,$2,$3,$4,$5,'SCHEDULED',$6) RETURNING id`,
                        [
                            maintenanceAsset.assetDbId,
                            maintenanceType,
                            requestData.description || requestData.notes || null,
                            new Date().toISOString().split('T')[0],
                            null,
                            cleanId,
                        ]
                    )

                    await pool.query(`UPDATE equipements SET etat = 'IN_MAINTENANCE', date_modification = NOW() WHERE id = $1`, [maintenanceAsset.assetDbId])

                    await logAudit({
                        action: 'CREATE',
                        entityType: 'MAINTENANCE',
                        entityId: maintenanceRows[0].id,
                        description: `Ticket maintenance créé depuis la demande ${cleanId}`,
                        userId: req.user?.id,
                    })
                }

                await pool.query(
                    `UPDATE demandes
                     SET statut = 'RESOLVED',
                         date_resolution = NOW(),
                         notes = COALESCE($1, notes)
                     WHERE id = $2`,
                    [notes || 'Demande de maintenance acceptée et ticket créé.', cleanId]
                )

                await logAudit({
                    action: 'RESOLVE',
                    entityType: 'DEMANDE',
                    entityId: Number(cleanId),
                    description: `Demande de maintenance transformée en ticket`,
                    userId: req.user?.id,
                })

                const { rows: updatedRows } = await pool.query(`
                    SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                           d.date_demande, d.date_resolution, d.notes, d.categorie_actif, d.specifications,
                           dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                           tech.id as tech_id, tech.nom_complet as tech_nom,
                           sup.id as sup_id, sup.nom_complet as sup_nom
                    FROM demandes d
                    JOIN employes dem ON d.id_demandeur = dem.id
                    LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
                    LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
                    WHERE d.id = $1
                `, [cleanId])

                const { rows: ticketRows } = await pool.query(`
                    SELECT m.id, m.type_maintenance, m.description_panne, m.date_debut, m.date_fin,
                           m.cout_reparation, m.technicien, m.pieces_utilisees, m.statut, m.date_creation,
                           e.id as eq_id, e.code_inventaire, e.categorie, e.marque, e.modele
                    FROM maintenance m
                    JOIN equipements e ON m.id_equipement = e.id
                    WHERE m.id_demande = $1
                    ORDER BY m.date_creation DESC
                    LIMIT 1
                `, [cleanId])

                const responseData = mapRequestRow(updatedRows[0])
                responseData.maintenanceTicket = ticketRows[0] ? mapMaintenanceTicketRow(ticketRows[0]) : null
                return res.json({ success: true, data: responseData, message: 'Demande de maintenance acceptee. Ticket cree.' })
            } else {
                const stockQuery = requestCategory
                    ? await pool.query('SELECT COUNT(*)::int AS count FROM equipements WHERE etat = $1 AND categorie = $2', ['IN_STOCK', requestCategory])
                    : await pool.query('SELECT COUNT(*)::int AS count FROM equipements WHERE etat = $1', ['IN_STOCK'])
                if ((stockQuery.rows[0]?.count || 0) <= 0) {
                    return res.status(409).json({ success: false, message: 'Aucun equipement disponible en stock pour accepter cette demande.' })
                }
            }
        }

        const finalSpecifications = specifications && typeof specifications === 'object'
            ? specifications
            : typeof specifications === 'string'
                ? (() => { try { return JSON.parse(specifications) } catch { return null } })()
                : null

        await pool.query(
            `UPDATE demandes
             SET statut = COALESCE($1, statut),
                 notes = COALESCE($2, notes),
                 description = COALESCE($3, description),
                 priorite = COALESCE($4, priorite),
                 specifications = COALESCE($5, specifications)
             WHERE id = $6`,
            [status || null, notes || null, description || null, priority || null, finalSpecifications, cleanId]
        )

        const { rows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes, d.categorie_actif, d.specifications,
                   dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                   tech.id as tech_id, tech.nom_complet as tech_nom,
                   sup.id as sup_id, sup.nom_complet as sup_nom
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
            LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
            WHERE d.id = $1
        `, [cleanId])

        await logAudit({ action: 'UPDATE', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket mis à jour n°${cleanId}`, userId: req.user?.id })
        const responseData = mapRequestRow(rows[0])
        const { rows: maintenanceRows } = await pool.query(`
            SELECT m.id, m.type_maintenance, m.description_panne, m.date_debut, m.date_fin,
                   m.cout_reparation, m.technicien, m.pieces_utilisees, m.statut, m.date_creation,
                   e.id as eq_id, e.code_inventaire, e.categorie, e.marque, e.modele
            FROM maintenance m
            JOIN equipements e ON m.id_equipement = e.id
            WHERE m.id_demande = $1
            ORDER BY m.date_creation DESC
            LIMIT 1
        `, [cleanId])
        responseData.maintenanceTicket = maintenanceRows[0] ? mapMaintenanceTicketRow(maintenanceRows[0]) : null
        res.json({ success: true, data: responseData })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/requests/:id/assign — SUPERVISOR, ADMIN
router.patch('/:id/assign', requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'req')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de demande invalide.' })
        const { assignedToId } = req.body
        const pool = getPool()

        const assignant = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
        if (!assignedToId) return res.status(400).json({ success: false, message: 'Identifiant technicien requis.' })
        const techId = parsePrefixedId(assignedToId, assignedToId.toString().startsWith('emp') ? 'emp' : 'usr')
        if (!techId) return res.status(400).json({ success: false, message: 'Identifiant technicien invalide.' })

        const demande = await pool.query('SELECT id FROM demandes WHERE id = $1', [cleanId])
        if (!demande.rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })

        const techExists = await pool.query('SELECT id FROM employes WHERE id = $1', [techId])
        if (!techExists.rows.length) return res.status(404).json({ success: false, message: 'Technicien introuvable.' })

        await pool.query(
            `UPDATE demandes SET statut = 'ASSIGNED', id_technicien_assigne = $1, id_superviseur_assignant = $2 WHERE id = $3`,
            [techId, assignant.rows[0]?.id || null, cleanId]
        )

        await logAudit({ action: 'ASSIGN', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket assigné n°${cleanId}`, userId: req.user?.id })
        const { rows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes, d.categorie_actif, d.specifications,
                   dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                   tech.id as tech_id, tech.nom_complet as tech_nom,
                   sup.id as sup_id, sup.nom_complet as sup_nom
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
            LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
            WHERE d.id = $1
        `, [cleanId])
        res.json({ success: true, data: mapRequestRow(rows[0]), message: 'Demande assignée.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// PATCH /api/requests/:id/resolve — TECHNICIAN, ADMIN
router.patch('/:id/resolve', requireRole('TECHNICIAN', 'ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'req')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de demande invalide.' })
        const { notes } = req.body
        const pool = getPool()

        const { rows: requestRows } = await pool.query('SELECT * FROM demandes WHERE id = $1', [cleanId])
        if (!requestRows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })

        if (req.user?.role !== 'ADMIN') {
            const tech = await pool.query('SELECT id FROM employes WHERE email = $1', [req.user.email])
            if (requestRows[0].id_technicien_assigne !== tech.rows[0]?.id)
                return res.status(403).json({ success: false, message: 'Non autorisé.' })
        }

        await pool.query(
            `UPDATE demandes SET statut = 'RESOLVED', date_resolution = NOW(), notes = $1 WHERE id = $2`,
            [notes || null, cleanId]
        )

        await logAudit({ action: 'RESOLVE', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket résolu n°${cleanId}`, userId: req.user?.id })
        const { rows: updatedRows } = await pool.query(`
            SELECT d.id, d.num_demande, d.objet, d.description, d.priorite, d.statut,
                   d.date_demande, d.date_resolution, d.notes, d.categorie_actif, d.specifications,
                   dem.id as dem_id, dem.nom_complet as dem_nom, dem.poste_occupe as dem_poste,
                   tech.id as tech_id, tech.nom_complet as tech_nom,
                   sup.id as sup_id, sup.nom_complet as sup_nom
            FROM demandes d
            JOIN employes dem ON d.id_demandeur = dem.id
            LEFT JOIN employes tech ON d.id_technicien_assigne = tech.id
            LEFT JOIN employes sup ON d.id_superviseur_assignant = sup.id
            WHERE d.id = $1
        `, [cleanId])
        res.json({ success: true, data: mapRequestRow(updatedRows[0]), message: 'Demande clôturée.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

// DELETE /api/requests/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const cleanId = parsePrefixedId(req.params.id, 'req')
        if (!cleanId) return res.status(400).json({ success: false, message: 'Identifiant de demande invalide.' })
        const pool = getPool()
        const existing = await pool.query('SELECT id FROM demandes WHERE id = $1', [cleanId])
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Demande introuvable.' })
        await pool.query('DELETE FROM demandes WHERE id = $1', [cleanId])
        await logAudit({ action: 'DELETE', entityType: 'DEMANDE', entityId: Number(cleanId), description: `Ticket supprimé: ${cleanId}`, userId: req.user?.id })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
