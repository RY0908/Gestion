import { useAssets } from '@/hooks/useAssets.js'
import { useAssignments } from '@/hooks/useAssignments.js'
import { useLicenses } from '@/hooks/useLicenses.js'
import { useMaintenances } from '@/hooks/useMaintenances.js'
import { useAuditLog } from '@/hooks/useAuditLog.js'
import { useAuthStore } from '@/store/authStore.js'
import { KpiCard } from '@/components/atoms/KpiCard.jsx'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { ActivityFeed } from '@/components/organisms/ActivityFeed.jsx'
import { DashboardSkeleton } from '@/components/atoms/LoadingSkeleton.jsx'
import { Package, Users, Wrench, AlertTriangle, Bell, Clock, ShieldAlert, Key } from 'lucide-react'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { ASSET_STATUSES } from '@/lib/constants.js'
import { formatDate } from '@/lib/utils.js'

// Custom tooltip for Bar Chart
const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const val = payload[0].value
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 shadow-xl animate-scale-in">
            <p className="text-xs text-[var(--color-muted)] mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: payload[0].fill }} />
                <p className="text-lg font-display font-bold">{val}</p>
                <span className="text-xs text-[var(--color-muted)]">actif{val > 1 ? 's' : ''}</span>
            </div>
        </div>
    )
}

// Custom tooltip for Pie Chart
const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const entry = payload[0]
    const percent = ((entry.value / entry.payload.total) * 100).toFixed(1)
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 shadow-xl animate-scale-in">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.payload.color }} />
                <p className="text-sm font-semibold">{entry.name}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-bold">{entry.value}</span>
                <span className="text-xs text-[var(--color-muted)]">{percent}%</span>
            </div>
        </div>
    )
}

const STATUS_COLORS = {
    IN_STOCK: '#3b82f6',
    ASSIGNED: '#1B6B3A',
    IN_MAINTENANCE: '#f59e0b',
    RETIRED: '#6b7280',
    LOST: '#ef4444',
    RESERVED: '#8b5cf6',
}

