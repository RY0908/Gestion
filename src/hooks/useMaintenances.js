import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { fetchMaintenances, fetchMaintenance, createMaintenance, updateMaintenance, deleteMaintenance, completeMaintenance } from '@/lib/api/maintenance.api.js'
import toast from 'react-hot-toast'

export const maintenancesQueryOptions = (params) =>
    queryOptions({
        queryKey: ['maintenance', params],
        queryFn: () => fetchMaintenances(params),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

export const maintenanceDetailQueryOptions = (id) =>
    queryOptions({
        queryKey: ['maintenance', id],
        queryFn: () => fetchMaintenance(id),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    })

export function useMaintenances(params) {
    return useQuery(maintenancesQueryOptions(params))
}

export function useMaintenance(id) {
    return useQuery(maintenanceDetailQueryOptions(id))
}

export function useCreateMaintenance() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createMaintenance,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['maintenance'] })
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Maintenance planifiée avec succès')
        },
        onError: (err) => toast.error(err.message || 'Erreur lors de la création'),
    })
}

export function useUpdateMaintenance() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateMaintenance(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['maintenance', id] })
            qc.invalidateQueries({ queryKey: ['maintenance'] })
            toast.success('Maintenance mise à jour')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useCompleteMaintenance() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => completeMaintenance(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['maintenance', id] })
            qc.invalidateQueries({ queryKey: ['maintenance'] })
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Maintenance terminée')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useDeleteMaintenance() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteMaintenance,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['maintenance'] })
            toast.success('Maintenance supprimée')
        },
    })
}
