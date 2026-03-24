import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { fetchAssets, fetchAsset, createAsset, updateAsset, deleteAsset, retireAsset } from '@/lib/api/assets.api.js'
import toast from 'react-hot-toast'

export const assetsQueryOptions = (params) =>
    queryOptions({
        queryKey: ['assets', params],
        queryFn: () => fetchAssets(params),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

export const assetDetailQueryOptions = (id) =>
    queryOptions({
        queryKey: ['assets', id],
        queryFn: () => fetchAsset(id),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    })

export function useAssets(params) {
    return useQuery(assetsQueryOptions(params))
}

export function useAsset(id) {
    return useQuery(assetDetailQueryOptions(id))
}

export function useCreateAsset() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createAsset,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Actif créé avec succès')
        },
        onError: (err) => toast.error(err.message || 'Erreur lors de la création'),
    })
}

export function useUpdateAsset() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateAsset(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['assets', id] })
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Actif mis à jour')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useDeleteAsset() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteAsset,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Actif supprimé')
        },
    })
}

export function useRetireAsset() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: retireAsset,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Actif retiré du parc')
        },
    })
}
