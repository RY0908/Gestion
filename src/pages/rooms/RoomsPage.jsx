import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'
import { DoorOpen, Users, Monitor, ChevronLeft, ChevronRight, Server, Printer, Laptop, Package } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets.js'

const HOURS = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`)

// Group equipment localisation into logical "rooms/zones"
function buildZonesFromAssets(assets) {
    const zoneMap = {}
    for (const asset of assets) {
        const loc = asset.location || 'Non défini'
        if (!zoneMap[loc]) {
            zoneMap[loc] = { id: loc, name: loc, assets: [], statuses: {} }
        }
        zoneMap[loc].assets.push(asset)
        zoneMap[loc].statuses[asset.status] = (zoneMap[loc].statuses[asset.status] || 0) + 1
    }

    return Object.values(zoneMap).map(zone => ({
        ...zone,
        totalCount: zone.assets.length,
        activeCount: (zone.statuses['EN_SERVICE'] || 0) + (zone.statuses['ASSIGNED'] || 0),
        maintenanceCount: zone.statuses['IN_MAINTENANCE'] || 0,
        laptopCount: zone.assets.filter(a => a.category === 'LAPTOP').length,
        desktopCount: zone.assets.filter(a => a.category === 'DESKTOP').length,
        printerCount: zone.assets.filter(a => a.category === 'PRINTER').length,
        serverCount: zone.assets.filter(a => a.category === 'SERVER').length,
        occupancyRate: zone.assets.length > 0
            ? Math.round(((zone.statuses['EN_SERVICE'] || 0) + (zone.statuses['ASSIGNED'] || 0)) / zone.assets.length * 100)
            : 0,
    })).sort((a, b) => b.totalCount - a.totalCount)
}

export default function RoomsPage() {
    const [view, setView] = useState('grid')
    const [search, setSearch] = useState('')
    const today = new Date()
    const dateStr = today.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    // Fetch all assets (large page size to get all)
    const { data: assetsRes, isLoading } = useAssets({ pageSize: 500 })
    const assets = assetsRes?.data || []

    const zones = useMemo(() => buildZonesFromAssets(assets), [assets])

    const filtered = useMemo(() => {
        if (!search.trim()) return zones
        const q = search.toLowerCase()
        return zones.filter(z => z.name.toLowerCase().includes(q))
    }, [zones, search])

    const totalEquip = zones.reduce((s, z) => s + z.totalCount, 0)
    const totalActive = zones.reduce((s, z) => s + z.activeCount, 0)
    const totalMaint = zones.reduce((s, z) => s + z.maintenanceCount, 0)

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Locaux & Emplacements"
                count={zones.length}
                description={isLoading ? 'Chargement...' : `${totalEquip} équipements répartis sur ${zones.length} zones`}
            >
                <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <button
                        onClick={() => setView('grid')}
                        className={cn('px-3 py-2 text-sm font-medium transition-colors', view === 'grid' ? 'bg-sonatrach-green/10 text-sonatrach-green' : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]')}
                    >Grille</button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn('px-3 py-2 text-sm font-medium transition-colors', view === 'calendar' ? 'bg-sonatrach-green/10 text-sonatrach-green' : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]')}
                    >Tableau</button>
                </div>
            </PageHeader>

            {/* KPI bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total équipements', value: totalEquip, color: 'text-[var(--color-text)]' },
                    { label: 'En service / Affectés', value: totalActive, color: 'text-sonatrach-green' },
                    { label: 'En maintenance', value: totalMaint, color: 'text-amber-500' },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                        <div className={cn('text-3xl font-display font-bold', kpi.color)}>{isLoading ? '—' : kpi.value}</div>
                        <div className="text-xs text-[var(--color-muted)] mt-1">{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher une zone..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none focus:border-sonatrach-green/50"
                />
                <DoorOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            </div>

            {view === 'grid' ? (
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-48 skeleton-shimmer rounded-xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState title="Aucune zone trouvée" description="Aucun équipement localisé ne correspond à votre recherche." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((zone, i) => (
                            <div key={zone.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-lg bg-sonatrach-green/10 flex items-center justify-center">
                                            <DoorOpen className="w-4 h-4 text-sonatrach-green" />
                                        </div>
                                        <h3 className="font-semibold text-sm leading-tight max-w-[140px]">{zone.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-display font-bold text-sonatrach-green">{zone.occupancyRate}%</div>
                                        <div className="text-[10px] text-[var(--color-muted)]">occupation</div>
                                    </div>
                                </div>

                                {/* Occupancy bar */}
                                <div className="w-full h-1.5 bg-[var(--color-bg)] rounded-full mb-4">
                                    <div
                                        className="h-full bg-sonatrach-green rounded-full transition-all"
                                        style={{ width: `${zone.occupancyRate}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-muted)]">
                                    <div className="flex items-center gap-1.5"><Package className="w-3 h-3" />{zone.totalCount} équip.</div>
                                    <div className="flex items-center gap-1.5"><Laptop className="w-3 h-3" />{zone.laptopCount + zone.desktopCount} postes</div>
                                    <div className="flex items-center gap-1.5"><Printer className="w-3 h-3" />{zone.printerCount} imprimantes</div>
                                    <div className="flex items-center gap-1.5"><Server className="w-3 h-3" />{zone.serverCount} serveurs</div>
                                </div>

                                {zone.maintenanceCount > 0 && (
                                    <div className="mt-3 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                        ⚠ {zone.maintenanceCount} équipement(s) en maintenance
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* Table view */
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize">{dateStr}</span>
                        <span className="text-xs text-[var(--color-muted)]">{zones.length} zones • {totalEquip} équipements</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                                    <th className="text-left p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Zone / Localisation</th>
                                    <th className="text-center p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Total</th>
                                    <th className="text-center p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Postes</th>
                                    <th className="text-center p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Imprimantes</th>
                                    <th className="text-center p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Serveurs</th>
                                    <th className="text-center p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Maintenance</th>
                                    <th className="text-center p-3 text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Taux</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading
                                    ? [...Array(6)].map((_, i) => (
                                        <tr key={i}><td colSpan={7} className="p-3"><div className="h-6 skeleton-shimmer rounded" /></td></tr>
                                    ))
                                    : filtered.map(zone => (
                                        <tr key={zone.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                                            <td className="p-3 font-medium">{zone.name}</td>
                                            <td className="p-3 text-center font-semibold">{zone.totalCount}</td>
                                            <td className="p-3 text-center">{zone.laptopCount + zone.desktopCount}</td>
                                            <td className="p-3 text-center">{zone.printerCount}</td>
                                            <td className="p-3 text-center">{zone.serverCount}</td>
                                            <td className="p-3 text-center">
                                                {zone.maintenanceCount > 0
                                                    ? <span className="text-amber-600 font-semibold">{zone.maintenanceCount}</span>
                                                    : <span className="text-[var(--color-muted)]">—</span>
                                                }
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={cn('font-semibold', zone.occupancyRate > 80 ? 'text-sonatrach-green' : zone.occupancyRate > 50 ? 'text-amber-500' : 'text-[var(--color-muted)]')}>
                                                    {zone.occupancyRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
