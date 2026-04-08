import { useQuery, queryOptions } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications.api.js'

export const notificationsQueryOptions = () => queryOptions({
    queryKey: ['notifications'],
    queryFn: async () => {
        const res = await notificationsApi.getAll()
        return {
            notifications: res?.data ?? [],
            total: res?.total ?? 0,
        }
    },
    staleTime: 30_000,
})

export function useNotifications() {
    return useQuery(notificationsQueryOptions())
}
