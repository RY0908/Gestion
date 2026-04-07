import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import { initDb } from './db/index.js'

const PORT = process.env.PORT || 3002

async function start() {
    try {
        console.log('[Init] Connecting to PostgreSQL...')
        await initDb()
        console.log('[Init] Database Ready: sigma (PostgreSQL)')

        app.listen(PORT, () => {
            console.log(`[Init] SIGMA Backend API running on http://localhost:${PORT}`)
            console.log(`[Init] Healthcheck: http://localhost:${PORT}/api/health`)
        })
    } catch (err) {
        console.error('[Fatal] Failed to start server:', err)
        process.exit(1)
    }
}

start()
