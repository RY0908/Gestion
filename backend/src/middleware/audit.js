import { getPool } from '../db/index.js'

/**
 * Async audit log helper — call after any write operation.
 * Fire-and-forget (does not throw to caller).
 */
export async function logAudit({ action, entityType, entityId, description, changes = null, userId = null }) {
    try {
        await getPool().query(
            `INSERT INTO journal_audit (type_action, entite_type, entite_id, description, modifications_json, id_utilisateur)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                action,
                entityType,
                entityId || null,
                description || null,
                changes ? changes : null,
                userId || null
            ]
        )
    } catch (err) {
        console.error('[Audit] Failed to log:', err.message)
    }
}
