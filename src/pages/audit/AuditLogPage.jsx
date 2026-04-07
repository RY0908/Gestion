import { useState, useMemo } from 'react'
import { useAuditLog } from '@/hooks/useAuditLog.js'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { TableSkeleton } from '@/components/atoms/LoadingSkeleton.jsx'
import { initials } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { History, Package, UserCheck, Key, Wrench, Settings, Filter, Search, Clock, FileText, Trash2, LogIn, LogOut, FileCode } from 'lucide-react'

const getActionConfig = (action, entityType) => {
    const act = action?.toUpperCase()
    const ent = entityType?.toUpperCase()

    if (act === 'LOGIN') return { icon: LogIn, color: 'bg-blue-400', label: 'Connexion' }
    if (act === 'LOGOUT') return { icon: LogOut, color: 'bg-gray-400', label: 'Déconnexion' }
    if (act === 'DELETE') return { icon: Trash2, color: 'bg-red-500', label: `Suppression ${ent || ''}` }
    if (act === 'ASSIGN') return { icon: UserCheck, color: 'bg-indigo-500', label: 'Affectation' }
    if (act === 'RETURN') return { icon: Package, color: 'bg-gray-500', label: 'Retour équipement' }
    if (act === 'RESOLVE') return { icon: Settings, color: 'bg-emerald-500', label: 'Ticket résolu' }

    if (act === 'CREATE') {
        if (ent === 'EQUIPEMENT') return { icon: Package, color: 'bg-green-500', label: 'Création équipement' }
        if (ent === 'DEMANDE') return { icon: Settings, color: 'bg-green-500', label: 'Création ticket' }
        if (ent === 'MAINTENANCE') return { icon: Wrench, color: 'bg-green-500', label: 'Ouverture maintenance' }
        if (ent === 'LICENCE') return { icon: Key, color: 'bg-green-500', label: 'Ajout licence' }
        if (ent === 'UTILISATEUR') return { icon: UserCheck, color: 'bg-green-500', label: 'Création utilisateur' }
        if (ent === 'DOCUMENT') return { icon: FileText, color: 'bg-teal-500', label: 'Génération document' }
        return { icon: History, color: 'bg-green-500', label: 'Création' }
    }

    if (act === 'UPDATE') {
        if (ent === 'EQUIPEMENT') return { icon: Package, color: 'bg-amber-500', label: 'Modification équipement' }
        if (ent === 'DEMANDE') return { icon: Settings, color: 'bg-amber-500', label: 'Mise à jour ticket' }
        if (ent === 'MAINTENANCE') return { icon: Wrench, color: 'bg-amber-500', label: 'Mise à jour maintenance' }
        if (ent === 'LICENCE') return { icon: Key, color: 'bg-amber-500', label: 'Mise à jour licence' }
        if (ent === 'UTILISATEUR') return { icon: UserCheck, color: 'bg-amber-500', label: 'Modification utilisateur' }
        return { icon: History, color: 'bg-amber-500', label: 'Mise à jour' }
    }

    return { icon: History, color: 'bg-gray-500', label: act || 'Action système' }
}

const ALL_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'RETURN', 'RESOLVE', 'LOGIN', 'LOGOUT']
const ALL_ENTITIES = ['EQUIPEMENT', 'DEMANDE', 'MAINTENANCE', 'LICENCE', 'AFFECTATION', 'UTILISATEUR', 'DOCUMENT']

export default function AuditLogPage() {
    const { data, isLoading } = useAuditLog()
    const [actionFilter, setActionFilter] = useState('')
    const [entityFilter, setEntityFilter] = useState('')
    const [search, setSearch] = useState('')
    const [expandedJson, setExpandedJson] = useState(null)

    const entries = data?.data || []

    const filtered = useMemo(() => {
        let result = entries
        if (actionFilter) result = result.filter(e => e.action === actionFilter)
        if (entityFilter) result = result.filter(e => e.entityType === entityFilter)
        if (search) result = result.filter(e =>
            e.description?.toLowerCase().includes(search.toLowerCase()) ||
            e.user?.fullName?.toLowerCase().includes(search.toLowerCase())
        )
        return result
    }, [entries, actionFilter, entityFilter, search])

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
                description="Trace de toutes les opérations effectuées dans SIGMA."
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        type="text"
                        placeholder="Rechercher par description ou utilisateur..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-[var(--color-surface)] text-sm transition-all outline-none"
                    />
                </div>
                <select
                    value={actionFilter}
                    onChange={e => setActionFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none w-40"
                >
                    <option value="">Actions (Toutes)</option>
                    {ALL_ACTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                    value={entityFilter}
                    onChange={e => setEntityFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none w-44"
                >
                    <option value="">Entités (Toutes)</option>
                    {ALL_ENTITIES.map(t => <option key={t} value={t}>{t}</option>)}
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
                                    const config = getActionConfig(entry.action, entry.entityType)
                                    const Icon = config.icon
                                    return (
                                        <div key={entry.id || i} className="flex gap-4 pb-4 relative animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10', config.color, 'shadow-sm')}>
                                                <Icon className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-3 px-4 shadow-sm card-hover relative group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">{config.label}</span>
                                                    <div className="flex items-center gap-3">
                                                        {entry.changes && Object.keys(entry.changes).length > 0 && (
                                                            <button 
                                                                onClick={() => setExpandedJson(expandedJson === entry.id ? null : entry.id)}
                                                                className="text-[10px] text-[var(--color-muted)] hover:text-sonatrach-green flex items-center gap-1 bg-[var(--color-bg)] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                                            >
                                                                <FileCode className="w-3 h-3" /> Data
                                                            </button>
                                                        )}
                                                        <span className="text-xs text-[var(--color-muted)] font-mono">
                                                            {new Date(entry.timestamp).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium mb-2 opacity-90">{entry.description}</p>
                                                
                                                <div className="flex items-center justify-between mt-3 text-xs border-t border-[var(--color-border)] pt-2">
                                                    <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
                                                        <div className="w-5 h-5 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center text-[9px] font-bold">
                                                            {entry.user ? initials(entry.user.fullName) : 'SY'}
                                                        </div>
                                                        <span className="font-medium text-[var(--color-text)] opacity-80">{entry.user ? entry.user.fullName : 'Système'}</span>
                                                        {entry.user && <span className="text-[10px] bg-[var(--color-bg)] px-1.5 py-0.5 rounded ml-1">{entry.user.role}</span>}
                                                    </div>
                                                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{entry.entityType}</span>
                                                </div>

                                                {/* JSON Viewer Dropdown */}
                                                {expandedJson === entry.id && entry.changes && (
                                                    <div className="mt-3 bg-[var(--color-bg)] rounded-lg p-3 text-xs font-mono overflow-auto max-h-48 border border-[var(--color-border)]">
                                                        <pre className="text-[var(--color-text)] opacity-80">
                                                            {JSON.stringify(entry.changes, null, 2)}
                                                        </pre>
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
                    description="Aucune activité ne correspond à vos filtres actuels."
                    actionLabel="Réinitialiser les filtres"
                    onAction={() => { setActionFilter(''); setEntityFilter(''); setSearch('') }}
                />
            )}
        </div>
    )
}
