/** All possible application actions */
export const ACTIONS = {
    ASSET_CREATE: 'asset:create',
    ASSET_EDIT: 'asset:edit',
    ASSET_DELETE: 'asset:delete',
    ASSET_RETIRE: 'asset:retire',
    ASSET_ASSIGN: 'asset:assign',
    ASSET_VIEW: 'asset:view',
    REQUEST_MANAGE: 'request:manage',
    LICENSE_MANAGE: 'license:manage',
    MAINTENANCE_MANAGE: 'maintenance:manage',
    TICKET_ASSIGN: 'ticket:assign',
    TICKET_CREATE: 'ticket:create',
    TICKET_RESOLVE: 'ticket:resolve',
    USER_MANAGE: 'user:manage',
    REPORT_EXPORT: 'report:export',
    AUDIT_VIEW: 'audit:view',
    DOCUMENT_CREATE: 'document:create',
    DOCUMENT_SIGN: 'document:sign',
    DOCUMENT_MANAGE: 'document:manage',
}

const PERMISSIONS = {
    ADMIN: Object.values(ACTIONS),
    SUPERVISOR: [
        ACTIONS.ASSET_VIEW,
        ACTIONS.REQUEST_MANAGE,
        ACTIONS.TICKET_ASSIGN, ACTIONS.TICKET_CREATE,
        ACTIONS.REPORT_EXPORT, ACTIONS.MAINTENANCE_MANAGE,
        ACTIONS.DOCUMENT_CREATE, ACTIONS.DOCUMENT_SIGN,
    ],
    TECHNICIAN: [
        ACTIONS.ASSET_VIEW, ACTIONS.ASSET_CREATE, ACTIONS.ASSET_EDIT, ACTIONS.ASSET_ASSIGN,
        ACTIONS.TICKET_CREATE, ACTIONS.TICKET_RESOLVE, ACTIONS.MAINTENANCE_MANAGE,
        ACTIONS.DOCUMENT_CREATE, ACTIONS.DOCUMENT_SIGN,
    ],
    USER: [
        ACTIONS.ASSET_VIEW, ACTIONS.TICKET_CREATE, ACTIONS.DOCUMENT_CREATE,
    ],
}

/**
 * Check if a role can perform an action globally
 * @param {string} role - UserRole
 * @param {string} action - one of ACTIONS values
 * @returns {boolean}
 */
export function canDo(role, action) {
    if (!PERMISSIONS[role]) return false;
    return PERMISSIONS[role].includes(action);
}

/**
 * Matrix for Document Types Authorizations based on Sonatrach workflow
 * Specifies which roles can CREATE (Émetteur) and which can SIGN/VALIDATE (Récepteur/Signataire)
 */
export const DOCUMENT_AUTHORIZATIONS = {
    'DEMANDE_MATERIEL': { create: ['USER', 'ADMIN', 'SUPERVISOR'], sign: ['ADMIN'] },
    'FICHE_BESOIN': { create: ['SUPERVISOR', 'ADMIN'], sign: ['ADMIN'] },
    'BON_COMMANDE': { create: ['ADMIN', 'SUPERVISOR'], sign: ['ADMIN'] },
    'DECHARGE': { create: ['TECHNICIAN', 'ADMIN'], sign: ['USER', 'SUPERVISOR'] },
    'DEMANDE_INTERVENTION': { create: ['USER'], sign: ['SUPERVISOR', 'ADMIN'] },
    'FICHE_INTERVENTION': { create: ['SUPERVISOR', 'TECHNICIAN', 'ADMIN'], sign: ['USER', 'TECHNICIAN', 'SUPERVISOR'] },
    'RAPPORT_INTERVENTION': { create: ['TECHNICIAN', 'ADMIN'], sign: ['ADMIN', 'SUPERVISOR'] },
    'DEMANDE_REPARATION_GARANTIE': { create: ['TECHNICIAN', 'ADMIN'], sign: ['ADMIN'] },
    'DEMANDE_INVENTAIRE': { create: ['ADMIN', 'TECHNICIAN'], sign: ['TECHNICIAN', 'SUPERVISOR'] },
    'FICHE_INVENTAIRE': { create: ['TECHNICIAN', 'ADMIN'], sign: ['ADMIN'] },
    'RAPPORT_INVENTAIRE': { create: ['TECHNICIAN', 'ADMIN'], sign: ['ADMIN'] },
}

export function canCreateDocument(role, docType) {
    if (role === 'ADMIN') return true; // Admin has ultimate override usually, but strictly speaking we follow matrix:
    return DOCUMENT_AUTHORIZATIONS[docType]?.create?.includes(role) ?? false;
}

export function canSignDocument(role, docType) {
    if (role === 'ADMIN') return true;
    return DOCUMENT_AUTHORIZATIONS[docType]?.sign?.includes(role) ?? false;
}

/**
 * Contextual helpers
 */
export function canViewAsset(user, asset) {
    if (!user || !asset) return false
    if (canDo(user.role, ACTIONS.ASSET_VIEW) && ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'].includes(user.role)) return true
    
    // User can only view assets explicitly assigned to them
    return asset.assignedTo?.id === user.id || asset.assignedTo === user.id
}
