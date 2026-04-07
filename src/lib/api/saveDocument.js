/**
 * saveDocument — Archives a generated document to the PostgreSQL backend.
 * Called fire-and-forget after printing: errors are silent (won't block user).
 * @param {string} type - Document type code: 'BC', 'BR', 'DCH', 'DI', 'FI', etc.
 * @param {string} numero - Document reference number
 * @param {object} data - The full form data to persist as JSON
 */
export async function saveDocument(type, numero, data) {
    try {
        const stored = JSON.parse(localStorage.getItem('auth-store') || '{}')
        const token = stored?.state?.token
        await fetch('/api/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ type, numero, data }),
        })
    } catch (err) {
        // Silent — archiving failure should never block the user
        console.warn('[saveDocument] Archive failed (non-blocking):', err.message)
    }
}
