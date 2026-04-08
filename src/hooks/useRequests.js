import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { fetchRequests, fetchRequest, createRequest, updateRequest, deleteRequest, assignRequest, resolveRequest } from '@/lib/api/requests.api.js'
import toast from 'react-hot-toast'

export const requestsQueryOptions = (params) =>
    queryOptions({
        queryKey: ['requests', params],
        queryFn: () => fetchRequests(params),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

export const requestDetailQueryOptions = (id) =>
    queryOptions({
        queryKey: ['requests', id],
        queryFn: () => fetchRequest(id),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    })

export function useRequests(params) {
    return useQuery(requestsQueryOptions(params))
}

export function useRequest(id) {
    return useQuery(requestDetailQueryOptions(id))
}

export function useCreateRequest() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createRequest,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['requests'] })
            toast.success('Demande soumise avec succès')
        },
        onError: (err) => toast.error(err.message || 'Erreur lors de la soumission'),
    })
}

export function useUpdateRequest() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateRequest(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['requests', id] })
            qc.invalidateQueries({ queryKey: ['requests'] })
            qc.invalidateQueries({ queryKey: ['maintenance'] })
            toast.success('Demande mise à jour')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useAssignRequest() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => assignRequest(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['requests', id] })
            qc.invalidateQueries({ queryKey: ['requests'] })
            toast.success('Demande assignée avec succès')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useResolveRequest() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => resolveRequest(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['requests', id] })
            qc.invalidateQueries({ queryKey: ['requests'] })
            toast.success('Demande clôturée avec succès')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useDeleteRequest() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteRequest,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['requests'] })
            toast.success('Demande supprimée')
        },
    })
}
