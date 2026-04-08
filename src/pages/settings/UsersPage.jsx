import { useState } from 'react'
import { useUsers, useDeleteUser } from '@/hooks/useUsers.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { cn, initials } from '@/lib/utils.js'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { UserFormModal } from './components/UserFormModal.jsx'
import { useAuthStore } from '@/store/authStore.js'

export default function UsersPage() {
    const { data, isLoading } = useUsers({})
    const deleteMutation = useDeleteUser()
    const currentUser = useAuthStore(s => s.user)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    const handleEdit = (user) => {
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    const handleDelete = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
            deleteMutation.mutate(id)
        }
    }

    const openNewModal = () => {
        setSelectedUser(null)
        setIsModalOpen(true)
    }

    const columns = [
        {
            accessorFn: row => row.fullName,
            id: 'user',
            header: 'Utilisateur',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-xs font-medium text-sonatrach-green">
                        {initials(info.getValue())}
                    </div>
                    <div>
                        <div className="font-medium text-[var(--color-text)]">{info.getValue()}</div>
                        <div className="text-xs text-[var(--color-muted)]">{info.row.original.email}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'employeeId',
            header: 'Matricule',
            cell: info => <span className="font-mono text-xs">{info.getValue() || '—'}</span>
        },
        {
            accessorFn: row => row.department?.name,
            id: 'department',
            header: 'Département',
            cell: info => <span className="text-sm">{info.getValue() || '—'}</span>
        },
        {
            accessorKey: 'position',
            header: 'Fonction',
            cell: info => <span className="text-sm">{info.getValue() || '—'}</span>
        },
        {
            accessorKey: 'role',
            header: 'Rôle Système',
            cell: info => {
                const role = info.getValue()
                let badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' // USER
                if (role === 'ADMIN') badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                else if (role === 'SUPERVISOR') badgeClass = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                else if (role === 'TECHNICIAN') badgeClass = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'

                return (
                    <span className={cn("px-2.5 py-1 rounded text-xs font-medium", badgeClass)}>
                        {role}
                    </span>
                )
            }
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const rowUser = info.row.original
                // Prevent deleting oneself
                const isSelf = currentUser?.id === rowUser.id

                return (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleEdit(rowUser)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Modifier"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                            <button
                                onClick={() => handleDelete(rowUser.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Annuaire Utilisateurs</h1>
                    <p className="text-[var(--color-muted)]">Gérez les accès et les informations du personnel.</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" />
                    Nouvel Utilisateur
                </button>
            </div>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                rowClassName="group" // Useful to show actions on row hover
            />

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    )
}

