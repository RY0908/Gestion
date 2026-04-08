import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAssignments, useReturnAssignment, useDeleteAssignment } from '@/hooks/useAssignments.js'
import { useRequests } from '@/hooks/useRequests.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { Plus, RotateCcw, Trash2, CheckCircle2, ArrowRight } from 'lucide-react'
import { AssignmentFormModal } from './components/AssignmentFormModal.jsx'
import { REQUEST_STATES } from '@/lib/constants.js'

export default function AssignmentListPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { data, isLoading } = useAssignments({})
    const { data: acceptedRequestsRes, isLoading: isLoadingAcceptedRequests } = useRequests({ status: 'ASSIGNED' })
    const returnMutation = useReturnAssignment()
    const deleteMutation = useDeleteAssignment()

    const [isModalOpen, setIsModalOpen] = useState(Boolean(location.state?.requestId))
    const [defaultRequestId, setDefaultRequestId] = useState(location.state?.requestId || '')
    const acceptedRequests = acceptedRequestsRes?.data || []

    const openModal = (requestId = '') => {
        setDefaultRequestId(requestId)
        setIsModalOpen(true)
    }

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

    const columns = [
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
            accessorFn: row => row.sourceRequest?.requestNumber,
            id: 'sourceRequest',
            header: 'Demande source',
            cell: info => info.getValue() ? (
                <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
            ) : <span className="text-xs text-[var(--color-muted)]">—</span>
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
    ]

    const acceptedRequestColumns = [
        {
            accessorKey: 'requestNumber',
            header: 'N° Demande',
            cell: info => <span className="font-mono text-xs font-semibold">{info.getValue() || info.row.original.id}</span>,
        },
        {
            accessorKey: 'requestedBy.fullName',
            header: 'Demandeur',
        },
        {
            accessorKey: 'assetCategory',
            header: 'Catégorie',
        },
        {
            accessorKey: 'createdAt',
            header: 'Acceptée le',
            cell: info => formatDate(info.getValue()),
        },
        {
            accessorKey: 'status',
            header: 'État',
            cell: info => {
                const stateObj = REQUEST_STATES.find(s => s.value === info.getValue())
                return (
                    <span className={cn('px-2.5 py-1 rounded text-xs font-medium border', stateObj?.color || 'bg-gray-100 text-gray-800')}>
                        {stateObj?.label || info.getValue()}
                    </span>
                )
            },
        },
        {
            id: 'actions',
            header: '',
            cell: info => (
                <div className="flex items-center justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            openModal(info.row.original.id)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sonatrach-green text-white rounded-lg hover:bg-sonatrach-green-light transition-colors"
                    >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Affecter
                    </button>
                </div>
            ),
        },
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Affectations</h1>
                    <p className="text-[var(--color-muted)]">Historique et suivi des équipements assignés.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Affectation
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-sonatrach-green" />
                            Demandes acceptées à affecter
                        </h2>
                        <p className="text-sm text-[var(--color-muted)]">
                            Les demandes validées apparaissent ici avant la création de l’affectation.
                        </p>
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">
                        {acceptedRequests.length} demande(s) en attente d’affectation
                    </div>
                </div>

                {acceptedRequests.length > 0 ? (
                    <DataTable
                        columns={acceptedRequestColumns}
                        data={acceptedRequests}
                        isLoading={isLoadingAcceptedRequests}
                        rowClassName="group"
                        onRowClick={(row) => openModal(row.id)}
                    />
                ) : (
                    <EmptyState
                        title="Aucune demande validée"
                        description="Les demandes acceptées apparaîtront ici dès qu’elles seront prêtes à être affectées."
                        actionLabel="Voir les demandes"
                        onAction={() => navigate('/requests')}
                    />
                )}
            </div>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                rowClassName="group"
                onRowClick={(row) => navigate(`/assignments/${row.id}`)}
            />

            <AssignmentFormModal
                key={defaultRequestId || 'assignment-form'}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setDefaultRequestId('')
                }}
                defaultRequestId={defaultRequestId}
            />
        </div>
    )
}