const CHART_COLORS = ['#1B6B3A', '#DDA73B', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b']

export default function DashboardPage() {
    const user = useAuthStore(s => s.user)
    const { data: assetsRes, isLoading: assetsLoading } = useAssets({ pageSize: 100 })
    const { data: assignmentsRes, isLoading: asgLoading } = useAssignments({})
    const { data: licensesRes, isLoading: licLoading } = useLicenses({})
    const { data: maintenanceRes, isLoading: mteLoading } = useMaintenances({})
    const canViewAudit = user?.role === 'ADMIN'
    const { data: auditRes, isLoading: auditLoading } = useAuditLog({ enabled: canViewAudit })

    const assets = assetsRes?.data || []
    const assignments = assignmentsRes?.data || []
    const licenses = licensesRes?.data || []
    const maintenances = maintenanceRes?.data || []
    const audits = auditRes?.data || []

    const isFullLoading = assetsLoading && licLoading && mteLoading
    if (isFullLoading) return <DashboardSkeleton />

    const metrics = {
        totalAssets: assets.length,
        inStock: assets.filter(a => a.status === 'IN_STOCK').length,
        assigned: assets.filter(a => a.status === 'ASSIGNED').length,
        maintenance: assets.filter(a => a.status === 'IN_MAINTENANCE').length,
        totalLicenses: licenses.length,
        expiringLicenses: licenses.filter(l => l.complianceStatus !== 'COMPLIANT').length,
        activeAssignments: assignments.filter(a => a.status === 'ACTIVE').length,
        openTickets: maintenances.filter(m => m.status !== 'COMPLETED').length,
    }

    // Count alerts
    const alertCount = metrics.expiringLicenses + (metrics.maintenance > 0 ? 1 : 0)

    // Category data for bar chart
    const categoryData = assets.reduce((acc, asset) => {
        const existing = acc.find(x => x.name === asset.category)
        if (existing) existing.value += 1
        else acc.push({ name: asset.category, value: 1 })
        return acc
    }, []).sort((a, b) => b.value - a.value).slice(0, 6)

    // Status distribution for donut (with total for tooltip percent)
    const statusTotal = assets.length
    const statusData = ASSET_STATUSES.map(s => ({
        name: s.label,
        value: assets.filter(a => a.status === s.value).length,
        color: STATUS_COLORS[s.value] || '#64748b',
        total: statusTotal,
    })).filter(s => s.value > 0)

    // Date formatting
    const today = new Date()
    const dateStr = today.toLocaleDateString('fr-DZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    // Donut center label
    const totalForDonut = statusData.reduce((sum, s) => sum + s.value, 0)

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Greeting Banner */}
            <div className="bg-gradient-to-r from-sonatrach-green/5 via-transparent to-sonatrach-gold/5 border border-[var(--color-border)] rounded-xl p-6">
                <h1 className="text-2xl font-display font-bold">
                    👋 Bonjour, {user?.fullName?.split(' ')[0] || 'Utilisateur'}
                </h1>
                <p className="text-[var(--color-muted)] mt-1 capitalize">{dateStr}</p>
                {alertCount > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sm">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg font-medium">
                            <Bell className="w-3.5 h-3.5" />
                            {alertCount} alerte{alertCount > 1 ? 's' : ''} nécessite{alertCount > 1 ? 'nt' : ''} votre attention
                        </div>
                    </div>
                )}
            </div>

            {/* Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Total Actifs"
                    value={metrics.totalAssets}
                    icon={Package}
                    accentColor="#1B6B3A"
                    trend={12}
                    trendLabel="+12 ce mois"
                    isLoading={assetsLoading}
                />
                <KpiCard
                    label="Actifs Déployés"
                    value={metrics.assigned}
                    icon={Users}
                    accentColor="#3b82f6"
                    trend={5}
                    trendLabel={`Taux ${metrics.totalAssets > 0 ? Math.round((metrics.assigned / metrics.totalAssets) * 100) : 0}%`}
                    isLoading={assetsLoading}
                />
                <KpiCard
                    label="Tickets Ouverts"
                    value={metrics.openTickets}
                    icon={Wrench}
                    accentColor="#DDA73B"
                    trend={metrics.openTickets > 3 ? -1 : 0}
                    trendLabel={metrics.openTickets > 3 ? 'Action requise' : 'Sous contrôle'}
                    isLoading={mteLoading}
                />
                <KpiCard
                    label="Licences à risque"
                    value={metrics.expiringLicenses}
                    icon={AlertTriangle}
                    accentColor="#ef4444"
                    trend={metrics.expiringLicenses > 0 ? -1 : 1}
                    trendLabel={metrics.expiringLicenses > 0 ? 'Action requise' : 'Tout est conforme'}
                    isLoading={licLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bar Chart */}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Répartition par Catégorie</h3>
                        <div className="h-[300px] w-full">
                            {!assetsLoading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--color-bg)', opacity: 0.5 }}
                                            content={<BarTooltip />}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full skeleton-shimmer rounded" />
                            )}
                        </div>
                    </div>

                    {/* Bottom row: Donut + Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Donut Chart */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">État du Parc</h3>
                            <div className="h-[250px] w-full relative">
                                {!assetsLoading ? (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    cx="50%"
                                                    cy="45%"
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<PieTooltip />} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-xs">{value}</span>} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center total */}
                                        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                            <div className="text-2xl font-display font-bold">{totalForDonut}</div>
                                            <div className="text-[10px] text-[var(--color-muted)]">Total</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-32 h-32 rounded-full skeleton-shimmer mx-auto mt-10" />
                                )}
                            </div>
                        </div>

                        {/* Alerts Panel */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-amber-500" />
                                Alertes actives
                            </h3>
                            <div className="space-y-3">
                                {metrics.expiringLicenses > 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                        <Key className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Licences non conformes</p>
                                            <p className="text-xs text-[var(--color-muted)] mt-0.5">{metrics.expiringLicenses} licence{metrics.expiringLicenses > 1 ? 's' : ''} requière{metrics.expiringLicenses > 1 ? 'nt' : 'nt'} attention</p>
                                        </div>
                                        <span className="ml-auto text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">{metrics.expiringLicenses}</span>
                                    </div>
                                )}
                                {metrics.openTickets > 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                                        <Wrench className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Tickets maintenance</p>
                                            <p className="text-xs text-[var(--color-muted)] mt-0.5">{metrics.openTickets} en attente de résolution</p>
                                        </div>
                                        <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{metrics.openTickets}</span>
                                    </div>
                                )}
                                {metrics.expiringLicenses === 0 && metrics.openTickets === 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg text-sm text-green-700 dark:text-green-400">
                                        <span className="text-lg">✅</span>
                                        Aucune alerte active — tout est sous contrôle
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed Section */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm flex flex-col h-full max-h-[800px]">
                    <h3 className="text-lg font-semibold mb-4 shrink-0 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[var(--color-muted)]" />
                        Activité Récente
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <ActivityFeed activities={canViewAudit ? audits : []} isLoading={canViewAudit ? auditLoading : false} />
                    </div>
                </div>
            </div>
        </div>
    )
}
