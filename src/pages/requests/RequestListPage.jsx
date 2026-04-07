import { useState, useMemo } from 'react'
import { useRequests, useDeleteRequest } from '@/hooks/useRequests.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { formatDate, cn } from '@/lib/utils.js'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { REQUEST_STATES } from '@/lib/constants.js'
import { ACTIONS } from '@/lib/permissions.js'
import { useAuthStore } from '@/store/authStore.js'
import { Check, ClipboardList, Plus, Edit2, Trash2, UserCheck } from 'lucide-react'
import { RequestFormModal } from './components/RequestFormModal.jsx'
import { RequestActionModal } from './components/RequestActionModal.jsx'

import { useNavigate } from 'react-router-dom'

export default function RequestListPage() {
    const navigate = useNavigate()
    const { data, isLoading } = useRequests({})
    const deleteMutation = useDeleteRequest()
    const { user, canDo } = useAuthStore()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [actionConfig, setActionConfig] = useState({ isOpen: false, request: null, type: null })

    const openAction = (request, type) => {
        setActionConfig({ isOpen: true, request, type })
    }

    const closeAction = () => {
        setActionConfig({ isOpen: false, request: null, type: null })
    }

    const handleDelete = (id) => {
        if (window.confirm("Voulez-vous vraiment annuler/supprimer cette demande ?")) {
            deleteMutation.mutate(id)
        }
    }

    const columns = useMemo(() => [
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
            header: 'Technicien',
            cell: info => info.getValue() ? <span className="text-sm font-medium">{info.getValue()}</span> : <span className="text-xs text-[var(--color-muted)]">—</span>
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const req = info.row.original
                
                const isMine = req.requestedBy?.id === user?.id
                const canAssign = (req.status === 'PENDING' || req.status === 'APPROVED') && canDo(ACTIONS.TICKET_ASSIGN)
                const canResolve = req.status === 'ASSIGNED' && canDo(ACTIONS.TICKET_RESOLVE) && (user.role === 'ADMIN' || req.assignedTo?.id === user.id)
                const canEditDelete = isMine || user.role === 'ADMIN' || user.role === 'SUPERVISOR'

                return (
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {canAssign && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setActionConfig({ isOpen: true, request: req, type: 'ASSIGN' }) }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                            >
                                <UserCheck className="w-3.5 h-3.5" /> Assigner
                            </button>
                        )}
                        {canResolve && (
                            <button
                                onClick={(e) => { e.stopPropagation(); openAction(req, 'resolve') }}
                                className="p-1.5 text-sonatrach-green hover:bg-sonatrach-green/10 rounded transition-colors"
                                title="Clôturer/Résoudre la demande"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                        {canEditDelete && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openAction(req, 'edit') }}
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
    ], [user, canDo])

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

