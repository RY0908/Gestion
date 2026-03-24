import { useState, useMemo, useEffect } from 'react'
import { Search, Receipt, ChevronDown, ChevronUp, Package, CheckCircle, Clock, AlertTriangle, Truck, Printer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'

const STATUS_MAP = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
    VALIDATED: { label: 'Validé', color: 'text-sonatrach-green bg-green-50', icon: CheckCircle },
    PARTIAL: { label: 'Partiel', color: 'text-orange-600 bg-orange-50', icon: AlertTriangle },
    REJECTED: { label: 'Rejeté', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
}

export default function BonReceptionsPage() {
    const [receptions, setReceptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
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
        fetch('/api/bon-receptions')
            .then(r => r.json())
            .then(res => { setReceptions(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        if (!search) return receptions
        const q = search.toLowerCase()
        return receptions.filter(br =>
            br.receptionNumber?.toLowerCase().includes(q) ||
            br.supplier?.name?.toLowerCase().includes(q) ||
            br.commandeNumber?.toLowerCase().includes(q)
        )
    }, [receptions, search])

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Bons de Réception"
                count={filtered.length}
                description="Formulaire M-103 — Réception des matériels et fournitures"
            />

            {/* Search */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        type="text"
                        placeholder="N° réception, fournisseur, N° commande..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton-shimmer rounded-xl" />)}</div>
            ) : filtered.length === 0 ? (
                <EmptyState title="Aucun bon de réception" description="Aucun bon de réception trouvé." />
            ) : (
                <div className="space-y-4">
                    {filtered.map(br => {
                        const StatusIcon = STATUS_MAP[br.status]?.icon || Clock
                        const isOpen = expanded === br.id

                        return (
                            <div key={br.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden card-hover">
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between p-5 cursor-pointer"
                                    onClick={() => setExpanded(isOpen ? null : br.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <Receipt className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[var(--color-text)]">{br.receptionNumber}</div>
                                            <div className="text-sm text-[var(--color-muted)] flex items-center gap-2">
                                                <Truck className="w-3.5 h-3.5" />
                                                {br.supplier?.name}
                                                <span className="text-xs">• Cmd: {br.commandeNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', STATUS_MAP[br.status]?.color)}>
                                            <StatusIcon className="w-3 h-3" />
                                            {STATUS_MAP[br.status]?.label || br.status}
                                        </span>
                                        <span className="text-sm text-[var(--color-muted)]">
                                            {new Date(br.livraisonDate).toLocaleDateString('fr-FR')}
                                        </span>
                                        {isOpen && (
                                            <button
                                                onClick={(e) => handlePrint(br.id, e)}
                                                className="p-1.5 text-sonatrach-green hover:bg-sonatrach-green/10 rounded-lg transition-colors print-hidden ml-2"
                                                title="Imprimer"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isOpen ? <ChevronUp className="w-4 h-4 print-hidden" /> : <ChevronDown className="w-4 h-4 print-hidden" />}
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isOpen && (
                                    <div className={cn("border-t border-[var(--color-border)]", printingId === br.id ? "print-area" : "animate-slide-up")}>

                                        {/* Print Header */}
                                        {printingId === br.id && (
                                            <div className="p-8 text-center border-b border-[var(--color-border)] mb-4">
                                                <h2 className="text-2xl font-bold">SONATRACH</h2>
                                                <p className="text-sm text-[var(--color-muted)]">Activité Aval — Holding Raffinage et Chimie</p>
                                                <h3 className="text-xl font-semibold mt-4">BON DE RÉCEPTION M-103 N° {br.receptionNumber}</h3>
                                                <p className="text-sm mt-1">Fournisseur: {br.supplier?.name} | Commande N° {br.commandeNumber}</p>
                                            </div>
                                        )}
                                        {/* Items Table */}
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
                                                            <th className="text-right py-2 text-xs uppercase text-[var(--color-muted)]">Solde</th>
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
                                                                <td className="py-2.5 text-right">
                                                                    {item.soldeALivrer > 0 ? (
                                                                        <span className="text-orange-600 font-medium">{item.soldeALivrer}</span>
                                                                    ) : <span className="text-sonatrach-green">0</span>}
                                                                </td>
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

                                        {/* Metadata */}
                                        <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="bg-[var(--color-bg)] p-3 rounded-lg">
                                                <span className="text-xs text-[var(--color-muted)] uppercase">Facture N°</span>
                                                <p className="font-medium mt-0.5">{br.factureN || '—'}</p>
                                            </div>
                                            <div className="bg-[var(--color-bg)] p-3 rounded-lg">
                                                <span className="text-xs text-[var(--color-muted)] uppercase">Fret/Assurance</span>
                                                <p className="font-medium mt-0.5">{br.fretAssurance ? `${new Intl.NumberFormat('fr-DZ').format(br.fretAssurance)} DA` : '—'}</p>
                                            </div>
                                            <div className="bg-[var(--color-bg)] p-3 rounded-lg">
                                                <span className="text-xs text-[var(--color-muted)] uppercase">Transport</span>
                                                <p className="font-medium mt-0.5">{br.transport ? `${new Intl.NumberFormat('fr-DZ').format(br.transport)} DA` : '—'}</p>
                                            </div>
                                            <div className="bg-[var(--color-bg)] p-3 rounded-lg">
                                                <span className="text-xs text-[var(--color-muted)] uppercase">Observations</span>
                                                <p className="font-medium mt-0.5 text-xs">{br.observations || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Signatures */}
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
            )}
        </div>
    )
}
