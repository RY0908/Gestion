import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'
import {
    Bell, Package, Wrench, Key, UserCheck, Settings,
    Check, Archive, Clock, Filter, RefreshCw
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications.js'

const CATEGORY_ICON = {
    assets:      Package,
    maintenance: Wrench,
    license:     Key,
    request:     Settings,
    assignment:  UserCheck,
}

const CATEGORY_COLOR = {
    assets:      'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    maintenance: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    license:     'text-red-500 bg-red-50 dark:bg-red-900/20',
    request:     'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    assignment:  'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
}

const CATEGORIES = [
    { id: 'all',         label: 'Toutes',      icon: Bell },
    { id: 'license',     label: 'Licences',     icon: Key },
    { id: 'maintenance', label: 'Maintenance',  icon: Wrench },
    { id: 'request',     label: 'Tickets',      icon: Settings },
    { id: 'assignment',  label: 'Affectations', icon: UserCheck },
]

export default function NotificationsPage() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [readIds, setReadIds] = useState([])
    const { data, isLoading, refetch } = useNotifications()
    const notifications = useMemo(
        () => (data?.notifications || []).map(n => ({ ...n, read: readIds.includes(n.id) })),
        [data, readIds]
    )

    const filtered = useMemo(() => {
        if (activeCategory === 'all') return notifications
        return notifications.filter(n => n.category === activeCategory)
    }, [notifications, activeCategory])

    const unreadCount = notifications.filter(n => !n.read).length

    const markRead = (id) => {
        setReadIds(prev => (prev.includes(id) ? prev : [...prev, id]))
    }

    const markAllRead = () => {
        setReadIds(notifications.map(n => n.id))
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
        <PageHeader
                title="Notifications"
                count={unreadCount}
                description={isLoading ? 'Chargement des alertes...' : `${notifications.length} alertes actives du système.`}
            >
                <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                    Actualiser
                </button>
                <button
                    onClick={markAllRead}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg text-sm font-medium transition-colors btn-press"
                    disabled={unreadCount === 0}
                >
                    <Check className="w-4 h-4" />
                    Tout marquer lu
                </button>
            </PageHeader>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Filters */}
                <div className="lg:w-56 shrink-0">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-[var(--color-border)]">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5" /> Catégories
                            </h3>
                        </div>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                    activeCategory === cat.id
                                        ? 'bg-sonatrach-green/5 text-sonatrach-green font-medium border-l-2 border-sonatrach-green'
                                        : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
                                )}
                            >
                                <cat.icon className="w-4 h-4" />
                                <span className="flex-1 text-left">{cat.label}</span>
                                {cat.id !== 'all' && (
                                    <span className="text-[10px] bg-[var(--color-bg)] px-1.5 py-0.5 rounded-full">
                                        {notifications.filter(n => n.category === cat.id).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 space-y-2">
                {isLoading ? (
                    <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-16 skeleton-shimmer rounded-xl" />)}</div>
                ) : filtered.length > 0 ? filtered.map((n, i) => {
                        const Icon = CATEGORY_ICON[n.category] || Bell
                        const colorCls = CATEGORY_COLOR[n.category] || ''
                        return (
                            <div
                                key={n.id}
                                className={cn(
                                    'flex items-start gap-4 p-4 rounded-xl border transition-all animate-fade-in cursor-pointer',
                                    n.read
                                        ? 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-70 hover:opacity-100'
                                        : 'bg-[var(--color-surface)] border-sonatrach-green/20 shadow-sm'
                                )}
                                style={{ animationDelay: `${i * 30}ms` }}
                                onClick={() => markRead(n.id)}
                            >
                                <div className={cn('p-2 rounded-xl shrink-0', colorCls)}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</h4>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-sonatrach-green shrink-0" />}
                                    </div>
                                    <p className="text-xs text-[var(--color-muted)] line-clamp-2">{n.desc}</p>
                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--color-muted)]">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {n.time}
                                        </span>
                                        <span>par {n.user}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!n.read && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                                            className="p-1.5 text-[var(--color-muted)] hover:text-sonatrach-green hover:bg-sonatrach-green/5 rounded-lg transition-colors"
                                            title="Marquer comme lu"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation() }}
                                        className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
                                        title="Archiver"
                                    >
                                        <Archive className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )
                    }) : (
                        <EmptyState
                            icon={Bell}
                            title="Aucune notification"
                            description="Vous êtes à jour ! Aucune notification dans cette catégorie."
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
