import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
    LayoutDashboard,
    Package,
    UserCheck,
    Key,
    Wrench,
    ClipboardList,
    BarChart2,
    Users,
    Settings,
    Flame,
    LogOut,
    ChevronLeft,
    ChevronRight,
    DoorOpen,
    History,
    FileText,
    FolderOpen,
    UserCircle2,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore.js'
import { useAuthStore } from '@/store/authStore.js'
import { useAssets } from '@/hooks/useAssets.js'
import { useMaintenances } from '@/hooks/useMaintenances.js'
import { canDo } from '@/lib/permissions.js'
import { cn, initials } from '@/lib/utils.js'

const NAV_ITEMS = [
    { label: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Inventaire', icon: Package, to: '/assets', badgeKey: 'assets', action: 'asset:view' },
    { label: 'Affectations', icon: UserCheck, to: '/assignments', action: 'asset:assign' },
    { label: 'Salles & Locaux', icon: DoorOpen, to: '/rooms' },
    { label: 'Licences', icon: Key, to: '/licenses', action: 'license:manage' },
    { label: 'Maintenance / Tickets', icon: Wrench, to: '/maintenance', action: 'maintenance:manage', badgeKey: 'maintenance' },
    { label: 'Demandes (Globale)', icon: ClipboardList, to: '/requests', action: 'request:manage' },
    { label: 'Mes Demandes', icon: ClipboardList, to: '/my-requests' }, // Everyone
    { label: 'Mon Profil', icon: UserCircle2, to: '/profile' },
    { divider: true },
    { label: 'Documents & Décharges', icon: FolderOpen, to: '/documents', action: 'asset:view' },
    { divider: true },
    { label: 'Rapports', icon: BarChart2, to: '/reports', action: 'report:export' },
    { label: 'Journal d\'Audit', icon: History, to: '/audit-log', action: 'audit:view' },
    { divider: true },
    { label: 'Paramètres', icon: Settings, to: '/settings', action: 'user:manage' },
]

export const Sidebar = () => {
    const sidebarOpen = useUIStore(s => s.sidebarOpen)
    const toggleSidebar = useUIStore(s => s.toggleSidebar)
    const user = useAuthStore(s => s.user)
    const logout = useAuthStore(s => s.logout)

    // Badge counts from live data
    const { data: assetsRes } = useAssets({ pageSize: 1 })
    const { data: maintenanceRes } = useMaintenances({})
    const openTickets = (maintenanceRes?.data || []).filter(t => t.status !== 'COMPLETED').length

    const badgeCounts = {
        assets: assetsRes?.total || 0,
        maintenance: openTickets,
    }

    const items = NAV_ITEMS.filter(it => it.divider || !it.action || canDo(user?.role, it.action))

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? 260 : 64 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="h-full flex flex-col z-20 shrink-0 overflow-y-auto overflow-x-hidden"
            style={{ backgroundColor: 'var(--color-navy)' }}
        >
            {/* Logo Header */}
            <div className="flex items-center justify-between h-16 px-4 shrink-0">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-sonatrach-green flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <motion.div
                        initial={false}
                        animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                        className="ml-3 overflow-hidden whitespace-nowrap"
                    >
                        <span className="font-display font-bold text-white tracking-tight">SIGMA</span>
                        <span className="text-[10px] text-gray-400 block -mt-0.5">IT Assets</span>
                    </motion.div>
                </div>
                {sidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <Tooltip.Provider delayDuration={0}>
                <div className="flex-1 py-4 flex flex-col gap-0.5 px-3">
                    {items.map((item, i) => {
                        if (item.divider) return <div key={i} className="my-3 border-t border-white/10 mx-2" />

                        const badge = item.badgeKey ? badgeCounts[item.badgeKey] : null

                        const content = (
                            <NavLink
                                to={item.to}
                                className={({ isActive }) => cn(
                                    'flex items-center gap-3 h-10 px-2.5 rounded-md transition-all duration-150 relative group',
                                    isActive
                                        ? 'bg-sonatrach-green/15 text-white font-medium'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-indicator"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sonatrach-green rounded-r-full"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={cn(
                                            'w-5 h-5 shrink-0 transition-colors',
                                            isActive ? 'text-sonatrach-green' : ''
                                        )} />
                                        <motion.span
                                            initial={false}
                                            animate={{ opacity: sidebarOpen ? 1 : 0 }}
                                            className="whitespace-nowrap truncate text-sm flex-1"
                                        >
                                            {item.label}
                                        </motion.span>
                                        {badge > 0 && sidebarOpen && (
                                            <span className={cn(
                                                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                                                item.badgeKey === 'maintenance' && openTickets > 0
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-white/10 text-gray-300'
                                            )}>
                                                {badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )

                        if (sidebarOpen) return <div key={i}>{content}</div>

                        return (
                            <Tooltip.Root key={i}>
                                <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side="right"
                                        sideOffset={14}
                                        className="bg-dark-elevated text-white px-3 py-1.5 rounded text-xs z-50 animate-fade-in shadow-lg"
                                    >
                                        {item.label}
                                        {badge > 0 && <span className="ml-1.5 text-gray-400">({badge})</span>}
                                        <Tooltip.Arrow className="fill-dark-elevated" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        )
                    })}
                </div>
            </Tooltip.Provider>

            {/* Collapse toggle (when collapsed) */}
            {!sidebarOpen && (
                <div className="px-3 pb-2">
                    <button
                        onClick={toggleSidebar}
                        className="w-full h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* User Profile */}
            <div className="p-4 border-t border-white/10 shrink-0">
                <div className="flex items-center overflow-hidden mb-3">
                    <div className="w-8 h-8 rounded-full bg-sonatrach-green/20 text-sonatrach-green flex items-center justify-center font-bold text-xs shrink-0">
                        {initials(user?.fullName || '')}
                    </div>
                    <motion.div
                        initial={false}
                        animate={{ opacity: sidebarOpen ? 1 : 0 }}
                        className="ml-3 flex flex-col min-w-0 pr-2"
                    >
                        <span className="text-sm font-medium truncate text-white">{user?.fullName}</span>
                        <span className="text-xs text-gray-400 truncate">{user?.position}</span>
                    </motion.div>
                </div>

                {sidebarOpen ? (
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-2 h-9 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded text-sm transition-colors btn-press"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                ) : (
                    <button onClick={() => logout()} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Déconnexion">
                        <LogOut className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.aside>
    )
}
