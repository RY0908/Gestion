import { documentsApi } from './documents.api.js'

export const dechargesApi = {
    getAll: () => documentsApi.getDecharges(),
    getById: (id) => documentsApi.getById(id),
    create: (data) => documentsApi.createArchive({ type: 'DCH', ...data }),
    sign: (id) => documentsApi.updateStatus(id, 'SIGNED'),
    delete: (id) => documentsApi.delete(id),
}
