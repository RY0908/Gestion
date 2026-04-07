import { Router } from 'express'
import { getPool } from '../db/index.js'

const router = Router()

router.get('/', (req, res) => {
    res.json({ data: [], success: true })
})

export default router
