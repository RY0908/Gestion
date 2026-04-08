import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client.js'

export const useAuditLog = (options = {}) => {
    return useQuery({
        queryKey: ['audit'],
        queryFn: () => api.get('/audit'),
        staleTime: 60 * 1000,
        enabled: options.enabled ?? true,
    })
}
