import { useState, useRef, useEffect, useCallback } from 'react'
import { Menu, Search, Bell, Sun, Moon, X, ArrowRight, Package, Wrench, Key, Clock } from 'lucide-react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import { useUIStore } from '@/store/uiStore.js'
import { useAuthStore } from '@/store/authStore.js'
import { initials } from '@/lib/utils.js'

const BREADCRUMB_MAP = {
    dashboard: 'Tableau de bord',
    assets: 'Inventaire',
    assignments: 'Affectations',
    licenses: 'Licences',
    maintenance: 'Maintenance',
    requests: 'Demandes',
    reports: 'Rapports',
    settings: 'Paramètres',
    users: 'Utilisateurs',
    preferences: 'Préférences',
    profile: 'Mon Profil',
    new: 'Nouveau',
    edit: 'Modifier',
}

// Mock recent notifications
const MOCK_NOTIFICATIONS = [
    { id: 1, icon: Package, color: 'text-blue-500', title: 'Nouvel actif ajouté', desc: 'Laptop ThinkPad X1 Carbon', time: 'Il y a 5 min', link: '/assets' },
    { id: 2, icon: Wrench, color: 'text-amber-500', title: 'Ticket maintenance créé', desc: 'Imprimante HP — Bourrage papier', time: 'Il y a 1h', link: '/maintenance' },
    { id: 3, icon: Key, color: 'text-red-500', title: 'Licence expirée', desc: 'Adobe Creative Suite — 3 postes', time: 'Il y a 3h', link: '/licenses' },
    { id: 4, icon: Clock, color: 'text-sonatrach-green', title: 'Affectation terminée', desc: 'PC-2024-092 assigné à K. Benmoussa', time: 'Il y a 5h', link: '/assignments' },
]

export const TopBar = () => {
    const { toggleSidebar, theme, setTheme } = useUIStore()
    const user = useAuthStore(s => s.user)
    const logout = useAuthStore(s => s.logout)
    const navigate = useNavigate()
    const location = useLocation()
    const searchRef = useRef(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)

    const pathParts = location.pathname.split('/').filter(Boolean)

    // Ctrl+K shortcut
    const handleKeyDown = useCallback((e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            searchRef.current?.focus()
            setSearchOpen(true)
        }
        if (e.key === 'Escape') {
            setSearchOpen(false)
            searchRef.current?.blur()
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    useEffect(() => {
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-md transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <nav className="hidden sm:flex items-center text-sm font-medium text-[var(--color-muted)]" aria-label="Breadcrumb">
                    {pathParts.map((part, index) => {
                        const isLast = index === pathParts.length - 1
                        const isId = /^[a-z0-9-]+$/i.test(part) && !BREADCRUMB_MAP[part] && part.length > 3
                        const label = isId ? `#${part.slice(0, 8)}` : BREADCRUMB_MAP[part] || part
                        return (
                            <div key={`${part}-${index}`} className="flex items-center">
                                {index > 0 && <span className="mx-2 text-[var(--color-border)]">/</span>}
                                <span className={isLast ? 'text-[var(--color-text)] font-semibold' : ''}>
                                    {label.charAt(0).toUpperCase() + label.slice(1)}
                                </span>
                            </div>
                        )
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2">
                {/* Global Search */}
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Rechercher (Ctrl+K)..."
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                        className="w-56 focus:w-80 h-9 pl-9 pr-3 rounded-lg bg-[var(--color-bg)] border border-transparent focus:border-sonatrach-green/30 focus:bg-[var(--color-surface)] focus:ring-1 focus:ring-sonatrach-green/20 outline-none text-sm transition-all duration-200"
                    />
                    {!searchOpen && (
                        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 font-mono pointer-events-none">
                            ⌘K
                        </kbd>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notifications */}
                <Popover.Root open={notifOpen} onOpenChange={setNotifOpen}>
                    <Popover.Trigger asChild>
                        <button
                            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--color-surface)] pulse-critical" />
                        </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content
                            align="end"
                            sideOffset={8}
                            className="w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 animate-scale-in overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                                <h4 className="font-semibold text-sm">Notifications</h4>
                                <span className="text-[10px] font-medium bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full">{MOCK_NOTIFICATIONS.length} nouvelles</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {MOCK_NOTIFICATIONS.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => { setNotifOpen(false); navigate(n.link) }}
                                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bg)] transition-colors text-left"
                                    >
                                        <div className={`p-1.5 rounded-lg bg-[var(--color-bg)] ${n.color} shrink-0 mt-0.5`}>
                                            <n.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{n.title}</p>
                                            <p className="text-xs text-[var(--color-muted)] truncate">{n.desc}</p>
                                            <p className="text-[10px] text-[var(--color-muted)] mt-1">{n.time}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-[var(--color-border)]">
                                <Link
                                    to="/notifications"
                                    onClick={() => setNotifOpen(false)}
                                    className="text-xs font-medium text-sonatrach-green hover:text-sonatrach-green-light flex items-center justify-center gap-1 transition-colors"
                                >
                                    Voir toutes les notifications <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>

                {/* Profile */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="ml-1 w-8 h-8 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center font-bold text-xs hover:bg-sonatrach-green/20 transition-colors">
                            {initials(user?.fullName || '')}
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" className="w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl py-1 mt-1 z-50 animate-scale-in overflow-hidden">
                            <div className="px-3 py-3 border-b border-[var(--color-border)]">
                                <p className="text-sm font-semibold">{user?.fullName}</p>
                                <p className="text-xs text-[var(--color-muted)]">{user?.position}</p>
                                <p className="text-[10px] text-sonatrach-green font-medium mt-1">{user?.role}</p>
                            </div>
                            <DropdownMenu.Item asChild className="px-3 py-2 text-sm outline-none cursor-pointer hover:bg-[var(--color-bg)] focus:bg-[var(--color-bg)]">
                                <Link to="/profile" className="w-full inline-block">Mon profil</Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild className="px-3 py-2 text-sm outline-none cursor-pointer hover:bg-[var(--color-bg)] focus:bg-[var(--color-bg)]">
                                <Link to="/requests" className="w-full inline-block">Mes demandes</Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild className="px-3 py-2 text-sm outline-none cursor-pointer hover:bg-[var(--color-bg)] focus:bg-[var(--color-bg)]">
                                <Link to="/settings/preferences" className="w-full inline-block">Préférences</Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-[var(--color-border)] my-1" />
                            <DropdownMenu.Item
                                onSelect={() => logout()}
                                className="px-3 py-2 text-sm outline-none cursor-pointer hover:bg-red-50 text-red-500 focus:bg-red-50 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10"
                            >
                                Déconnexion
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header>
    )
}
