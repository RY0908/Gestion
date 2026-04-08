import { documentsApi } from './documents.api.js'

export const purchaseOrdersApi = {
    getAll: () => documentsApi.getPurchaseOrders(),
    getById: (id) => documentsApi.getById(id),
    create: (data) => documentsApi.createArchive({ type: 'BC', ...data }),
    update: (id, data) => documentsApi.update(id, data),
    delete: (id) => documentsApi.delete(id),
}
