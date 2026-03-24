import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download, Upload, Search, Filter, LayoutGrid, List, LayoutList } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets.js'
import { useFilterStore } from '@/store/filterStore.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { ASSET_STATUSES, ASSET_CATEGORIES } from '@/lib/constants.js'
import { cn } from '@/lib/utils.js'

const VIEW_MODES = [
    { id: 'table', icon: List, label: 'Tableau' },
    { id: 'grid', icon: LayoutGrid, label: 'Grille' },
    { id: 'card', icon: LayoutList, label: 'Carte' },
]

export default function AssetListPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [viewMode, setViewMode] = useState('table')
    const pageSize = 15

    const { assets: filters, setAssetFilters, clearAssetFilters } = useFilterStore()

    const { data, isLoading } = useAssets({
        page,
        pageSize,
        status: filters?.status || '',
        category: filters?.category || '',
        q: filters?.q || ''
    })

    const columns = useMemo(() => [
        {
            accessorKey: 'assetTag',
            header: 'Tag',
            cell: info => <CopyableText value={info.getValue()} className="font-semibold" />
        },
        {
            accessorKey: 'category',
            header: 'Catégorie',
            cell: info => <AssetTypeBadge category={info.getValue()} />
        },
        {
            accessorFn: row => `${row.brand} ${row.model}`,
            id: 'equipment',
            header: 'Équipement',
            cell: info => (
                <div>
                    <div className="font-medium text-[var(--color-text)]">{info.row.original.brand}</div>
                    <div className="text-xs text-[var(--color-muted)]">{info.row.original.model}</div>
                </div>
            )
        },
        {
            accessorKey: 'serialNumber',
            header: 'N° Série',
            cell: info => <CopyableText value={info.getValue()} />
        },
        {
            accessorKey: 'assignedTo',
            header: 'Assigné à',
            cell: info => {
                const user = info.getValue()
                return user ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center text-[10px] font-bold shrink-0">
                            {user.fullName?.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm">{user.fullName}</div>
                            <div className="text-xs text-[var(--color-muted)]">{user.department?.name}</div>
                        </div>
                    </div>
                ) : <span className="text-[var(--color-muted)] italic text-sm">Non assigné</span>
            }
        },
        {
            accessorKey: 'status',
            header: 'Statut',
            cell: info => <StatusBadge status={info.getValue()} />
        }
    ], [])

    const hasFilters = filters?.q || filters?.status || filters?.category

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Inventaire"
                count={data?.total}
                description="Gérez l'ensemble des équipements informatiques."
            >
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg text-sm font-medium transition-colors btn-press">
                    <Upload className="w-4 h-4" />
                    Import CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg text-sm font-medium transition-colors btn-press">
                    <Download className="w-4 h-4" />
                    Exporter
                </button>
                <button
                    onClick={() => navigate('/assets/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" />
                    Nouvel Actif
                </button>
            </PageHeader>

            {/* Filters Bar */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full relative">
                    <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Rechercher</label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                            type="text"
                            placeholder="Tag, numéro de série, modèle..."
                            value={filters?.q || ''}
                            onChange={(e) => setAssetFilters({ q: e.target.value })}
                            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="w-full md:w-48">
                    <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Catégorie</label>
                    <select
                        value={filters?.category || ''}
                        onChange={(e) => setAssetFilters({ category: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm transition-all outline-none"
                    >
                        <option value="">Toutes</option>
                        {ASSET_CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-48">
                    <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Statut</label>
                    <select
                        value={filters?.status || ''}
                        onChange={(e) => setAssetFilters({ status: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm transition-all outline-none"
                    >
                        <option value="">Tous</option>
                        {ASSET_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden shrink-0">
                    {VIEW_MODES.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={cn(
                                'p-2 transition-colors',
                                viewMode === mode.id
                                    ? 'bg-sonatrach-green/10 text-sonatrach-green'
                                    : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
                            )}
                            title={mode.label}
                        >
                            <mode.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <button
                    onClick={clearAssetFilters}
                    className={cn(
                        'h-9 px-3 border border-[var(--color-border)] rounded-lg text-sm transition-colors',
                        hasFilters
                            ? 'text-sonatrach-green border-sonatrach-green/30 hover:bg-sonatrach-green/5'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    )}
                    title="Réinitialiser les filtres"
                >
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <DataTable
                    columns={columns}
                    data={data?.data}
                    totalRows={data?.total}
                    isLoading={isLoading}
                    pageSize={pageSize}
                    pagination={{ pageIndex: page - 1, pageSize }}
                    onPaginationChange={(updater) => {
                        const newState = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater
                        setPage(newState.pageIndex + 1)
                    }}
                    onRowClick={(row) => navigate(`/assets/${row.id}`)}
                    emptyMessage="Aucun actif trouvé correspondant à ces critères."
                />
            ) : (
                /* Grid / Card view */
                <div className={cn(
                    'grid gap-4',
                    viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                )}>
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-36 skeleton-shimmer rounded-xl" />
                        ))
                    ) : data?.data?.length > 0 ? (
                        data.data.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => navigate(`/assets/${asset.id}`)}
                                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm cursor-pointer card-hover"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold">{asset.brand} {asset.model}</div>
                                        <div className="text-xs text-[var(--color-muted)] font-mono">{asset.assetTag}</div>
                                    </div>
                                    <StatusBadge status={asset.status} />
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                                    <AssetTypeBadge category={asset.category} />
                                    {asset.assignedTo && (
                                        <span>→ {asset.assignedTo.fullName}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            title="Aucun actif trouvé"
                            description="Aucun équipement ne correspond à vos critères de recherche."
                            actionLabel="Réinitialiser les filtres"
                            onAction={clearAssetFilters}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
