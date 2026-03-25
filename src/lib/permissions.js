/** All possible application actions */
export const ACTIONS = {
    ASSET_CREATE: 'asset:create',
    ASSET_EDIT: 'asset:edit',
    ASSET_DELETE: 'asset:delete',
    ASSET_RETIRE: 'asset:retire',
    ASSET_ASSIGN: 'asset:assign',
    ASSET_VIEW: 'asset:view',
    LICENSE_MANAGE: 'license:manage',
    MAINTENANCE_MANAGE: 'maintenance:manage',
    TICKET_ASSIGN: 'ticket:assign',
    TICKET_CREATE: 'ticket:create',
    TICKET_RESOLVE: 'ticket:resolve',
    USER_MANAGE: 'user:manage',
    REPORT_EXPORT: 'report:export',
    AUDIT_VIEW: 'audit:view',
}

const PERMISSIONS = {
    ADMIN: Object.values(ACTIONS),
    SUPERVISOR: [
        ACTIONS.ASSET_VIEW, ACTIONS.ASSET_EDIT,
        ACTIONS.TICKET_ASSIGN, ACTIONS.TICKET_CREATE,
        ACTIONS.REPORT_EXPORT, ACTIONS.MAINTENANCE_MANAGE,
    ],
    TECHNICIAN: [
        ACTIONS.ASSET_VIEW, ACTIONS.ASSET_EDIT, ACTIONS.ASSET_ASSIGN,
        ACTIONS.TICKET_RESOLVE, ACTIONS.MAINTENANCE_MANAGE,
    ],
    USER: [
        ACTIONS.ASSET_VIEW, ACTIONS.TICKET_CREATE,
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
    'DEMANDE_MATERIEL': { create: ['USER', 'ADMIN'], sign: ['ADMIN'] },
    'FICHE_BESOIN': { create: ['ADMIN'], sign: ['ADMIN'] },
    'BON_COMMANDE': { create: ['ADMIN'], sign: ['ADMIN'] }, // Fournisseur to Admin usually, but Admin logs it
    'DECHARGE': { create: ['TECHNICIAN', 'ADMIN'], sign: ['USER'] },
    'DEMANDE_INTERVENTION': { create: ['USER'], sign: ['SUPERVISOR'] },
    'FICHE_INTERVENTION': { create: ['SUPERVISOR'], sign: ['USER', 'TECHNICIAN'] },
    'RAPPORT_INTERVENTION': { create: ['TECHNICIAN'], sign: ['ADMIN', 'SUPERVISOR'] },
    'DEMANDE_REPARATION_GARANTIE': { create: ['TECHNICIAN', 'ADMIN'], sign: ['ADMIN'] },
    'DEMANDE_INVENTAIRE': { create: ['ADMIN', 'TECHNICIAN'], sign: ['TECHNICIAN'] },
    'FICHE_INVENTAIRE': { create: ['TECHNICIAN'], sign: ['ADMIN'] },
    'RAPPORT_INVENTAIRE': { create: ['TECHNICIAN'], sign: ['ADMIN'] },
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
