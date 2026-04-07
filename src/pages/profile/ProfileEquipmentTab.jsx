import { useAssignments } from '@/hooks/useAssignments.js'
import { cn } from '@/lib/utils.js'
import { Package, Laptop, Monitor, Printer, Server, Network, Smartphone, Calendar, MapPin } from 'lucide-react'

const CATEGORY_ICONS = {
    LAPTOP: Laptop,
    DESKTOP: Monitor,
    PRINTER: Printer,
    SERVER: Server,
    NETWORK_DEVICE: Network,
    SMARTPHONE: Smartphone,
}

const CATEGORY_LABELS = {
    LAPTOP: 'Ordinateur Portable',
    DESKTOP: 'Ordinateur de Bureau',
    PRINTER: 'Imprimante',
    SERVER: 'Serveur',
    NETWORK_DEVICE: 'Équipement Réseau',
    MONITOR: 'Écran',
    PHOTOCOPIEUR: 'Photocopieur',
    SMARTPHONE: 'Smartphone',
    TABLET: 'Tablette',
    OTHER: 'Autre',
}

function SkeletonCard() {
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-bg)]" />
                <div className="flex-1">
                    <div className="h-4 w-32 bg-[var(--color-bg)] rounded mb-2" />
                    <div className="h-3 w-20 bg-[var(--color-bg)] rounded" />
                </div>
            </div>
            <div className="h-3 w-full bg-[var(--color-bg)] rounded" />
        </div>
    )
}

export default function ProfileEquipmentTab({ userId }) {
    const { data, isLoading } = useAssignments({ userId, status: 'ACTIVE', pageSize: 50 })
    const assignments = data?.data || []

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
        )
    }

    if (assignments.length === 0) {
        return (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-[var(--color-muted)]" />
                </div>
                <h3 className="font-semibold mb-1">Aucun équipement affecté</h3>
                <p className="text-sm text-[var(--color-muted)]">Vous n'avez pas d'équipement informatique actuellement assigné.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-[var(--color-muted)]">
                {assignments.length} équipement{assignments.length > 1 ? 's' : ''} affecté{assignments.length > 1 ? 's' : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
                {assignments.map(asg => {
                    const asset = asg.asset
                    const cat = asset?.categorie || asset?.category
                    const Icon = CATEGORY_ICONS[cat] || Package
                    return (
                        <div key={asg.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm hover:border-sonatrach-green/40 transition-colors">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-sonatrach-green/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-sonatrach-green" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{asset?.marque} {asset?.modele || '—'}</div>
                                    <div className="text-xs text-[var(--color-muted)]">{CATEGORY_LABELS[cat] || cat || '—'}</div>
                                </div>
                                <span className="text-[10px] font-medium bg-green-50 dark:bg-green-900/20 text-sonatrach-green px-2 py-0.5 rounded-full shrink-0">Actif</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                    <span className="font-mono bg-[var(--color-bg)] px-2 py-0.5 rounded text-[11px]">
                                        {asset?.codeInventaire || asset?.code_inventaire || asset?.inventoryCode || '—'}
                                    </span>
                                </div>
                                {asg.assignedAt && (
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                                        <Calendar className="w-3 h-3" />
                                        Affecté le {new Date(asg.assignedAt).toLocaleDateString('fr-FR')}
                                    </div>
                                )}
                                {(asset?.localisation || asset?.location) && (
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                                        <MapPin className="w-3 h-3" />
                                        {asset.localisation || asset.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
