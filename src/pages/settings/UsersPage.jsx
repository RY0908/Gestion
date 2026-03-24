import { useUsers } from '@/hooks/useUsers.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { cn, initials } from '@/lib/utils.js'

export default function UsersPage() {
    const { data, isLoading } = useUsers({})

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
            cell: info => <span className="font-mono text-xs">{info.getValue()}</span>
        },
        {
            accessorFn: row => row.department?.name,
            id: 'department',
            header: 'Département',
        },
        {
            accessorKey: 'position',
            header: 'Fonction',
        },
        {
            accessorKey: 'role',
            header: 'Rôle Système',
            cell: info => {
                const role = info.getValue()
                return (
                    <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-medium",
                        role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            role.includes('IT') ? 'bg-blue-100 text-blue-800' :
                                role === 'AUDITOR' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                    )}>
                        {role.replace('_', ' ')}
                    </span>
                )
            }
        }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">Annuaire Utilisateurs</h1>
                <p className="text-[var(--color-muted)]">Gérez les accès et les informations du personnel.</p>
            </div>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
            />
        </div>
    )
}
