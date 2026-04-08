import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, Plus, Eye, ChevronDown, ChevronUp, FileText, Receipt, ArrowLeftRight,
    Package, Building2, DollarSign, Printer, Clock, CheckCircle, AlertTriangle,
    Truck, User, FileSignature, Wrench, ClipboardList, Shield,
    BarChart2
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'
import { useDocumentsCatalog } from '@/hooks/useDocuments.js'

// ─── Status maps ────────────────────────────────────────────────────
const BC_STATUS = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50' },
    APPROVED: { label: 'Approuvé', color: 'text-sonatrach-green bg-green-50' },
    DELIVERED: { label: 'Livré', color: 'text-blue-600 bg-blue-50' },
    CANCELLED: { label: 'Annulé', color: 'text-red-600 bg-red-50' },
}
const BR_STATUS = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
    VALIDATED: { label: 'Validé', color: 'text-sonatrach-green bg-green-50', icon: CheckCircle },
    PARTIAL: { label: 'Partiel', color: 'text-orange-600 bg-orange-50', icon: AlertTriangle },
    REJECTED: { label: 'Rejeté', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
}
const DCH_STATUS = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
    SIGNED: { label: 'Signée', color: 'text-sonatrach-green bg-green-50', icon: CheckCircle },
}

// ─── Document type catalog for quick‑create ─────────────────────────
const DOC_TYPES = [
    { key: 'bon-sortie', label: 'Bon de Sortie', icon: Package, color: 'text-emerald-600 bg-emerald-50', priority: true },
    { key: 'demande-intervention', label: "Demande d'Intervention", icon: Wrench, color: 'text-orange-600 bg-orange-50', priority: true },
    { key: 'fiche-intervention', label: "Fiche d'Intervention", icon: ClipboardList, color: 'text-blue-600 bg-blue-50', priority: true },
    { key: 'bon-commande', label: 'Bon de Commande', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { key: 'bon-reception', label: 'Bon de Réception', icon: Receipt, color: 'text-teal-600 bg-teal-50' },
    { key: 'decharge', label: 'Décharge Matériel', icon: ArrowLeftRight, color: 'text-purple-600 bg-purple-50' },
    { key: 'demande-materiel', label: 'Demande de Matériel', icon: Package, color: 'text-cyan-600 bg-cyan-50' },
    { key: 'fiche-besoin', label: 'Fiche Besoin', icon: FileText, color: 'text-rose-600 bg-rose-50' },
    { key: 'rapport-intervention', label: "Rapport d'Intervention", icon: BarChart2, color: 'text-amber-600 bg-amber-50' },
    { key: 'demande-garantie', label: 'Demande Garantie', icon: Shield, color: 'text-red-600 bg-red-50' },
    { key: 'inventaire', label: "Fiche d'Inventaire", icon: ClipboardList, color: 'text-lime-600 bg-lime-50' },
]

// ─── Tabs ───────────────────────────────────────────────────────────
const TABS = [
    { key: 'nouveau', label: 'Nouveau Document', icon: Plus },
    { key: 'commandes', label: 'Bons de Commande', icon: FileText },
    { key: 'receptions', label: 'Bons de Réception', icon: Receipt },
    { key: 'decharges', label: 'Décharges', icon: ArrowLeftRight },
]

export default function DocsHubPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('nouveau')
    const [search, setSearch] = useState('')

    // ── Data states ──────────────────────────────────────────────────
    const { data, isLoading } = useDocumentsCatalog()
    const [expanded, setExpanded] = useState(null)
    const orders = useMemo(() => data?.orders || [], [data])
    const receptions = useMemo(() => data?.receptions || [], [data])
    const decharges = useMemo(() => data?.decharges || [], [data])


    // ── Filtered data ────────────────────────────────────────────────
    const q = search.toLowerCase()
    const filteredOrders = useMemo(() => {
        if (!q) return orders
        return orders.filter(o =>
            o.orderNumber?.toLowerCase().includes(q) ||
            o.supplier?.name?.toLowerCase().includes(q)
        )
    }, [orders, q])

    const filteredReceptions = useMemo(() => {
        if (!q) return receptions
        return receptions.filter(br =>
            br.receptionNumber?.toLowerCase().includes(q) ||
            br.supplier?.name?.toLowerCase().includes(q) ||
            br.commandeNumber?.toLowerCase().includes(q)
        )
    }, [receptions, q])

    const filteredDecharges = useMemo(() => {
        if (!q) return decharges
        return decharges.filter(d =>
            d.partieCedante?.nom?.toLowerCase().includes(q) ||
            d.partieRecevante?.nom?.toLowerCase().includes(q) ||
            d.items?.some(i => i.designation?.toLowerCase().includes(q))
        )
    }, [decharges, q])

    const handlePrint = (id, e) => {
        e.stopPropagation()
        setExpanded(id)
        setTimeout(() => window.print(), 150)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Documents"
                description="Gestion des documents officiels — Sonatrach DC‑ISI"
            >
                <button
                    onClick={() => setActiveTab('nouveau')}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau document
                </button>
            </PageHeader>

            {/* ── Tab bar ─────────────────────────────────────────── */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 flex gap-1 shadow-sm overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setExpanded(null) }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                            activeTab === tab.key
                                ? 'bg-sonatrach-green text-white shadow-sm'
                                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Search (for data tabs) ──────────────────────────── */}
            {activeTab !== 'nouveau' && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                            type="text"
                            placeholder="Rechercher par N°, fournisseur, nom..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm outline-none"
                        />
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────── */}
            {/* TAB: Nouveau Document                                  */}
            {/* ─────────────────────────────────────────────────────── */}
            {activeTab === 'nouveau' && (
                <div className="space-y-6">
                    {/* Priority section */}
                    <div>
                        <h3 className="text-xs uppercase font-semibold text-[var(--color-muted)] tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sonatrach-green" />
                            Usage quotidien
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {DOC_TYPES.filter(d => d.priority).map(doc => (
                                <button
                                    key={doc.key}
                                    onClick={() => navigate(`/documents/${doc.key}/nouveau`)}
                                    className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm hover:border-sonatrach-green/40 hover:shadow-md transition-all text-left group card-hover"
                                >
                                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', doc.color)}>
                                        <doc.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-sm text-[var(--color-text)] truncate">{doc.label}</div>
                                        <div className="text-xs text-[var(--color-muted)] mt-0.5">Créer un nouveau document</div>
                                    </div>
                                    <Plus className="w-4 h-4 text-[var(--color-muted)] group-hover:text-sonatrach-green transition-colors shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other documents */}
                    <div>
                        <h3 className="text-xs uppercase font-semibold text-[var(--color-muted)] tracking-wider mb-3">
                            Tous les documents
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {DOC_TYPES.filter(d => !d.priority).map(doc => (
                                <button
                                    key={doc.key}
                                    onClick={() => navigate(`/documents/${doc.key}/nouveau`)}
                                    className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm hover:border-sonatrach-green/40 transition-all text-left group card-hover"
                                >
                                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', doc.color)}>
                                        <doc.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm text-[var(--color-text)] truncate">{doc.label}</div>
                                    </div>
                                    <Plus className="w-3.5 h-3.5 text-[var(--color-muted)] group-hover:text-sonatrach-green transition-colors shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────── */}
            {/* TAB: Bons de Commande                                  */}
            {/* ─────────────────────────────────────────────────────── */}
            {activeTab === 'commandes' && (
                isLoading ? (
                    <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 skeleton-shimmer rounded-lg" />)}</div>
                ) : filteredOrders.length === 0 ? (
                    <EmptyState title="Aucun bon de commande" description="Aucune commande ne correspond à vos critères." />
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden card-hover">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer"
                                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[var(--color-text)]">{order.orderNumber}</div>
                                            <div className="text-sm text-[var(--color-muted)]">
                                                {order.supplier?.name} — {new Date(order.date).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {order.totalGeneral > 0 && (
                                            <span className="text-sm font-medium flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                {new Intl.NumberFormat('fr-DZ').format(order.totalGeneral)} DA
                                            </span>
                                        )}
                                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', BC_STATUS[order.status]?.color || 'bg-gray-100')}>
                                            {BC_STATUS[order.status]?.label || order.status}
                                        </span>
                                        <Eye className={cn('w-4 h-4 transition-transform', expanded === order.id ? 'rotate-180 text-sonatrach-green' : 'text-[var(--color-muted)]')} />
                                    </div>
                                </div>
                                {expanded === order.id && (
                                    <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-bg)] animate-slide-up">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                            <div><span className="text-[var(--color-muted)] text-xs uppercase">Adresse livraison</span><p className="font-medium mt-0.5">{order.deliveryAddress || '—'}</p></div>
                                            <div><span className="text-[var(--color-muted)] text-xs uppercase">Demandé par</span><p className="font-medium mt-0.5">{order.requestedBy || '—'}</p></div>
                                            <div><span className="text-[var(--color-muted)] text-xs uppercase">Approuvé par</span><p className="font-medium mt-0.5">{order.approvedBy || '—'}</p></div>
                                            <div><span className="text-[var(--color-muted)] text-xs uppercase">TVA</span><p className="font-medium mt-0.5">{order.tvaRate ? `${order.tvaRate}%` : '—'}</p></div>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-[var(--color-border)]">
                                                    <th className="text-left py-2 text-xs uppercase text-[var(--color-muted)] font-medium">Code</th>
                                                    <th className="text-left py-2 text-xs uppercase text-[var(--color-muted)] font-medium">Désignation</th>
                                                    <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)] font-medium">Qté</th>
                                                    <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)] font-medium">PU</th>
                                                    <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)] font-medium">Montant TTC</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items?.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-[var(--color-border)] last:border-0">
                                                        <td className="py-2 font-mono text-xs">{item.code || '—'}</td>
                                                        <td className="py-2">{item.designation}</td>
                                                        <td className="py-2 text-right">{item.quantity}</td>
                                                        <td className="py-2 text-right">{item.unitPrice ? `${new Intl.NumberFormat('fr-DZ').format(item.unitPrice)} DA` : '—'}</td>
                                                        <td className="py-2 text-right font-medium">{item.total ? `${new Intl.NumberFormat('fr-DZ').format(item.total)} DA` : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ─────────────────────────────────────────────────────── */}
            {/* TAB: Bons de Réception                                 */}
            {/* ─────────────────────────────────────────────────────── */}
            {activeTab === 'receptions' && (
                isLoading ? (
                    <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton-shimmer rounded-xl" />)}</div>
                ) : filteredReceptions.length === 0 ? (
                    <EmptyState title="Aucun bon de réception" description="Aucun bon de réception trouvé." />
                ) : (
                    <div className="space-y-4">
                        {filteredReceptions.map(br => {
                            const StatusIcon = BR_STATUS[br.status]?.icon || Clock
                            const isOpen = expanded === br.id
                            return (
                                <div key={br.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden card-hover">
                                    <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(isOpen ? null : br.id)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                <Receipt className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[var(--color-text)]">{br.receptionNumber}</div>
                                                <div className="text-sm text-[var(--color-muted)] flex items-center gap-2">
                                                    <Truck className="w-3.5 h-3.5" /> {br.supplier?.name}
                                                    <span className="text-xs">• Cmd: {br.commandeNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', BR_STATUS[br.status]?.color)}>
                                                <StatusIcon className="w-3 h-3" /> {BR_STATUS[br.status]?.label || br.status}
                                            </span>
                                            <span className="text-sm text-[var(--color-muted)]">{new Date(br.livraisonDate).toLocaleDateString('fr-FR')}</span>
                                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="border-t border-[var(--color-border)] animate-slide-up">
                                            <div className="p-5">
                                                <h4 className="text-xs uppercase font-semibold text-[var(--color-muted)] tracking-wider mb-3">Articles reçus</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-[var(--color-border)]">
                                                                <th className="text-left py-2 text-xs uppercase text-[var(--color-muted)]">Code</th>
                                                                <th className="text-left py-2 text-xs uppercase text-[var(--color-muted)]">Désignation</th>
                                                                <th className="text-center py-2 text-xs uppercase text-[var(--color-muted)]">UdM</th>
                                                                <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)]">Qté Cmd</th>
                                                                <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)]">Qté Reçue</th>
                                                                <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)]">PU</th>
                                                                <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)]">Valeur</th>
                                                                <th className="text-left py-2 text-xs uppercase text-[var(--color-muted)]">N° Série</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {br.items?.map((item, idx) => (
                                                                <tr key={idx} className="border-b border-[var(--color-border)] last:border-0">
                                                                    <td className="py-2.5 font-mono text-xs">{item.code}</td>
                                                                    <td className="py-2.5 font-medium">{item.designation}</td>
                                                                    <td className="py-2.5 text-center">{item.udm}</td>
                                                                    <td className="py-2.5 text-right">{item.qtyCommandee}</td>
                                                                    <td className="py-2.5 text-right font-semibold">{item.qtyReceptionnee}</td>
                                                                    <td className="py-2.5 text-right">{new Intl.NumberFormat('fr-DZ').format(item.prixUnitaire)} DA</td>
                                                                    <td className="py-2.5 text-right font-medium">{new Intl.NumberFormat('fr-DZ').format(item.valeur)} DA</td>
                                                                    <td className="py-2.5 font-mono text-xs">{item.serialNumber}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            {br.signatures && (
                                                <div className="px-5 pb-5">
                                                    <h4 className="text-xs uppercase font-semibold text-[var(--color-muted)] tracking-wider mb-2">Signatures</h4>
                                                    <div className="flex flex-wrap gap-3">
                                                        {Object.entries(br.signatures).map(([key, value]) => (
                                                            <div key={key} className="bg-[var(--color-bg)] px-3 py-2 rounded-lg text-xs">
                                                                <span className="text-[var(--color-muted)] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                                <p className="font-medium">{value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {/* ─────────────────────────────────────────────────────── */}
            {/* TAB: Décharges                                         */}
            {/* ─────────────────────────────────────────────────────── */}
            {activeTab === 'decharges' && (
                isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 skeleton-shimmer rounded-xl" />)}</div>
                ) : filteredDecharges.length === 0 ? (
                    <EmptyState title="Aucune décharge" description="Aucune décharge trouvée." />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredDecharges.map(dch => {
                            const StatusIcon = DCH_STATUS[dch.status]?.icon || Clock
                            return (
                                <div
                                    key={dch.id}
                                    className={cn(
                                        "bg-[var(--color-surface)] border rounded-xl shadow-sm overflow-hidden card-hover cursor-pointer transition-all",
                                        expanded === dch.id ? 'border-sonatrach-green ring-1 ring-sonatrach-green/20' : 'border-[var(--color-border)]'
                                    )}
                                    onClick={() => setExpanded(expanded === dch.id ? null : dch.id)}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                                    <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-[var(--color-muted)]">
                                                        {new Date(dch.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </div>
                                                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1', DCH_STATUS[dch.status]?.color)}>
                                                        <StatusIcon className="w-3 h-3" /> {DCH_STATUS[dch.status]?.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-[var(--color-muted)]">{dch.id}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex-1 bg-[var(--color-bg)] rounded-lg p-3 text-sm">
                                                <div className="text-xs text-[var(--color-muted)] uppercase mb-1 flex items-center gap-1">
                                                    <User className="w-3 h-3" /> Cédant
                                                </div>
                                                <div className="font-medium">{dch.partieCedante?.prenom} {dch.partieCedante?.nom}</div>
                                            </div>
                                            <ArrowLeftRight className="w-5 h-5 text-sonatrach-green shrink-0" />
                                            <div className="flex-1 bg-[var(--color-bg)] rounded-lg p-3 text-sm">
                                                <div className="text-xs text-[var(--color-muted)] uppercase mb-1 flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" /> Recevant
                                                </div>
                                                <div className="font-medium">{dch.partieRecevante?.prenom} {dch.partieRecevante?.nom}</div>
                                                {dch.partieRecevante?.structure && (
                                                    <div className="text-xs text-sonatrach-green font-medium mt-0.5">{dch.partieRecevante.structure}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {expanded === dch.id && (
                                        <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-bg)] animate-slide-up">
                                            <h4 className="text-xs uppercase font-semibold text-[var(--color-muted)] tracking-wider mb-3">Matériel transféré</h4>
                                            <div className="space-y-2">
                                                {dch.items?.map((item, idx) => (
                                                    <div key={idx} className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)]">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="font-semibold text-sm">{item.designation}</div>
                                                                <div className="text-xs text-[var(--color-muted)] mt-0.5">
                                                                    {item.marque} {item.modele && `• ${item.modele}`}
                                                                </div>
                                                            </div>
                                                            <span className="font-mono text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-2 py-1 rounded">{item.serialNumber}</span>
                                                        </div>
                                                        {item.observation && (
                                                            <p className="text-xs text-[var(--color-muted)] mt-2 italic">📝 {item.observation}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {dch.dateSignature && (
                                                <div className="mt-3 flex items-center gap-2 text-xs text-sonatrach-green">
                                                    <FileSignature className="w-3.5 h-3.5" />
                                                    Signé le {new Date(dch.dateSignature).toLocaleDateString('fr-FR')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
            )}
        </div>
    )
}
