import jwt from 'jsonwebtoken'

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches req.user = { id, email, role, nom_complet } on success.
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token manquant ou invalide.' })
    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next()
    } catch {
        return res.status(401).json({ success: false, message: 'Token expiré ou invalide.' })
    }
}

/**
 * Factory: Create a middleware that restricts access to specific roles.
 * Usage: requireRole('ADMIN', 'SUPERVISOR')
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, message: 'Non authentifié.' })
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.`
            })
        }
        next()
    }
}
