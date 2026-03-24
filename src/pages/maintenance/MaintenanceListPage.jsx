import { useState, useMemo } from 'react'
import { useMaintenances } from '@/hooks/useMaintenances.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { PriorityBadge } from '@/components/atoms/PriorityBadge.jsx'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { Kanban, List, Wrench, Clock, User, ArrowRight } from 'lucide-react'

const KANBAN_COLUMNS = [
    { id: 'SCHEDULED', label: 'À faire', color: 'border-t-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10', emoji: '📋' },
    { id: 'IN_PROGRESS', label: 'En cours', color: 'border-t-amber-500', bg: 'bg-amber-50/50 dark:bg-amber-900/10', emoji: '🔧' },
    { id: 'CANCELLED', label: 'En attente pièces', color: 'border-t-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-900/10', emoji: '⏸️' },
    { id: 'COMPLETED', label: 'Résolu', color: 'border-t-green-500', bg: 'bg-green-50/50 dark:bg-green-900/10', emoji: '✅' },
]

const priorityFromType = (type) => {
    if (type === 'CORRECTIVE') return 'HIGH'
    if (type === 'PREVENTIVE') return 'MEDIUM'
    if (type === 'UPGRADE') return 'LOW'
    return 'MEDIUM'
}

// Kanban ticket card
const KanbanCard = ({ ticket }) => {
    const priority = priorityFromType(ticket.type)
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 shadow-sm card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
                <PriorityBadge priority={priority} />
                <span className="text-[10px] font-mono text-[var(--color-muted)]">#{ticket.id.slice(-4)}</span>
            </div>
            <div className="mb-2">
                <p className="text-sm font-medium leading-tight line-clamp-2">{ticket.description}</p>
                <p className="text-xs text-[var(--color-muted)] mt-1 flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    {ticket.asset?.assetTag || 'N/A'} — {ticket.asset?.brand}
                </p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)]">
                <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {ticket.technicianName?.split(' ').slice(0, 2).join(' ') || 'Non assigné'}
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(ticket.startDate)}
                </span>
            </div>
        </div>
    )
}

export default function MaintenanceListPage() {
    const [viewMode, setViewMode] = useState('kanban')
    const { data, isLoading } = useMaintenances({})

    const tickets = data?.data || []

    // Group tickets by status for kanban
    const grouped = useMemo(() => {
        const groups = {}
        KANBAN_COLUMNS.forEach(col => { groups[col.id] = [] })
        tickets.forEach(t => {
            if (groups[t.status]) groups[t.status].push(t)
            else groups['SCHEDULED'].push(t) // fallback
        })
        return groups
    }, [tickets])

    const listColumns = [
        {
            accessorKey: 'asset.assetTag',
            header: 'Actif',
            cell: info => <CopyableText value={info.getValue()} className="font-semibold" />
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: info => {
                const type = info.getValue()
                return (
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-md",
                        type === 'CORRECTIVE' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                            type === 'PREVENTIVE' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                type === 'UPGRADE' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                                    'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    )}>
                        {type}
                    </span>
                )
            }
        },
        { accessorKey: 'description', header: 'Description' },
        {
            accessorKey: 'startDate',
            header: "Date d'intervention",
            cell: info => formatDate(info.getValue())
        },
        {
            accessorKey: 'technicianName',
            header: 'Technicien',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center text-[10px] font-bold">
                        {info.getValue()?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm">{info.getValue()}</span>
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Statut',
            cell: info => <StatusBadge status={info.getValue()} />
        }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Maintenance"
                count={tickets.length}
                description="Planifiez et suivez les interventions sur le matériel."
            >
                {/* View Toggle */}
                <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                            viewMode === 'kanban'
                                ? 'bg-sonatrach-green/10 text-sonatrach-green'
                                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
                        )}
                    >
                        <Kanban className="w-4 h-4" /> Kanban
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                            viewMode === 'list'
                                ? 'bg-sonatrach-green/10 text-sonatrach-green'
                                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
                        )}
                    >
                        <List className="w-4 h-4" /> Liste
                    </button>
                </div>
            </PageHeader>

            {viewMode === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {KANBAN_COLUMNS.map(col => {
                        const colTickets = grouped[col.id] || []
                        return (
                            <div key={col.id} className={cn("rounded-xl border-t-4 p-4 min-h-[300px]", col.color, col.bg)}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <span>{col.emoji}</span>
                                        {col.label}
                                    </h3>
                                    <span className="text-xs font-bold text-[var(--color-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                                        {colTickets.length}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {colTickets.length > 0 ? (
                                        colTickets.map(ticket => (
                                            <KanbanCard key={ticket.id} ticket={ticket} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-sm text-[var(--color-muted)]">
                                            Aucun ticket
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                tickets.length > 0 ? (
                    <DataTable
                        columns={listColumns}
                        data={tickets}
                        isLoading={isLoading}
                    />
                ) : (
                    <EmptyState
                        icon={Wrench}
                        title="Aucune intervention"
                        description="Aucun ticket de maintenance n'a été créé."
                        actionLabel="Planifier une intervention"
                        onAction={() => { }}
                    />
                )
            )}
        </div>
    )
}
