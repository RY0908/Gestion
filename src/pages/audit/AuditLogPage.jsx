import { useState, useMemo } from 'react'
import { useAuditLog } from '@/hooks/useAuditLog.js'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { TableSkeleton } from '@/components/atoms/LoadingSkeleton.jsx'
import { UserCard } from '@/components/organisms/UserCard.jsx'
import { initials, formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { History, Package, UserCheck, Key, Wrench, Settings, Filter, Search, Clock } from 'lucide-react'

const ACTION_CONFIG = {
    'asset created': { icon: Package, color: 'bg-green-500', label: 'Création actif' },
    'asset updated': { icon: Package, color: 'bg-blue-500', label: 'Mise à jour actif' },
    'asset assigned': { icon: UserCheck, color: 'bg-indigo-500', label: 'Affectation' },
    'asset returned': { icon: UserCheck, color: 'bg-gray-500', label: 'Retour' },
    'maintenance scheduled': { icon: Wrench, color: 'bg-amber-500', label: 'Maintenance planifiée' },
    'maintenance completed': { icon: Wrench, color: 'bg-green-500', label: 'Maintenance terminée' },
    'license added': { icon: Key, color: 'bg-purple-500', label: 'Licence ajoutée' },
    'request approved': { icon: Settings, color: 'bg-blue-500', label: 'Demande approuvée' },
    'request rejected': { icon: Settings, color: 'bg-red-500', label: 'Demande refusée' },
}

const ALL_TYPES = Object.keys(ACTION_CONFIG)

export default function AuditLogPage() {
    const { data, isLoading } = useAuditLog()
    const [typeFilter, setTypeFilter] = useState('')
    const [search, setSearch] = useState('')

    const entries = data?.data || []

    const filtered = useMemo(() => {
        let result = entries
        if (typeFilter) result = result.filter(e => e.action === typeFilter)
        if (search) result = result.filter(e =>
            e.action?.toLowerCase().includes(search.toLowerCase()) ||
            e.description?.toLowerCase().includes(search.toLowerCase()) ||
            e.user?.fullName?.toLowerCase().includes(search.toLowerCase())
        )
        return result
    }, [entries, typeFilter, search])

    // Group by date
    const grouped = useMemo(() => {
        const groups = {}
        filtered.forEach(entry => {
            const dateKey = new Date(entry.timestamp).toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push(entry)
        })
        return groups
    }, [filtered])

    if (isLoading) return <div className="p-6 max-w-5xl mx-auto"><TableSkeleton rows={8} cols={3} /></div>

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <PageHeader
                title="Journal d'audit"
                count={entries.length}
                description="Tracez toutes les actions effectuées dans le système."
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        type="text"
                        placeholder="Rechercher dans le journal..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm transition-all outline-none"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none"
                >
                    <option value="">Tous les types</option>
                    {ALL_TYPES.map(t => (
                        <option key={t} value={t}>{ACTION_CONFIG[t]?.label || t}</option>
                    ))}
                </select>
            </div>

            {/* Timeline */}
            {Object.keys(grouped).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([dateKey, items]) => (
                        <div key={dateKey}>
                            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-4 capitalize flex items-center gap-2">
                                <Clock className="w-4 h-4" /> {dateKey}
                            </h3>
                            <div className="space-y-0 relative ml-4 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-[var(--color-border)]">
                                {items.map((entry, i) => {
                                    const config = ACTION_CONFIG[entry.action] || { icon: History, color: 'bg-gray-500', label: entry.action }
                                    const Icon = config.icon
                                    return (
                                        <div key={entry.id || i} className="flex gap-4 pb-4 relative animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10', config.color)}>
                                                <Icon className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 shadow-sm card-hover">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">{config.label}</span>
                                                    <span className="text-[10px] text-[var(--color-muted)]">
                                                        {new Date(entry.timestamp).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm">{entry.description}</p>
                                                {entry.user && (
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-muted)]">
                                                        <div className="w-5 h-5 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center text-[8px] font-bold">
                                                            {initials(entry.user.fullName)}
                                                        </div>
                                                        {entry.user.fullName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={History}
                    title="Aucune entrée"
                    description="Aucune activité ne correspond à vos filtres."
                    actionLabel="Réinitialiser"
                    onAction={() => { setTypeFilter(''); setSearch('') }}
                />
            )}
        </div>
    )
}
