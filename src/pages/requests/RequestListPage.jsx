import { useRequests, useAssignRequest, useResolveRequest } from '@/hooks/useRequests.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { formatDate, cn } from '@/lib/utils.js'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { REQUEST_STATES } from '@/lib/constants.js'
import { ACTIONS } from '@/lib/permissions.js'
import { useAuthStore } from '@/store/authStore.js'
import { Check, ClipboardList } from 'lucide-react'

export default function RequestListPage() {
    const { data, isLoading } = useRequests({})
    const { user, canDo } = useAuthStore()
    const assignReq = useAssignRequest()
    const resolveReq = useResolveRequest()

    const columns = [
        {
            accessorKey: 'requestNumber',
            header: 'N° Demande',
            cell: info => <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
        },
        {
            accessorKey: 'requestedBy.fullName',
            header: 'Demandeur',
        },
        {
            accessorKey: 'assetCategory',
            header: 'Catégorie demandée',
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
                        priority === 'URGENT' ? 'border-red-200 text-red-700 bg-red-50' :
                            priority === 'HIGH' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                priority === 'MEDIUM' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                    'border-gray-200 text-gray-700 bg-gray-50'
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
                        "px-2.5 py-1 rounded text-xs font-medium",
                        stateObj?.color || 'bg-gray-100 text-gray-800'
                    )}>
                        {stateObj?.label || status}
                    </span>
                )
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: info => {
                const req = info.row.original
                
                const canAssign = req.status === 'PENDING' && canDo(ACTIONS.TICKET_ASSIGN)
                const canResolve = req.status === 'ASSIGNED' && canDo(ACTIONS.TICKET_RESOLVE) && (user.role === 'ADMIN' || req.assignedTo?.id === user.id)

                if (!canAssign && !canResolve) return null

                return (
                    <div className="flex items-center gap-2">
                        {canAssign && (
                            <button
                                onClick={() => assignReq.mutate({ id: req.id, data: { assignedToId: 'usr-1003' } })} // Mock assignment to first technician
                                disabled={assignReq.isPending}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Assigner au technicien (Simulation)"
                            >
                                <ClipboardList className="w-4 h-4" />
                            </button>
                        )}
                        {canResolve && (
                            <button
                                onClick={() => resolveReq.mutate({ id: req.id, data: { notes: 'Résolu' } })}
                                disabled={resolveReq.isPending}
                                className="p-1 text-sonatrach-green hover:bg-sonatrach-green/10 rounded transition-colors"
                                title="Clôturer"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">Demandes de Matériel</h1>
                <p className="text-[var(--color-muted)]">Gérez les requêtes d'équipement des collaborateurs.</p>
            </div>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
            />
        </div>
    )
}
