import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth.handlers.js'
import { assetHandlers } from './handlers/assets.handlers.js'
import { userHandlers } from './handlers/users.handlers.js'
import { assignmentHandlers } from './handlers/assignments.handlers.js'
import { licenseHandlers } from './handlers/licenses.handlers.js'
import { maintenanceHandlers } from './handlers/maintenance.handlers.js'
import { requestHandlers } from './handlers/requests.handlers.js'
import { auditHandlers } from './handlers/audit.handlers.js'
import { purchaseOrderHandlers } from './handlers/purchase-orders.handlers.js'
import { bonReceptionHandlers } from './handlers/bon-receptions.handlers.js'
import { dechargeHandlers } from './handlers/decharges.handlers.js'

export const worker = setupWorker(
    ...authHandlers,
    ...assetHandlers,
    ...userHandlers,
    ...assignmentHandlers,
    ...licenseHandlers,
    ...maintenanceHandlers,
    ...requestHandlers,
    ...auditHandlers,
    ...purchaseOrderHandlers,
    ...bonReceptionHandlers,
    ...dechargeHandlers,
)
