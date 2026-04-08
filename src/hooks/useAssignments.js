import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { fetchAssignments, fetchAssignment, createAssignment, updateAssignment, deleteAssignment, returnAssignment } from '@/lib/api/assignments.api.js'
import toast from 'react-hot-toast'

export const assignmentsQueryOptions = (params = {}) => {
    const { enabled = true, ...queryParams } = params
    return queryOptions({
        queryKey: ['assignments', queryParams],
        queryFn: () => fetchAssignments(queryParams),
        enabled,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    })
}

export const assignmentDetailQueryOptions = (id) =>
    queryOptions({
        queryKey: ['assignments', id],
        queryFn: () => fetchAssignment(id),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    })

export function useAssignments(params) {
    return useQuery(assignmentsQueryOptions(params))
}

export function useAssignment(id) {
    return useQuery(assignmentDetailQueryOptions(id))
}

export function useCreateAssignment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createAssignment,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['assignments'] })
            qc.invalidateQueries({ queryKey: ['requests'] })
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Affectation créée avec succès')
        },
        onError: (err) => toast.error(err.message || 'Erreur lors de la création'),
    })
}

export function useUpdateAssignment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateAssignment(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['assignments', id] })
            qc.invalidateQueries({ queryKey: ['assignments'] })
            toast.success('Affectation mise à jour')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useReturnAssignment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => returnAssignment(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['assignments', id] })
            qc.invalidateQueries({ queryKey: ['assignments'] })
            qc.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Matériel retourné avec succès')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useDeleteAssignment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteAssignment,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['assignments'] })
            toast.success('Affectation supprimée')
        },
    })
}
