import { useState, useMemo } from 'react'
import { useAssignments, useReturnAssignment, useDeleteAssignment } from '@/hooks/useAssignments.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { AssignmentFormModal } from './components/AssignmentFormModal.jsx'

export default function AssignmentListPage() {
    const { data, isLoading } = useAssignments({})
    const returnMutation = useReturnAssignment()
    const deleteMutation = useDeleteAssignment()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleReturn = (id) => {
        if (window.confirm("Voulez-vous vérifier le retour de ce matériel ? Cela le rendra à nouveau disponible.")) {
            returnMutation.mutate({ id, data: { notes: 'Retourné via le tableau de bord' } })
        }
    }

    const handleDelete = (id) => {
        if (window.confirm("Supprimer cette entrée d'affectation ? Cela ne supprimera pas le matériel de l'inventaire.")) {
            deleteMutation.mutate(id)
        }
    }

    const columns = useMemo(() => [
        {
            accessorKey: 'asset.assetTag',
            header: 'Actif',
            cell: info => <CopyableText value={info.getValue()} className="font-semibold" />
        },
        {
            accessorFn: row => row.assignedTo?.fullName,
            id: 'assignedTo',
            header: 'Assigné à',
        },
        {
            accessorKey: 'assignedAt',
            header: 'Date d\'affectation',
            cell: info => formatDate(info.getValue())
        },
        {
            accessorKey: 'status',
            header: 'Statut',
            cell: info => (
                <span className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium",
                    info.getValue() === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                )}>
                    {info.getValue() === 'ACTIVE' ? 'Actif' : 'Retourné'}
                </span>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const rowAsst = info.row.original
                const isActive = rowAsst.status === 'ACTIVE'
                return (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isActive && (
                            <button
                                onClick={() => handleReturn(rowAsst.id)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors flex items-center gap-1 text-xs font-semibold"
                                title="Enregistrer le retour du matériel"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(rowAsst.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Supprimer la trace"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )
            }
        }
    ], [])

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Affectations</h1>
                    <p className="text-[var(--color-muted)]">Historique et suivi des équipements assignés.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Affectation
                </button>
            </div>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                rowClassName="group"
            />

            <AssignmentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}
