import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { fetchUsers, fetchUser, createUser, updateUser, deleteUser } from '@/lib/api/users.api.js'
import toast from 'react-hot-toast'

export const usersQueryOptions = (params) =>
    queryOptions({
        queryKey: ['users', params],
        queryFn: () => fetchUsers(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

export const userDetailQueryOptions = (id) =>
    queryOptions({
        queryKey: ['users', id],
        queryFn: () => fetchUser(id),
        enabled: Boolean(id),
        staleTime: 10 * 60 * 1000,
    })

export function useUsers(params) {
    return useQuery(usersQueryOptions(params))
}

export function useUser(id) {
    return useQuery(userDetailQueryOptions(id))
}

export function useCreateUser() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] })
            toast.success('Utilisateur créé avec succès')
        },
        onError: (err) => toast.error(err.message || 'Erreur lors de la création'),
    })
}

export function useUpdateUser() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['users', id] })
            qc.invalidateQueries({ queryKey: ['users'] })
            toast.success('Utilisateur mis à jour')
        },
        onError: (err) => toast.error(err.message),
    })
}

export function useDeleteUser() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] })
            toast.success('Utilisateur supprimé')
        },
    })
}
