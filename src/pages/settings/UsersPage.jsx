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
                let badgeClass = 'bg-gray-100 text-gray-800' // USER
                if (role === 'ADMIN') badgeClass = 'bg-purple-100 text-purple-800'
                else if (role === 'SUPERVISOR') badgeClass = 'bg-indigo-100 text-indigo-800'
                else if (role === 'TECHNICIAN') badgeClass = 'bg-cyan-100 text-cyan-800'

                return (
                    <span className={cn("px-2.5 py-1 rounded text-xs font-medium", badgeClass)}>
                        {role}
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
