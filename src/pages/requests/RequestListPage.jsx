import { useRequests } from '@/hooks/useRequests.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'

export default function RequestListPage() {
    const { data, isLoading } = useRequests({})

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
                return (
                    <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-medium",
                        status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                status === 'FULFILLED' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                    )}>
                        {status}
                    </span>
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
