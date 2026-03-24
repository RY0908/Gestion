import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { fetchLicenses, fetchLicense, createLicense, updateLicense, deleteLicense } from '@/lib/api/licenses.api.js'
import toast from 'react-hot-toast'

export const licensesQueryOptions = (params) =>
    queryOptions({
        queryKey: ['licenses', params],
        queryFn: () => fetchLicenses(params),
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

export const licenseDetailQueryOptions = (id) =>
    queryOptions({
        queryKey: ['licenses', id],
        queryFn: () => fetchLicense(id),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    })

export function useLicenses(params) {
    return useQuery(licensesQueryOptions(params))
}

export function useLicense(id) {
    return useQuery(licenseDetailQueryOptions(id))
}

export function useCreateLicense() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createLicense,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['licenses'] })
            toast.success('Licence créée avec succès')
        },
        onError: (err) => toast.error(err.message || 'Erreur lors de la création'),
    })
}

export function useUpdateLicense() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateLicense(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['licenses', id] })
            qc.invalidateQueries({ queryKey: ['licenses'] })
            toast.success('Licence mise à jour')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useDeleteLicense() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteLicense,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['licenses'] })
            toast.success('Licence supprimée')
        },
    })
}
