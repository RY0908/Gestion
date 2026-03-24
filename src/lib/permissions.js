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
    REQUEST_APPROVE: 'request:approve',
    USER_MANAGE: 'user:manage',
    REPORT_EXPORT: 'report:export',
    AUDIT_VIEW: 'audit:view',
}

const PERMISSIONS = {
    ADMIN: Object.values(ACTIONS),
    IT_MANAGER: [
        ACTIONS.ASSET_CREATE, ACTIONS.ASSET_EDIT, ACTIONS.ASSET_RETIRE,
        ACTIONS.ASSET_ASSIGN, ACTIONS.ASSET_VIEW,
        ACTIONS.LICENSE_MANAGE, ACTIONS.MAINTENANCE_MANAGE,
        ACTIONS.REQUEST_APPROVE, ACTIONS.REPORT_EXPORT, ACTIONS.AUDIT_VIEW,
    ],
    IT_TECHNICIAN: [
        ACTIONS.ASSET_EDIT, ACTIONS.ASSET_ASSIGN, ACTIONS.ASSET_VIEW,
        ACTIONS.MAINTENANCE_MANAGE,
    ],
    EMPLOYEE: [ACTIONS.ASSET_VIEW],
    AUDITOR: [ACTIONS.ASSET_VIEW, ACTIONS.LICENSE_MANAGE, ACTIONS.REPORT_EXPORT, ACTIONS.AUDIT_VIEW],
}

/**
 * Check if a role can perform an action
 * @param {string} role - UserRole
 * @param {string} action - one of ACTIONS values
 * @returns {boolean}
 */
export function canDo(role, action) {
    return PERMISSIONS[role]?.includes(action) ?? false
}
