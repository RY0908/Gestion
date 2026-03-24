import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn, initials } from '@/lib/utils.js'
import {
    Bell, Package, Wrench, Key, UserCheck, Settings,
    Check, Archive, Clock, Filter
} from 'lucide-react'

const CATEGORIES = [
    { id: 'all', label: 'Toutes', icon: Bell, count: null },
    { id: 'assets', label: 'Actifs', icon: Package, count: 5 },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: 3 },
    { id: 'licenses', label: 'Licences', icon: Key, count: 2 },
    { id: 'assignments', label: 'Affectations', icon: UserCheck, count: 4 },
    { id: 'system', label: 'Système', icon: Settings, count: 1 },
]

const MOCK_NOTIFICATIONS = [
    { id: 1, category: 'assets', title: 'Nouvel actif enregistré', desc: 'Laptop ThinkPad T14 ajouté à l\'inventaire par Amina Benali', time: 'Il y a 5 min', read: false, user: 'Amina Benali' },
    { id: 2, category: 'maintenance', title: 'Ticket de maintenance créé', desc: 'Imprimante HP LaserJet — Bourrage papier récurrent', time: 'Il y a 30 min', read: false, user: 'Karim Meziani' },
    { id: 3, category: 'licenses', title: 'Licence expirée', desc: 'Adobe Creative Suite — 3 postes impactés, renouvellement urgent', time: 'Il y a 1h', read: false, user: 'Système' },
    { id: 4, category: 'assignments', title: 'Retour d\'équipement', desc: 'PC-2024-067 retourné par Yasmine Boudaoud (Direction Finances)', time: 'Il y a 2h', read: true, user: 'Yasmine Boudaoud' },
    { id: 5, category: 'assets', title: 'Garantie bientôt expirée', desc: 'Dell Latitude 7420 (STR-LAP-2022-0012) — expire dans 15 jours', time: 'Il y a 3h', read: false, user: 'Système' },
    { id: 6, category: 'maintenance', title: 'Maintenance terminée', desc: 'Serveur rack HP ProLiant — Mise à jour firmware complétée', time: 'Il y a 5h', read: true, user: 'Tarek Ould Ali' },
    { id: 7, category: 'system', title: 'Exportation terminée', desc: 'Le rapport mensuel des actifs a été exporté avec succès', time: 'Il y a 6h', read: true, user: 'Système' },
    { id: 8, category: 'assignments', title: 'Nouvelle affectation', desc: 'Laptop Lenovo ThinkPad assigné à Mohamed Hadj Ali (DSI)', time: 'Il y a 8h', read: true, user: 'Amina Benali' },
    { id: 9, category: 'licenses', title: 'Alerte conformité', desc: 'Microsoft 365 — utilisation supérieure au nombre de licences achetées', time: 'Hier', read: false, user: 'Système' },
    { id: 10, category: 'assets', title: 'Actif marqué perdé', desc: 'Tablette Samsung Galaxy Tab S7 (STR-TAB-2023-0005) signalée perdue', time: 'Hier', read: true, user: 'Nadia Saidi' },
    { id: 11, category: 'maintenance', title: 'Pièce en commande', desc: 'Carte mère pour Dell OptiPlex 7080 — délai 5-7 jours ouvrés', time: 'Hier', read: true, user: 'Karim Meziani' },
    { id: 12, category: 'assignments', title: 'Demande de prêt approuvée', desc: 'Vidéoprojecteur Epson accordé pour la réunion du 15/03', time: 'Il y a 2 jours', read: true, user: 'Amina Benali' },
    { id: 13, category: 'assets', title: 'Stock bas alerte', desc: 'Clavier USB — seulement 2 unités restantes en stock', time: 'Il y a 2 jours', read: true, user: 'Système' },
    { id: 14, category: 'assets', title: 'Nouveau lot reçu', desc: '10 souris sans fil Logitech MX Master 3 ajoutées au stock', time: 'Il y a 3 jours', read: true, user: 'Fouad Amokrane' },
    { id: 15, category: 'system', title: 'Sauvegarde effectuée', desc: 'La sauvegarde automatique de la base de données a réussi', time: 'Il y a 3 jours', read: true, user: 'Système' },
]

const CATEGORY_ICON = {
    assets: Package,
    maintenance: Wrench,
    licenses: Key,
    assignments: UserCheck,
    system: Settings,
}

const CATEGORY_COLOR = {
    assets: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    maintenance: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    licenses: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    assignments: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    system: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
}

export default function NotificationsPage() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

    const filtered = useMemo(() => {
        if (activeCategory === 'all') return notifications
        return notifications.filter(n => n.category === activeCategory)
    }, [notifications, activeCategory])

    const unreadCount = notifications.filter(n => !n.read).length

    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <PageHeader
                title="Notifications"
                count={unreadCount}
                description="Restez informé des événements importants."
            >
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
                                {cat.count && (
                                    <span className="text-[10px] bg-[var(--color-bg)] px-1.5 py-0.5 rounded-full">{cat.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 space-y-2">
                    {filtered.length > 0 ? filtered.map((n, i) => {
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
