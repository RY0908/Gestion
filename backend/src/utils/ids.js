export function parsePrefixedId(value, prefix) {
    if (value === undefined || value === null) return null

    const raw = String(value).trim()
    if (!raw) return null

    const stripped = prefix ? raw.replace(new RegExp(`^${prefix}-?`), '') : raw
    if (!/^\d+$/.test(stripped)) return null

    return Number(stripped)
}
