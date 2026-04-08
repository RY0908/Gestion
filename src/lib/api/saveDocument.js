import { documentsApi } from './documents.api.js'

/**
 * saveDocument archives a generated document to the PostgreSQL backend.
 * Called fire-and-forget after printing: errors are silent and non-blocking.
 */
export async function saveDocument(type, numero, data) {
    try {
        await documentsApi.createArchive({ type, numero, data })
    } catch (err) {
        // Silent: archiving failure should never block the user.
        console.warn('[saveDocument] Archive failed (non-blocking):', err.message)
    }
}
