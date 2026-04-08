import { useQuery, queryOptions } from '@tanstack/react-query'
import { documentsApi } from '@/lib/api/documents.api.js'

export const documentsCatalogQueryOptions = () => queryOptions({
    queryKey: ['documents', 'catalog'],
    queryFn: async () => {
        const [orders, receptions, decharges] = await Promise.all([
            documentsApi.getPurchaseOrders(),
            documentsApi.getBonReceptions(),
            documentsApi.getDecharges(),
        ])

        return { orders, receptions, decharges }
    },
    staleTime: 60_000,
})

export function useDocumentsCatalog() {
    return useQuery(documentsCatalogQueryOptions())
}
