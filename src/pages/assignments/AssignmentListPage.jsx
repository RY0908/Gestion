import { useAssignments } from '@/hooks/useAssignments.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'

export default function AssignmentListPage() {
    const { data, isLoading } = useAssignments({})

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
        }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">Affectations</h1>
                <p className="text-[var(--color-muted)]">Historique et suivi des équipements assignés.</p>
            </div>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
            />
        </div>
    )
}
