import { useState, useMemo, useEffect } from 'react'
import { Search, ArrowLeftRight, User, Building2, PenLine, CheckCircle, Clock, FileSignature, Printer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'

const STATUS_MAP = {
    PENDING: { label: 'En attente de signature', color: 'text-amber-600 bg-amber-50', icon: Clock },
    SIGNED: { label: 'Signée', color: 'text-sonatrach-green bg-green-50', icon: CheckCircle },
}

export default function DechargesPage() {
    const [decharges, setDecharges] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [printingId, setPrintingId] = useState(null)

    const handlePrint = (id, e) => {
        e.stopPropagation();
        setSelected(id);
        setPrintingId(id);
        setTimeout(() => {
            window.print();
            setPrintingId(null);
        }, 150);
    };

    useEffect(() => {
        fetch('/api/decharges')
            .then(r => r.json())
            .then(res => { setDecharges(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        if (!search) return decharges
        const q = search.toLowerCase()
        return decharges.filter(d =>
            d.items?.some(i =>
                i.designation.toLowerCase().includes(q) ||
                i.marque?.toLowerCase().includes(q) ||
                i.serialNumber?.toLowerCase().includes(q)
            ) ||
            d.partieCedante?.nom?.toLowerCase().includes(q) ||
            d.partieRecevante?.nom?.toLowerCase().includes(q) ||
            d.partieRecevante?.structure?.toLowerCase().includes(q)
        )
    }, [decharges, search])

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Décharges"
                count={filtered.length}
                description="Transfert de matériel — Sonatrach Activité AVAL"
            >
                <button className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press">
                    <PenLine className="w-4 h-4" />
                    Nouvelle Décharge
                </button>
            </PageHeader>

            {/* Search */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        type="text"
                        placeholder="Matériel, marque, N° série, nom, structure..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20 bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 skeleton-shimmer rounded-xl" />)}</div>
            ) : filtered.length === 0 ? (
                <EmptyState title="Aucune décharge" description="Aucune décharge trouvée." />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filtered.map(dch => {
                        const StatusIcon = STATUS_MAP[dch.status]?.icon || Clock

                        return (
                            <div
                                key={dch.id}
                                className={cn(
                                    "bg-[var(--color-surface)] border rounded-xl shadow-sm overflow-hidden card-hover cursor-pointer transition-all",
                                    selected === dch.id ? 'border-sonatrach-green ring-1 ring-sonatrach-green/20' : 'border-[var(--color-border)]'
                                )}
                                onClick={() => setSelected(selected === dch.id ? null : dch.id)}
                            >
                                {/* Header */}
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
                                                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1', STATUS_MAP[dch.status]?.color)}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {STATUS_MAP[dch.status]?.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-mono text-[var(--color-muted)]">{dch.id}</span>
                                            {selected === dch.id && (
                                                <button
                                                    onClick={(e) => handlePrint(dch.id, e)}
                                                    className="mt-2 p-1.5 text-sonatrach-green hover:bg-sonatrach-green/10 rounded-lg transition-colors print-hidden"
                                                    title="Imprimer"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Transfer Arrow */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex-1 bg-[var(--color-bg)] rounded-lg p-3 text-sm">
                                            <div className="text-xs text-[var(--color-muted)] uppercase mb-1 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Partie Cédante
                                            </div>
                                            <div className="font-medium">{dch.partieCedante?.prenom} {dch.partieCedante?.nom}</div>
                                        </div>
                                        <ArrowLeftRight className="w-5 h-5 text-sonatrach-green shrink-0" />
                                        <div className="flex-1 bg-[var(--color-bg)] rounded-lg p-3 text-sm">
                                            <div className="text-xs text-[var(--color-muted)] uppercase mb-1 flex items-center gap-1">
                                                <Building2 className="w-3 h-3" /> Partie Recevante
                                            </div>
                                            <div className="font-medium">{dch.partieRecevante?.prenom} {dch.partieRecevante?.nom}</div>
                                            {dch.partieRecevante?.structure && (
                                                <div className="text-xs text-sonatrach-green font-medium mt-0.5">{dch.partieRecevante.structure}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Items */}
                                {selected === dch.id && (
                                    <div className={cn("border-t border-[var(--color-border)] p-4 bg-[var(--color-bg)]", printingId === dch.id ? "print-area" : "animate-slide-up")}>

                                        {/* Print Header */}
                                        {printingId === dch.id && (
                                            <div className="p-4 text-center border-b border-[var(--color-border)] mb-4">
                                                <h2 className="text-2xl font-bold">SONATRACH</h2>
                                                <p className="text-sm text-[var(--color-muted)]">Activité Aval — Holding Raffinage et Chimie</p>
                                                <h3 className="text-xl font-semibold mt-4">DÉCHARGE MATÉRIEL</h3>
                                                <p className="text-sm mt-1">
                                                    Passation entre {dch.partieCedante?.nom} et {dch.partieRecevante?.nom}
                                                </p>
                                            </div>
                                        )}

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
            )}
        </div>
    )
}
