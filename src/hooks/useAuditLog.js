import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client.js'

export const useAuditLog = () => {
    return useQuery({
        queryKey: ['audit'],
        queryFn: () => api.get('/audit'),
        staleTime: 60 * 1000,
    })
}
