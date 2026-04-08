import { formatCurrency, formatDate } from '@/lib/utils.js'

const ASSET_STATUS_LABELS = {
    EN_SERVICE: 'En service',
    IN_STOCK: 'En stock',
    ASSIGNED: 'Affecté',
    IN_MAINTENANCE: 'En maintenance',
    EN_PANNE: 'En panne',
    REMPLACEMENT: 'Remplacement',
    RETIRED: 'Retiré',
    LOST: 'Perdu',
    RESERVED: 'Réservé',
}

const LICENSE_COMPLIANCE_LABELS = {
    COMPLIANT: 'Conforme',
    OVER_LICENSED: 'Sous-utilisée',
    UNDER_LICENSED: 'Sur-utilisée',
    EXPIRED: 'Expirée',
    NON_COMPLIANT: 'Non conforme',
    UNKNOWN: 'Non défini',
}

const MAINTENANCE_STATUS_LABELS = {
    SCHEDULED: 'Planifié',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
}

const REQUEST_STATUS_LABELS = {
    PENDING: 'En attente',
    ASSIGNED: 'Acceptée',
    RESOLVED: 'Résolue',
    REJECTED: 'Refusée',
    CANCELLED: 'Annulée',
}

const formatCount = (items, selector) => {
    const map = new Map()
    items.forEach((item) => {
        const key = selector(item) || 'Autre'
        map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count }))
}

const formatMoney = (value) => formatCurrency(Number(value) || 0)

const countBy = (items, selector) => formatCount(items, selector)

const sumBy = (items, selector) => items.reduce((total, item) => total + (Number(selector(item)) || 0), 0)

const text = (value, fallback = '—') => {
    if (value === null || value === undefined || value === '') return fallback
    return String(value)
}

