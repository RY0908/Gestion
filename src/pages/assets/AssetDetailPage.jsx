import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as Tabs from '@radix-ui/react-tabs'
import { QRCodeSVG } from 'qrcode.react'
import {
    ArrowLeft, Edit, Trash2, ShieldCheck, MapPin, Monitor,
    Clock, FileText, Wrench, Upload, Download, History,
    UserSquare, ChevronDown, ChevronRight, Copy, Printer
} from 'lucide-react'
import { api } from '@/lib/api/client.js'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton.jsx'
import { formatCurrency, formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'

// Collapsible section component
const Section = ({ icon: Icon, title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-5 py-3.5 bg-[var(--color-bg)] flex items-center justify-between hover:bg-[var(--color-surface-alt)] transition-colors"
            >
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                    {Icon && <Icon className="w-4 h-4" />}
                    {title}
                </h3>
                {open ? <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />}
            </button>
            {open && <div className="p-5">{children}</div>}
        </div>
    )
}

const Field = ({ label, children }) => (
    <div>
        <dt className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">{label}</dt>
        <dd className="font-medium text-[var(--color-text)] text-sm">{children || <span className="italic text-[var(--color-muted)]">—</span>}</dd>
    </div>
)

export default function AssetDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [showQR, setShowQR] = useState(false)

    const { data: res, isLoading } = useQuery({
        queryKey: ['asset', id],
        queryFn: () => api.get(`/assets/${id}`),
    })

    if (isLoading) return (
        <div className="p-6 max-w-5xl mx-auto space-y-4">
            <LoadingSkeleton variant="text" className="w-32" />
            <LoadingSkeleton variant="title" />
            <LoadingSkeleton variant="chart" />
        </div>
    )

    const asset = res?.data
    if (!asset) return (
        <div className="p-6 max-w-5xl mx-auto">
            <EmptyState
                title="Actif introuvable"
                description="L'équipement demandé n'existe pas ou a été supprimé."
                actionLabel="Retour à l'inventaire"
                onAction={() => navigate('/assets')}
            />
        </div>
    )

    const warrantyExpired = asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <button onClick={() => navigate('/assets')} className="hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Inventaire
                </button>
                <span className="text-[var(--color-border)]">/</span>
                <span className="text-[var(--color-text)] font-medium">{asset.brand} {asset.model}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold flex items-center gap-3">
                        {asset.brand} {asset.model}
                        <StatusBadge status={asset.status} />
                    </h1>
                    <div className="flex items-center gap-3 mt-2 text-[var(--color-muted)] text-sm flex-wrap">
                        <AssetTypeBadge category={asset.category} />
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                        <CopyableText value={asset.assetTag} />
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="text-sonatrach-green hover:text-sonatrach-green-light text-xs font-medium transition-colors"
                        >
                            🏷️ {showQR ? 'Masquer' : 'Afficher'} QR Code
                        </button>
                    </div>
                    {/* QR Code */}
                    {showQR && (
                        <div className="mt-4 flex items-center gap-4 p-4 bg-white rounded-xl border border-[var(--color-border)] w-fit animate-scale-in">
                            <QRCodeSVG value={`${window.location.origin}/assets/${id}`} size={120} />
                            <div className="space-y-2">
                                <p className="text-xs text-[var(--color-muted)]">Scannez pour accéder à la fiche</p>
                                <button className="flex items-center gap-1 text-xs font-medium text-sonatrach-green hover:text-sonatrach-green-light transition-colors">
                                    <Printer className="w-3 h-3" /> Imprimer
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/assets/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg text-sm font-medium transition-colors btn-press"
                    >
                        <Edit className="w-4 h-4" /> Modifier
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors btn-press">
                        <Trash2 className="w-4 h-4" /> Retirer
                    </button>
                </div>
            </div>

            {/* Tabbed Content */}
            <Tabs.Root defaultValue="info" className="space-y-6">
                <Tabs.List className="flex gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-1">
                    {[
                        { value: 'info', icon: Monitor, label: 'Informations' },
                        { value: 'history', icon: History, label: 'Historique' },
                        { value: 'documents', icon: FileText, label: 'Documents' },
                        { value: 'maintenance', icon: Wrench, label: 'Maintenance' },
                        { value: 'assignments', icon: UserSquare, label: 'Prêts' },
                    ].map(tab => (
                        <Tabs.Trigger
                            key={tab.value}
                            value={tab.value}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                'data-[state=active]:bg-[var(--color-surface)] data-[state=active]:text-sonatrach-green data-[state=active]:shadow-sm',
                                'data-[state=inactive]:text-[var(--color-muted)] data-[state=inactive]:hover:text-[var(--color-text)]'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* Tab: Informations */}
                <Tabs.Content value="info" className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Section icon={Monitor} title="Détails Matériels">
                                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                                    <Field label="Constructeur">{asset.brand}</Field>
                                    <Field label="Modèle">{asset.model}</Field>
                                    <Field label="Numéro de série"><CopyableText value={asset.serialNumber} /></Field>
                                    <Field label="Code d'inventaire"><CopyableText value={asset.assetTag} /></Field>
                                    {(asset.inventoryNumber && asset.inventoryNumber !== asset.assetTag) && (
                                        <Field label="N° d'inventaire Phys."><CopyableText value={asset.inventoryNumber} /></Field>
                                    )}
                                    <Field label="État physique">
                                        {asset.condition === 'EXCELLENT' ? 'Excellent' :
                                            asset.condition === 'GOOD' ? 'Bon' :
                                                asset.condition === 'FAIR' ? 'Passable' : 'Mauvais'}
                                    </Field>
                                </div>
                            </Section>

                            <Section icon={UserSquare} title="Affectation Actuelle">
                                {asset.assignedTo ? (
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-sonatrach-green/10 flex items-center justify-center text-sonatrach-green font-bold text-lg">
                                            {asset.assignedTo.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-lg">{asset.assignedTo.fullName}</div>
                                            <div className="text-sm text-[var(--color-muted)]">{asset.assignedTo.position} • {asset.assignedTo.department?.name}</div>
                                            <div className="text-xs text-[var(--color-muted)] mt-2 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> Affecté le {formatDate(asset.assignedAt)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-[var(--color-muted)] mb-4">Cet équipement n'est actuellement affecté à aucun employé.</p>
                                        <button className="px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press">
                                            Assigner l'équipement
                                        </button>
                                    </div>
                                )}
                            </Section>

                            <Section icon={FileText} title="Notes Additionnelles" defaultOpen={false}>
                                <p className="text-sm text-[var(--color-text)]">
                                    {asset.notes || <span className="text-[var(--color-muted)] italic">Aucune note.</span>}
                                </p>
                            </Section>
                        </div>

                        <div className="space-y-6">
                            <Section icon={MapPin} title="Localisation">
                                <div className="text-sm space-y-3">
                                    <div>
                                        <div className="font-medium">{asset.location?.name}</div>
                                        <div className="text-[var(--color-muted)] mt-0.5">{asset.location?.building} • {asset.location?.city}</div>
                                    </div>
                                    <div className="pt-3 border-t border-[var(--color-border)]">
                                        <span className="text-[var(--color-muted)] text-xs block mb-1">Département & Structure</span>
                                        <span className="font-medium block text-sm">{asset.department?.name} ({asset.department?.code})</span>
                                        {asset.affectation && <span className="font-medium text-sonatrach-green block mt-1.5 text-sm">Affectation: {asset.affectation}</span>}
                                        {asset.bureau && <span className="font-medium block mt-1 text-sm text-[var(--color-muted)]">N° Bureau: {asset.bureau}</span>}
                                        {asset.etage && <span className="font-medium block mt-1 text-sm text-[var(--color-muted)]">Étage: {asset.etage}</span>}
                                    </div>
                                </div>
                            </Section>

                            <Section icon={ShieldCheck} title="Acquisition & Garantie">
                                <div className="space-y-4 text-sm">
                                    <Field label="Fournisseur">{typeof asset.supplier === 'object' ? asset.supplier?.name : asset.supplier}</Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Date d'achat">{formatDate(asset.purchaseDate)}</Field>
                                        <Field label="Garantie jusqu'au">
                                            <span className={warrantyExpired ? 'text-red-500' : 'text-sonatrach-green'}>
                                                {formatDate(asset.warrantyExpiry)}
                                            </span>
                                            {warrantyExpired && (
                                                <span className="ml-1 text-[10px] bg-red-50 dark:bg-red-900/20 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">Expiré</span>
                                            )}
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border)]">
                                        <Field label="Valeur d'achat">{formatCurrency(asset.purchasePrice)}</Field>
                                        <Field label="Facture">
                                            <span className="text-sonatrach-green cursor-pointer hover:underline">{asset.invoiceNumber}</span>
                                        </Field>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    </div>
                </Tabs.Content>

                {/* Tab: Historique */}
                <Tabs.Content value="history" className="animate-fade-in">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <EmptyState
                            icon={History}
                            title="Historique des actions"
                            description="L'historique complet des modifications sera affiché ici (assignations, maintenance, transferts...)."
                        />
                    </div>
                </Tabs.Content>

                {/* Tab: Documents */}
                <Tabs.Content value="documents" className="animate-fade-in">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center mb-6">
                            <Upload className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-3" />
                            <p className="text-sm font-medium">Glissez-déposez vos fichiers ici</p>
                            <p className="text-xs text-[var(--color-muted)] mt-1">ou cliquez pour parcourir (PDF, images, max 10MB)</p>
                        </div>
                        <EmptyState
                            icon={FileText}
                            title="Aucun document"
                            description="Les factures, photos, et documents liés à cet actif apparaîtront ici."
                            actionLabel="Ajouter un document"
                            onAction={() => { }}
                        />
                    </div>
                </Tabs.Content>

                {/* Tab: Maintenance */}
                <Tabs.Content value="maintenance" className="animate-fade-in">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <EmptyState
                            icon={Wrench}
                            title="Aucun ticket de maintenance"
                            description="Créez un ticket pour signaler un problème ou planifier une intervention."
                            actionLabel="Créer un ticket"
                            onAction={() => navigate('/maintenance')}
                        />
                    </div>
                </Tabs.Content>

                {/* Tab: Prêts */}
                <Tabs.Content value="assignments" className="animate-fade-in">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <EmptyState
                            icon={UserSquare}
                            title="Aucun historique de prêt"
                            description="L'historique des affectations et prêts de cet équipement sera affiché ici."
                        />
                    </div>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}
