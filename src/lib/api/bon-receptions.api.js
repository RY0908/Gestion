import { documentsApi } from './documents.api.js'

export const bonReceptionsApi = {
    getAll: () => documentsApi.getBonReceptions(),
    getById: (id) => documentsApi.getById(id),
    create: (data) => documentsApi.createArchive({ type: 'BR', ...data }),
    update: (id, data) => documentsApi.update(id, data),
    validate: (id) => documentsApi.updateStatus(id, 'VALIDATED'),
}
