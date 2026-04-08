import { Router } from 'express'
import { buildNotifications } from '../services/notifications.service.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const data = await buildNotifications()
        res.json({ data, total: data.length, success: true })
    } catch (err) {
        console.error('[Notifications]', err)
        res.status(500).json({ success: false, message: 'Erreur serveur.' })
    }
})

export default router
