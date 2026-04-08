import { useState } from 'react'
import { useRequests, useDeleteRequest } from '@/hooks/useRequests.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { formatDate, cn } from '@/lib/utils.js'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { REQUEST_STATES } from '@/lib/constants.js'
import { useAuthStore } from '@/store/authStore.js'
import { ClipboardList, Plus, Edit2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RequestFormModal } from './components/RequestFormModal.jsx'
import { RequestActionModal } from './components/RequestActionModal.jsx'
import { summarizeSpecifications } from '@/lib/specifications.js'

export default function MyRequestsPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    // Send { mine: true, userId: user?.id } to the backend/mock
    const { data, isLoading } = useRequests({ mine: true, userId: user?.id })
    const deleteMutation = useDeleteRequest()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [actionConfig, setActionConfig] = useState({ isOpen: false, request: null, type: null })

    const openAction = (request, type) => {
        setActionConfig({ isOpen: true, request, type })
    }

    const closeAction = () => {
        setActionConfig({ isOpen: false, request: null, type: null })
    }

    const myRequests = (data?.data || []).filter(req => req.requestedBy?.id === user?.id)

    const handleDelete = (id) => {
        if (window.confirm("Voulez-vous vraiment annuler/supprimer cette demande ?")) {
            deleteMutation.mutate(id)
        }
    }

    const columns = [
        {
            accessorKey: 'requestNumber',
            header: 'N° Demande',
            cell: info => <span className="font-mono text-xs font-semibold">{info.getValue() || `REQ-${info.row.original.id?.toString().slice(-4)}`}</span>
        },
        {
            accessorKey: 'assetCategory',
            header: 'Catégorie',
            cell: info => <AssetTypeBadge category={info.getValue()} />
        },
        {
            accessorKey: 'specifications',
            header: 'Spécifications',
            cell: info => {
                const row = info.row.original
                const summary = summarizeSpecifications(row.assetCategory, info.getValue(), 'request')
                return summary ? <span className="text-xs text-[var(--color-muted)] line-clamp-2">{summary}</span> : <span className="text-xs text-[var(--color-muted)]">—</span>
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Date de demande',
            cell: info => formatDate(info.getValue())
        },
        {
            accessorKey: 'priority',
            header: 'Priorité',
            cell: info => {
                const priority = info.getValue()
                return (
                    <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border",
                        priority === 'URGENT' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20' :
                            priority === 'HIGH' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20' :
                                priority === 'MEDIUM' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20' :
                                    'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-800'
                    )}>
                        {priority}
                    </span>
                )
            }
        },
        {
            accessorKey: 'status',
            header: 'Statut',
            cell: info => {
                const status = info.getValue()
                const stateObj = REQUEST_STATES.find(s => s.value === status)
                return (
                    <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-medium border",
                        stateObj?.color || 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700'
                    )}>
                        {stateObj?.label || status}
                    </span>
                )
            }
        },
        {
            accessorFn: row => row.assignedTo?.fullName,
            id: 'assignedTo',
            header: 'Technicien assigné',
            cell: info => info.getValue() ? <span className="text-sm font-medium">{info.getValue()}</span> : <span className="text-xs text-[var(--color-muted)]">En attente</span>
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const req = info.row.original
                // User can only delete their request if it's pending (or admin)
                const canDelete = req.status === 'PENDING' || user?.role === 'ADMIN'

                return (
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(req.id) }}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Annuler la demande"
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
                    <h1 className="text-2xl font-display font-bold">Mes Demandes</h1>
                    <p className="text-[var(--color-muted)]">Suivez le statut de vos demandes de matériel.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Demande
                </button>
            </div>

            <DataTable
                columns={columns}
                data={myRequests}
                isLoading={isLoading}
                onRowClick={(row) => navigate(`/requests/${row.id}`)}
                emptyMessage="Vous n'avez soumis aucune demande."
            />

            <RequestFormModal
                key={`my-request-form-${isFormOpen ? 'open' : 'closed'}`}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            />

            {actionConfig.isOpen && (
                <RequestActionModal
                    isOpen={actionConfig.isOpen}
                    onClose={closeAction}
                    request={actionConfig.request}
                    actionType={actionConfig.type}
                />
            )}
        </div>
    )
}
