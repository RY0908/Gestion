import { getPool } from '../db/index.js'

function formatDate(value) {
    if (!value) return 'Maintenant'
    try {
        return new Date(value).toLocaleDateString('fr-FR')
    } catch {
        return 'Maintenant'
    }
}

export async function buildNotifications() {
    const pool = getPool()
    const notifications = []
    let id = 1

    const { rows: licenses } = await pool.query(
        `SELECT nom_logiciel, statut_conformite, date_expiration
         FROM licences
         WHERE statut_conformite != 'COMPLIANT'
         ORDER BY date_expiration NULLS LAST, nom_logiciel`
    )

    for (const license of licenses) {
        notifications.push({
            id: id++,
            category: 'license',
            read: false,
            title: `Licence non conforme: ${license.nom_logiciel}`,
            desc: `Statut: ${license.statut_conformite}${license.date_expiration ? ` - expiration le ${formatDate(license.date_expiration)}` : ''}`,
            time: license.date_expiration ? formatDate(license.date_expiration) : 'Maintenant',
            user: 'Systeme',
        })
    }

    const { rows: maintenances } = await pool.query(
        `SELECT m.id, e.code_inventaire, e.marque, e.modele, m.description_panne, m.date_creation
         FROM maintenance m
         JOIN equipements e ON e.id = m.id_equipement
         WHERE m.statut IN ('SCHEDULED', 'IN_PROGRESS')
         ORDER BY m.date_creation DESC
         LIMIT 8`
    )

    for (const maintenance of maintenances) {
        notifications.push({
            id: id++,
            category: 'maintenance',
            read: false,
            title: `Ticket maintenance ouvert - ${maintenance.marque} ${maintenance.modele}`,
            desc: maintenance.description_panne || `Equipement ${maintenance.code_inventaire}`,
            time: formatDate(maintenance.date_creation),
            user: 'Systeme',
        })
    }

    const { rows: requests } = await pool.query(
        `SELECT num_demande, objet, priorite, date_demande
         FROM demandes
         WHERE statut = 'PENDING'
         ORDER BY date_demande DESC
         LIMIT 8`
    )

    for (const request of requests) {
        notifications.push({
            id: id++,
            category: 'request',
            read: false,
            title: `Demande en attente de traitement`,
            desc: `${request.num_demande} - ${request.objet} (priorite: ${request.priorite})`,
            time: formatDate(request.date_demande),
            user: 'Systeme',
        })
    }

    const { rows: refusals } = await pool.query(
        `SELECT d.num_demande, d.notes, d.date_demande, d.date_resolution, e.code_inventaire
         FROM demandes d
         LEFT JOIN maintenance m ON m.id_demande = d.id
         LEFT JOIN equipements e ON e.id = m.id_equipement
         WHERE d.statut = 'REJECTED' AND d.categorie_actif = 'MAINTENANCE'
         ORDER BY d.date_resolution DESC NULLS LAST, d.date_demande DESC
         LIMIT 8`
    )

    for (const refusal of refusals) {
        notifications.push({
            id: id++,
            category: 'request',
            read: false,
            title: 'Demande de maintenance refusee',
            desc: `${refusal.num_demande}${refusal.code_inventaire ? ` - ${refusal.code_inventaire}` : ''}${refusal.notes ? ` (${refusal.notes})` : ''}`,
            time: formatDate(refusal.date_resolution || refusal.date_demande),
            user: 'Systeme',
        })
    }

    const { rows: overdueAssignments } = await pool.query(
        `SELECT e.code_inventaire, emp.nom_complet, a.date_affectation
         FROM affectations a
         JOIN equipements e ON e.id = a.id_equipement
         JOIN employes emp ON emp.id = a.id_employe
         WHERE a.statut = 'ACTIVE'
           AND a.date_affectation < NOW() - INTERVAL '6 months'
         ORDER BY a.date_affectation ASC
         LIMIT 8`
    )

    for (const overdue of overdueAssignments) {
        notifications.push({
            id: id++,
            category: 'assignment',
            read: false,
            title: `Affectation longue duree - ${overdue.code_inventaire}`,
            desc: `Affecte a ${overdue.nom_complet} depuis ${formatDate(overdue.date_affectation)}`,
            time: 'Verifier',
            user: 'Systeme',
        })
    }

    return notifications
}
