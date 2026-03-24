import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, FileText, Plus, Eye, Package, Calendar, DollarSign, Building2, Printer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'

const STATUS_MAP = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50' },
    APPROVED: { label: 'Approuvé', color: 'text-sonatrach-green bg-green-50' },
    DELIVERED: { label: 'Livré', color: 'text-blue-600 bg-blue-50' },
    CANCELLED: { label: 'Annulé', color: 'text-red-600 bg-red-50' },
}

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [expanded, setExpanded] = useState(null)
    const [printingId, setPrintingId] = useState(null)

    const handlePrint = (id, e) => {
        e.stopPropagation();
        setExpanded(id);
        setPrintingId(id);
        setTimeout(() => {
            window.print();
            setPrintingId(null);
        }, 150);
    };

    useEffect(() => {
        fetch('/api/purchase-orders')
            .then(r => r.json())
            .then(res => { setOrders(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        let list = [...orders]
        if (statusFilter) list = list.filter(o => o.status === statusFilter)
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(o =>
                o.orderNumber.toLowerCase().includes(q) ||
                o.supplier?.name?.toLowerCase().includes(q) ||
                o.items?.some(i => i.designation.toLowerCase().includes(q))
            )
        }
        return list
    }, [orders, statusFilter, search])

    const columns = useMemo(() => [
        {
            accessorKey: 'orderNumber',
            header: 'N° Commande',
            cell: info => (
                <span className="font-semibold text-[var(--color-text)]">{info.getValue()}</span>
            )
        },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR')
        },
        {
            accessorFn: row => row.supplier?.name,
            id: 'supplier',
            header: 'Fournisseur',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--color-muted)]" />
                    <span>{info.getValue()}</span>
                </div>
            )
        },
        {
            accessorFn: row => row.items?.length || 0,
            id: 'itemCount',
            header: 'Articles',
            cell: info => (
                <span className="inline-flex items-center gap-1 text-sm">
                    <Package className="w-3.5 h-3.5" />
                    {info.getValue()}
                </span>
            )
        },
        {
            accessorKey: 'totalGeneral',
            header: 'Montant Total',
            cell: info => {
                const val = info.getValue()
                return val ? (
                    <span className="font-medium">
                        {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(val)}
                    </span>
                ) : <span className="text-[var(--color-muted)]">—</span>
            }
        },
        {
            accessorKey: 'status',
            header: 'Statut',
            cell: info => {
                const s = STATUS_MAP[info.getValue()] || { label: info.getValue(), color: 'text-gray-500 bg-gray-100' }
                return (
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.color)}>
                        {s.label}
                    </span>
                )
            }
        },
    ], [])

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Bons de Commande"
                count={filtered.length}
                description="Suivi des commandes fournisseurs — Holding Sonatrach Raffinage et Chimie"
            >
                <button className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press">
                    <Plus className="w-4 h-4" />
                    Nouveau BC
                </button>
            </PageHeader>

            {/* Filters */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full relative">
                    <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Rechercher</label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                            type="text"
                            placeholder="N° commande, fournisseur, article..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm transition-all outline-none"
                        />
                    </div>
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Statut</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 bg-transparent text-sm outline-none"
                    >
                        <option value="">Tous</option>
                        {Object.entries(STATUS_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table + Expandable Detail */}
            {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 skeleton-shimmer rounded-lg" />)}</div>
            ) : filtered.length === 0 ? (
                <EmptyState title="Aucun bon de commande" description="Aucune commande ne correspond à vos critères." />
            ) : (
                <div className="space-y-3">
                    {filtered.map(order => (
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
                                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_MAP[order.status]?.color || 'bg-gray-100')}>
                                        {STATUS_MAP[order.status]?.label || order.status}
                                    </span>

                                    {expanded === order.id && (
                                        <button
                                            onClick={(e) => handlePrint(order.id, e)}
                                            className="p-1.5 text-sonatrach-green hover:bg-sonatrach-green/10 rounded-lg transition-colors print-hidden"
                                            title="Imprimer"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    )}
                                    <Eye className={cn('w-4 h-4 transition-transform print-hidden', expanded === order.id ? 'rotate-180 text-sonatrach-green' : 'text-[var(--color-muted)]')} />
                                </div>
                            </div>

                            {expanded === order.id && (
                                <div className={cn("border-t border-[var(--color-border)] p-4 bg-[var(--color-bg)]", printingId === order.id ? "print-area" : "")}>

                                    {/* Print Header (Visible only when printing) */}
                                    {printingId === order.id && (
                                        <div className="mb-8 text-center border-b border-[var(--color-border)] pb-6">
                                            <h2 className="text-2xl font-bold">SONATRACH</h2>
                                            <p className="text-sm text-[var(--color-muted)]">Activité Aval — Holding Raffinage et Chimie</p>
                                            <h3 className="text-xl font-semibold mt-4">BON DE COMMANDE N° {order.orderNumber}</h3>
                                            <p className="text-sm mt-1">Date: {new Date(order.date).toLocaleDateString('fr-DZ')}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="text-[var(--color-muted)] text-xs uppercase">Adresse livraison</span>
                                            <p className="font-medium mt-0.5">{order.deliveryAddress || '—'}</p>
                                        </div>
                                        <div>
                                            <span className="text-[var(--color-muted)] text-xs uppercase">Demandé par</span>
                                            <p className="font-medium mt-0.5">{order.requestedBy || '—'}</p>
                                        </div>
                                        <div>
                                            <span className="text-[var(--color-muted)] text-xs uppercase">Approuvé par</span>
                                            <p className="font-medium mt-0.5">{order.approvedBy || '—'}</p>
                                        </div>
                                        <div>
                                            <span className="text-[var(--color-muted)] text-xs uppercase">TVA</span>
                                            <p className="font-medium mt-0.5">{order.tvaRate ? `${order.tvaRate}%` : '—'}</p>
                                        </div>
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
            )}
        </div>
    )
}