const truncate = (value, max = 54) => {
    const str = text(value, '')
    if (!str) return '—'
    return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

function buildSummaryRows(rows, columns) {
    return rows.map((row) => {
        const mapped = {}
        columns.forEach((column) => {
            mapped[column.key] = column.map ? column.map(row) : row[column.key]
        })
        return mapped
    })
}

function topRows(items, limit = 20) {
    return items.slice(0, limit)
}

function assetBaseRows(assets) {
    return buildSummaryRows(topRows(assets, 30), [
        { key: 'assetTag', map: (asset) => text(asset.assetTag) },
        { key: 'category', map: (asset) => text(asset.category) },
        { key: 'designation', map: (asset) => `${truncate(asset.brand, 28)} ${truncate(asset.model, 28)}`.trim() },
        { key: 'serialNumber', map: (asset) => text(asset.serialNumber) },
        { key: 'assignedTo', map: (asset) => asset.assignedTo?.fullName ? `${asset.assignedTo.fullName}${asset.assignedTo.department?.name ? ` (${asset.assignedTo.department.name})` : ''}` : 'Non affecté' },
        { key: 'status', map: (asset) => ASSET_STATUS_LABELS[asset.status] || text(asset.status) },
    ])
}

function maintenanceRows(tickets) {
    return buildSummaryRows(topRows(tickets, 30), [
        { key: 'ticket', map: (ticket) => text(ticket.id) },
        { key: 'assetTag', map: (ticket) => ticket.asset?.assetTag || '—' },
        { key: 'category', map: (ticket) => ticket.asset?.category || '—' },
        { key: 'description', map: (ticket) => truncate(ticket.description, 48) },
        { key: 'status', map: (ticket) => MAINTENANCE_STATUS_LABELS[ticket.status] || text(ticket.status) },
        { key: 'technician', map: (ticket) => text(ticket.technician) },
        { key: 'startDate', map: (ticket) => formatDate(ticket.startDate) },
    ])
}

function assignmentRows(assignments) {
    return buildSummaryRows(topRows(assignments, 30), [
        { key: 'assignment', map: (assignment) => text(assignment.id) },
        { key: 'assetTag', map: (assignment) => assignment.asset?.assetTag || '—' },
        { key: 'asset', map: (assignment) => `${truncate(assignment.asset?.brand, 20)} ${truncate(assignment.asset?.model, 20)}`.trim() },
        { key: 'employee', map: (assignment) => text(assignment.employee?.fullName) },
        { key: 'department', map: (assignment) => assignment.employee?.structure || assignment.employee?.position || '—' },
        { key: 'status', map: (assignment) => assignment.status === 'ACTIVE' ? 'Actif' : 'Retourné' },
        { key: 'assignedAt', map: (assignment) => formatDate(assignment.assignedAt) },
    ])
}

function licenseRows(licenses) {
    return buildSummaryRows(topRows(licenses, 30), [
        { key: 'software', map: (license) => text(license.softwareName) },
        { key: 'vendor', map: (license) => text(license.vendor || license.publisher) },
        { key: 'seats', map: (license) => `${Number(license.usedSeats || 0)}/${Number(license.totalSeats || 0)}` },
        { key: 'cost', map: (license) => formatMoney(license.cost || license.annualCost) },
        { key: 'expiry', map: (license) => formatDate(license.expiryDate || license.expirationDate) },
        { key: 'compliance', map: (license) => LICENSE_COMPLIANCE_LABELS[license.complianceStatus] || text(license.complianceStatus) },
    ])
}

function auditRows(entries) {
    return buildSummaryRows(topRows(entries, 40), [
        { key: 'timestamp', map: (entry) => formatDate(entry.performedAt, 'dd/MM/yyyy HH:mm') },
        { key: 'user', map: (entry) => entry.performedBy?.fullName || 'Système' },
        { key: 'action', map: (entry) => text(entry.action) },
        { key: 'entity', map: (entry) => text(entry.entityType) },
        { key: 'description', map: (entry) => truncate(entry.description, 70) },
    ])
}

function metric(label, value, hint = '') {
    return { label, value: text(value), hint }
}

function sectionsForBreakdown(title, items, labelKey = 'label', valueKey = 'count') {
    return {
        title,
        columns: [
            { key: labelKey, label: 'Libellé', flex: 2 },
            { key: valueKey, label: 'Total', flex: 1, align: 'right' },
        ],
        rows: items.map((item) => ({ [labelKey]: item.label, [valueKey]: item.count })),
        emptyMessage: 'Aucune donnée disponible.',
    }
}

export function buildReportPayload(reportType, datasets, context = {}) {
    const {
        assets = [],
        licenses = [],
        maintenances = [],
        assignments = [],
        audit = [],
    } = datasets || {}

    const reportLabel = context.reportLabel || 'Rapport'
    const periodLabel = context.periodLabel || 'Période courante'
    const generatedAt = context.generatedAt ? formatDate(context.generatedAt, 'dd/MM/yyyy HH:mm') : formatDate(new Date().toISOString(), 'dd/MM/yyyy HH:mm')

    if (reportType === 'assets') {
        const byCategory = countBy(assets, (asset) => asset.category || 'Autre')
        const byStatus = countBy(assets, (asset) => ASSET_STATUS_LABELS[asset.status] || asset.status || 'Autre')
        const assignedCount = assets.filter((asset) => asset.status === 'ASSIGNED' || asset.assignedTo).length
        return {
            reportType,
            title: reportLabel,
            subtitle: 'Inventaire consolidé du parc informatique',
            periodLabel,
            generatedAt,
            metrics: [
                metric('Total actifs', assets.length),
                metric('En stock', assets.filter((asset) => asset.status === 'IN_STOCK').length),
                metric('Affectés', assignedCount),
                metric('En maintenance', assets.filter((asset) => asset.status === 'IN_MAINTENANCE').length),
            ],
            sections: [
                sectionsForBreakdown('Répartition par catégorie', byCategory),
                sectionsForBreakdown('Répartition par statut', byStatus),
                {
                    title: 'Détail des actifs',
                    columns: [
                        { key: 'assetTag', label: 'Tag', flex: 1.2 },
                        { key: 'category', label: 'Catégorie', flex: 1.1 },
                        { key: 'designation', label: 'Désignation', flex: 2 },
                        { key: 'serialNumber', label: 'N° série', flex: 1.4 },
                        { key: 'assignedTo', label: 'Affecté à', flex: 1.8 },
                        { key: 'status', label: 'Statut', flex: 1.2 },
                    ],
                    rows: assetBaseRows(assets),
                    emptyMessage: 'Aucun actif à afficher.',
                },
            ],
        }
    }

    if (reportType === 'licenses') {
        const byCompliance = countBy(licenses, (license) => LICENSE_COMPLIANCE_LABELS[license.complianceStatus] || license.complianceStatus || 'Autre')
        const usedSeats = sumBy(licenses, (license) => license.usedSeats ?? license.seatsUsed ?? 0)
        const totalSeats = sumBy(licenses, (license) => license.totalSeats ?? license.seatsLicensed ?? 0)
        const expiringSoon = licenses.filter((license) => {
            const expiry = license.expiryDate || license.expirationDate
            if (!expiry) return false
            const expiryDate = new Date(expiry)
            const in30Days = new Date()
            in30Days.setDate(in30Days.getDate() + 30)
            return expiryDate <= in30Days && expiryDate > new Date()
        }).length
        const expired = licenses.filter((license) => {
            const expiry = license.expiryDate || license.expirationDate
            return expiry ? new Date(expiry) <= new Date() : false
        }).length
        return {
            reportType,
            title: reportLabel,
            subtitle: 'Suivi des licences logicielles et de la conformité',
            periodLabel,
            generatedAt,
            metrics: [
                metric('Total licences', licenses.length),
                metric('Expirent < 30 j', expiringSoon + expired),
                metric('Postes utilisés', `${usedSeats}/${totalSeats}`),
                metric('Conformes', licenses.filter((license) => license.complianceStatus === 'COMPLIANT').length),
            ],
            sections: [
                sectionsForBreakdown('Répartition par conformité', byCompliance),
                {
                    title: 'Détail des licences',
                    columns: [
                        { key: 'software', label: 'Logiciel', flex: 2 },
                        { key: 'vendor', label: 'Éditeur', flex: 1.3 },
                        { key: 'seats', label: 'Postes', flex: 0.9, align: 'center' },
                        { key: 'cost', label: 'Coût', flex: 1, align: 'right' },
                        { key: 'expiry', label: 'Expiration', flex: 1.1 },
                        { key: 'compliance', label: 'Conformité', flex: 1.2 },
                    ],
                    rows: licenseRows(licenses),
                    emptyMessage: 'Aucune licence à afficher.',
                },
            ],
        }
    }

    if (reportType === 'maintenance') {
        const byStatus = countBy(maintenances, (ticket) => MAINTENANCE_STATUS_LABELS[ticket.status] || ticket.status || 'Autre')
        const byType = countBy(maintenances, (ticket) => ticket.type || 'Autre')
        return {
            reportType,
            title: reportLabel,
            subtitle: 'Historique des tickets et suivi opérationnel',
            periodLabel,
            generatedAt,
            metrics: [
                metric('Total tickets', maintenances.length),
                metric('Planifiés', maintenances.filter((ticket) => ticket.status === 'SCHEDULED').length),
                metric('En cours', maintenances.filter((ticket) => ticket.status === 'IN_PROGRESS').length),
                metric('Terminés', maintenances.filter((ticket) => ticket.status === 'COMPLETED').length),
            ],
            sections: [
                sectionsForBreakdown('Répartition par statut', byStatus),
                sectionsForBreakdown('Répartition par type', byType),
                {
                    title: 'Détail des tickets',
                    columns: [
                        { key: 'ticket', label: 'Ticket', flex: 1 },
                        { key: 'assetTag', label: 'Actif', flex: 1.2 },
                        { key: 'category', label: 'Catégorie', flex: 1 },
                        { key: 'description', label: 'Description', flex: 2 },
                        { key: 'status', label: 'Statut', flex: 1 },
                        { key: 'technician', label: 'Technicien', flex: 1.2 },
                        { key: 'startDate', label: 'Date', flex: 1 },
                    ],
                    rows: maintenanceRows(maintenances),
                    emptyMessage: 'Aucun ticket de maintenance à afficher.',
                },
            ],
        }
    }

    if (reportType === 'assignments') {
        const activeAssignments = assignments.filter((assignment) => assignment.status === 'ACTIVE')
        const returnedAssignments = assignments.filter((assignment) => assignment.status !== 'ACTIVE')
        const departments = countBy(assignments, (assignment) => assignment.employee?.structure || assignment.employee?.position || 'Autre')
        return {
            reportType,
            title: reportLabel,
            subtitle: 'Attributions d’équipements et historique des retours',
            periodLabel,
            generatedAt,
            metrics: [
                metric('Total affectations', assignments.length),
                metric('Actives', activeAssignments.length),
                metric('Retournées', returnedAssignments.length),
                metric('Départements', departments.length),
            ],
            sections: [
                sectionsForBreakdown('Répartition par structure', departments),
                {
                    title: 'Détail des affectations',
                    columns: [
                        { key: 'assignment', label: 'Affectation', flex: 1 },
                        { key: 'assetTag', label: 'Actif', flex: 1.1 },
                        { key: 'asset', label: 'Équipement', flex: 1.8 },
                        { key: 'employee', label: 'Employé', flex: 1.4 },
                        { key: 'department', label: 'Structure', flex: 1.3 },
                        { key: 'status', label: 'Statut', flex: 0.9, align: 'center' },
                        { key: 'assignedAt', label: 'Date', flex: 1 },
                    ],
                    rows: assignmentRows(assignments),
                    emptyMessage: 'Aucune affectation à afficher.',
                },
            ],
        }
    }

    if (reportType === 'financial') {
        const assetValue = sumBy(assets, (asset) => asset.purchasePrice || asset.currentValue || 0)
        const licenseCost = sumBy(licenses, (license) => license.cost || license.annualCost || 0)
        const maintenanceCost = sumBy(maintenances, (ticket) => ticket.cost || 0)
        const activeAssignments = assignments.filter((assignment) => assignment.status === 'ACTIVE').length
        const byCategoryValue = countBy(assets, (asset) => asset.category || 'Autre').map((item) => ({
            label: item.label,
            count: formatMoney(assets.filter((asset) => (asset.category || 'Autre') === item.label).reduce((sum, asset) => sum + (Number(asset.purchasePrice || asset.currentValue || 0) || 0), 0)),
        }))
        const byVendorCost = countBy(licenses, (license) => license.vendor || license.publisher || 'Autre').map((item) => ({
            label: item.label,
            count: formatMoney(licenses.filter((license) => (license.vendor || license.publisher || 'Autre') === item.label).reduce((sum, license) => sum + (Number(license.cost || license.annualCost || 0) || 0), 0)),
        }))
        const byMaintenanceStatusCost = countBy(maintenances, (ticket) => MAINTENANCE_STATUS_LABELS[ticket.status] || ticket.status || 'Autre').map((item) => ({
            label: item.label,
            count: formatMoney(maintenances.filter((ticket) => (MAINTENANCE_STATUS_LABELS[ticket.status] || ticket.status || 'Autre') === item.label).reduce((sum, ticket) => sum + (Number(ticket.cost || 0) || 0), 0)),
        }))

        return {
            reportType,
            title: reportLabel,
            subtitle: 'Vue consolidée des dépenses et de l’exposition du parc',
            periodLabel,
            generatedAt,
            metrics: [
                metric('Valeur du parc', formatMoney(assetValue)),
                metric('Coût licences', formatMoney(licenseCost)),
                metric('Coût maintenance', formatMoney(maintenanceCost)),
                metric('Affectations actives', activeAssignments),
            ],
            sections: [
                {
                    title: 'Valeur du parc par catégorie',
                    columns: [
                        { key: 'label', label: 'Catégorie', flex: 2 },
                        { key: 'count', label: 'Valeur', flex: 1, align: 'right' },
                    ],
                    rows: byCategoryValue,
                    emptyMessage: 'Aucune valeur disponible.',
                },
                {
                    title: 'Coût licences par fournisseur',
                    columns: [
                        { key: 'label', label: 'Fournisseur', flex: 2 },
                        { key: 'count', label: 'Coût', flex: 1, align: 'right' },
                    ],
                    rows: byVendorCost,
                    emptyMessage: 'Aucun coût licence disponible.',
                },
                {
                    title: 'Coût maintenance par statut',
                    columns: [
                        { key: 'label', label: 'Statut', flex: 2 },
                        { key: 'count', label: 'Coût', flex: 1, align: 'right' },
                    ],
                    rows: byMaintenanceStatusCost,
                    emptyMessage: 'Aucun coût de maintenance disponible.',
                },
            ],
        }
    }

    if (reportType === 'audit') {
        const byAction = countBy(audit, (entry) => text(entry.action, 'Autre'))
        const byEntity = countBy(audit, (entry) => text(entry.entityType, 'Autre'))
        return {
            reportType,
            title: reportLabel,
            subtitle: 'Journal complet des opérations système',
            periodLabel,
            generatedAt,
            metrics: [
                metric('Entrées', audit.length),
                metric('Créations', audit.filter((entry) => entry.action === 'CREATE').length),
                metric('Mises à jour', audit.filter((entry) => entry.action === 'UPDATE').length),
                metric('Suppressions', audit.filter((entry) => entry.action === 'DELETE').length),
            ],
            sections: [
                sectionsForBreakdown('Répartition par action', byAction),
                sectionsForBreakdown('Répartition par entité', byEntity),
                {
                    title: 'Dernières entrées',
                    columns: [
                        { key: 'timestamp', label: 'Date', flex: 1.4 },
                        { key: 'user', label: 'Utilisateur', flex: 1.3 },
                        { key: 'action', label: 'Action', flex: 0.9 },
                        { key: 'entity', label: 'Entité', flex: 1 },
                        { key: 'description', label: 'Description', flex: 3 },
                    ],
                    rows: auditRows(audit),
                    emptyMessage: 'Aucune entrée d’audit à afficher.',
                },
            ],
        }
    }

    return {
        reportType,
        title: reportLabel,
        subtitle: 'Rapport administratif',
        periodLabel,
        generatedAt,
        metrics: [],
        sections: [],
    }
}
