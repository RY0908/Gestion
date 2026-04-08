import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, UserCheck, XCircle } from 'lucide-react'
import { useRequests, useDeleteRequest } from '@/hooks/useRequests.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { formatDate, cn } from '@/lib/utils.js'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { REQUEST_STATES } from '@/lib/constants.js'
import { ACTIONS } from '@/lib/permissions.js'
import { useAuthStore } from '@/store/authStore.js'
import { RequestFormModal } from './components/RequestFormModal.jsx'
import { RequestActionModal } from './components/RequestActionModal.jsx'
import { summarizeSpecifications } from '@/lib/specifications.js'

export default function RequestListPage() {
    const navigate = useNavigate()
    const { data, isLoading } = useRequests({})
    const deleteMutation = useDeleteRequest()
    const { user, canDo } = useAuthStore()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [actionConfig, setActionConfig] = useState({ isOpen: false, request: null, type: null })

    const handleDelete = (id) => {
        if (window.confirm('Voulez-vous vraiment annuler/supprimer cette demande ?')) {
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
            accessorKey: 'requestedBy.fullName',
            header: 'Demandeur',
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
            accessorFn: row => row.assetCategory === 'MAINTENANCE'
                ? row.maintenanceAsset
                : row.stockAvailability,
            id: 'stockAvailability',
            header: 'Actif concerné',
            cell: info => {
                const value = info.getValue()
                const isMaintenance = info.row.original.assetCategory === 'MAINTENANCE'
                return (
                    <span className={cn(
                        'px-2.5 py-1 rounded text-xs font-semibold border',
                        isMaintenance
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : (value?.hasStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')
                    )}>
                        {isMaintenance
                            ? (value?.assetTag || 'Non renseigné')
                            : (value?.hasStock ? `${value.availableCount} dispo` : 'Rupture')}
                    </span>
                )
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
                        'px-2 py-0.5 rounded text-xs font-medium border',
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
                        'px-2.5 py-1 rounded text-xs font-medium border',
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
            header: 'Technicien',
            cell: info => info.getValue() ? <span className="text-sm font-medium">{info.getValue()}</span> : <span className="text-xs text-[var(--color-muted)]">—</span>
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const req = info.row.original
                const isMine = req.requestedBy?.id === user?.id
                const canAccept = req.status === 'PENDING' && canDo(ACTIONS.REQUEST_MANAGE)
                const canReject = req.status === 'PENDING' && canDo(ACTIONS.REQUEST_MANAGE)
                const canEditDelete = isMine || user?.role === 'ADMIN' || user?.role === 'SUPERVISOR'
                const canProceed = req.assetCategory === 'MAINTENANCE'
                    ? Boolean(req.maintenanceAsset?.assetId)
                    : req.stockAvailability?.hasStock

                return (
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {canAccept && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setActionConfig({ isOpen: true, request: req, type: 'accept' }) }}
                                disabled={!canProceed}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={req.assetCategory === 'MAINTENANCE'
                                    ? (canProceed ? 'Créer le ticket de maintenance' : 'Aucun équipement sélectionné')
                                    : (canProceed ? 'Accepter la demande' : 'Aucun matériel en stock')}
                            >
                                <UserCheck className="w-3.5 h-3.5" /> {req.assetCategory === 'MAINTENANCE' ? 'Créer ticket' : 'Accepter'}
                            </button>
                        )}
                        {canReject && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setActionConfig({ isOpen: true, request: req, type: 'reject' }) }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors"
                            >
                                <XCircle className="w-3.5 h-3.5" /> Refuser
                            </button>
                        )}
                        {canEditDelete && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActionConfig({ isOpen: true, request: req, type: 'edit' }) }}
                                    className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                    title="Modifier l'état manuellement"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(req.id) }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
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
                    <h1 className="text-2xl font-display font-bold">Demandes de Matériel</h1>
                    <p className="text-[var(--color-muted)]">Gérez les requêtes d'équipement des collaborateurs.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Demande
                </button>
            </div>

            <DataTable
                data={data?.data}
                columns={columns}
                isLoading={isLoading}
                onRowClick={(row) => navigate(`/requests/${row.id}`)}
                emptyMessage="Aucune demande trouvée."
            />

            <RequestFormModal
                key={`request-form-${isFormOpen ? 'open' : 'closed'}`}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            />

            {actionConfig.isOpen && (
                <RequestActionModal
                    isOpen={actionConfig.isOpen}
                    onClose={() => setActionConfig({ isOpen: false, request: null, type: null })}
                    request={actionConfig.request}
                    actionType={actionConfig.type}
                />
            )}
        </div>
    )
}
