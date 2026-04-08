import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { cn } from '@/lib/utils.js'
import { buildReportPayload } from '@/lib/reports/reportBuilders.js'
import { useAssets } from '@/hooks/useAssets.js'
import { useLicenses } from '@/hooks/useLicenses.js'
import { useMaintenances } from '@/hooks/useMaintenances.js'
import { useAssignments } from '@/hooks/useAssignments.js'
import { useAuditLog } from '@/hooks/useAuditLog.js'
import {
    Package,
    Key,
    Wrench,
    UserCheck,
    TrendingUp,
    ChevronRight,
    ChevronLeft,
    Download,
    Calendar,
    Check,
    FileText,
    Receipt,
    ArrowLeftRight,
    ClipboardList,
    Scan,
} from 'lucide-react'

import { DechargeGenerator } from '@/components/organisms/generators/DechargeGenerator'
import { BonCommandeGenerator } from '@/components/organisms/generators/BonCommandeGenerator'
import { InventoryGenerator } from '@/components/organisms/generators/InventoryGenerator'

const REPORT_TYPES = [
    { id: 'assets', icon: Package, label: 'Inventaire actifs', desc: 'État complet du parc informatique, répartition par catégorie et statut.' },
    { id: 'licenses', icon: Key, label: 'Licences logicielles', desc: 'Conformité, utilisation et coûts des licences par éditeur.' },
    { id: 'maintenance', icon: Wrench, label: 'Maintenance', desc: 'Historique des interventions, délais et coûts de maintenance.' },
    { id: 'assignments', icon: UserCheck, label: 'Affectations', desc: 'Attribution des équipements par structure et employé.' },
    { id: 'financial', icon: TrendingUp, label: 'Financier', desc: 'Valeur totale du parc, coûts récurrents et exposition budgétaire.' },
    { id: 'audit', icon: FileText, label: 'Audit complet', desc: 'Journal complet des opérations et événements système.' },
    { id: 'inventory', icon: Scan, label: "Fiche d'inventaire", desc: 'Générer la fiche physique pour le pointage par zone.', isGenerator: true },
    { id: 'purchase_orders', icon: ClipboardList, label: 'Bons de commande', desc: 'Générer un bon de commande réglementaire d’achat.', isGenerator: true },
    { id: 'bon_receptions', icon: Receipt, label: 'Bons de réception', desc: 'Générer un M-103 d’entrée de matériel et d’inventaire.', isGenerator: true },
    { id: 'decharges', icon: ArrowLeftRight, label: 'Décharges matériel', desc: 'Générer une attestation de transfert entre employés.', isGenerator: true },
]

const PERIODS = ['Ce mois', 'Ce trimestre', 'Cette année', 'Personnalisé']

const isReportType = (report) => report && !report.isGenerator

const sanitizeFilename = (value) =>
    String(value || 'rapport')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase()

function DownloadSkeleton() {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-muted)]">
            Préparation du PDF...
        </div>
    )
}

export default function ReportsPage() {
    const [step, setStep] = useState(1)
    const [selectedType, setSelectedType] = useState(null)
    const [selectedPeriod, setSelectedPeriod] = useState('Ce mois')
    const [isDownloading, setIsDownloading] = useState(false)

    const selectedReport = REPORT_TYPES.find((report) => report.id === selectedType) || null
    const reportMode = isReportType(selectedReport)

    const assetsQuery = useAssets({
        page: 1,
        pageSize: 5000,
        status: '',
        category: '',
        q: '',
    })
    const licensesQuery = useLicenses({
    })
    const maintenancesQuery = useMaintenances({
    })
    const assignmentsQuery = useAssignments({
    })
    const auditQuery = useAuditLog({
        enabled: selectedType === 'audit',
    })

    const assets = useMemo(() => assetsQuery.data?.data || [], [assetsQuery.data])
    const licenses = useMemo(() => licensesQuery.data?.data || [], [licensesQuery.data])
    const maintenances = useMemo(() => maintenancesQuery.data?.data || [], [maintenancesQuery.data])
    const assignments = useMemo(() => assignmentsQuery.data?.data || [], [assignmentsQuery.data])
    const auditEntries = useMemo(() => auditQuery.data?.data || [], [auditQuery.data])

    const reportPayload = useMemo(() => {
        if (!reportMode || !selectedReport) return null
        return buildReportPayload(selectedType, {
            assets,
            licenses,
            maintenances,
            assignments,
            audit: auditEntries,
        }, {
            reportLabel: selectedReport.label,
            periodLabel: selectedPeriod,
            generatedAt: new Date().toISOString(),
        })
    }, [reportMode, selectedReport, selectedType, assets, licenses, maintenances, assignments, auditEntries, selectedPeriod])

    const reportLoading = reportMode && (
        (selectedType === 'assets' || selectedType === 'financial') && assetsQuery.isLoading ||
        (selectedType === 'licenses' || selectedType === 'financial') && licensesQuery.isLoading ||
        (selectedType === 'maintenance' || selectedType === 'financial') && maintenancesQuery.isLoading ||
        (selectedType === 'assignments' || selectedType === 'financial') && assignmentsQuery.isLoading ||
        selectedType === 'audit' && auditQuery.isLoading
    )

    const canProceed = step === 1 ? !!selectedType : step === 2 ? true : false

    const handleDownloadPdf = async () => {
        if (!reportPayload) return

        try {
            setIsDownloading(true)
            const [{ pdf }, { ReportPdfDocument }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('@/components/reports/ReportPdfDocument.jsx'),
            ])

            const blob = await pdf(<ReportPdfDocument payload={reportPayload} />).toBlob()
            const fileName = `SIGMA_${sanitizeFilename(selectedReport?.label)}_${new Date().toISOString().slice(0, 10)}.pdf`
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            link.remove()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            toast.success('PDF généré avec succès')
        } catch (error) {
            console.error(error)
            toast.error('Impossible de générer le PDF du rapport.')
        } finally {
            setIsDownloading(false)
        }
    }

    const renderReportPreview = () => {
        if (!reportPayload) return null

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {reportPayload.metrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-1">{metric.label}</p>
                            <p className="text-2xl font-display font-bold text-[var(--color-text)]">{metric.value}</p>
                            {metric.hint ? <p className="text-xs text-[var(--color-muted)] mt-1">{metric.hint}</p> : null}
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                    <div className="bg-[var(--color-bg)] px-4 py-3 border-b border-[var(--color-border)]">
                        <h4 className="font-semibold text-sm">{reportPayload.sections[0]?.title || 'Aperçu du rapport'}</h4>
                        <p className="text-xs text-[var(--color-muted)]">Aperçu des premières lignes incluses dans le PDF.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                                <tr>
                                    {(reportPayload.sections[0]?.columns || []).map((column) => (
                                        <th key={column.key} className={cn('px-3 py-2 text-left font-medium whitespace-nowrap', column.align === 'right' && 'text-right')}>
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(reportPayload.sections[0]?.rows || []).slice(0, 6).map((row, index) => (
                                    <tr key={index} className="border-b border-[var(--color-border)]">
                                        {(reportPayload.sections[0]?.columns || []).map((column) => (
                                            <td key={column.key} className={cn('px-3 py-2 text-[var(--color-text)] whitespace-nowrap', column.align === 'right' && 'text-right')}>
                                                {row[column.key] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {(!reportPayload.sections[0]?.rows || reportPayload.sections[0].rows.length === 0) && (
                                    <tr>
                                        <td colSpan={(reportPayload.sections[0]?.columns || []).length || 1} className="px-3 py-6 text-center text-[var(--color-muted)]">
                                            Aucune donnée disponible.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <PageHeader
                title="Rapports"
                description="Générez et téléchargez des rapports PDF pour le suivi du parc et des opérations."
            />

            {!selectedReport?.isGenerator && (
                <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                    {[
                        { n: 1, label: 'Type de rapport' },
                        { n: 2, label: 'Configuration' },
                        { n: 3, label: 'Aperçu & Export' },
                    ].map((s, i) => (
                        <div key={s.n} className="flex items-center gap-2 flex-1">
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                                step === s.n ? 'bg-sonatrach-green text-white' :
                                    step > s.n ? 'bg-sonatrach-green/20 text-sonatrach-green' :
                                        'bg-[var(--color-bg)] text-[var(--color-muted)]'
                            )}>
                                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
                            </div>
                            <span className={cn(
                                'text-sm font-medium hidden sm:inline',
                                step === s.n ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'
                            )}>
                                {s.label}
                            </span>
                            {i < 2 && <div className="flex-1 h-px bg-[var(--color-border)] mx-2" />}
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm animate-fade-in" key={step}>
                {step === 1 && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Choisissez un type de rapport</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {REPORT_TYPES.map((type, i) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setSelectedType(type.id)
                                        setStep(1)
                                    }}
                                    className={cn(
                                        'text-left p-4 rounded-xl border-2 transition-all animate-fade-in card-hover',
                                        selectedType === type.id
                                            ? 'border-sonatrach-green bg-sonatrach-green/5 shadow-sm'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-muted)]'
                                    )}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <div className={cn(
                                        'p-2 rounded-lg w-fit mb-3 transition-colors',
                                        selectedType === type.id ? 'bg-sonatrach-green/10 text-sonatrach-green' : 'bg-[var(--color-bg)] text-[var(--color-muted)]'
                                    )}>
                                        <type.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1">{type.label}</h4>
                                    <p className="text-xs text-[var(--color-muted)] line-clamp-2">{type.desc}</p>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {step === 2 && !selectedReport?.isGenerator && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Configurer le rapport: {selectedReport?.label}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
                                    <Calendar className="w-3.5 h-3.5 inline mr-1" /> Période
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PERIODS.map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setSelectedPeriod(period)}
                                            className={cn(
                                                'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                                                selectedPeriod === period
                                                    ? 'border-sonatrach-green bg-sonatrach-green/5 text-sonatrach-green'
                                                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                                            )}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5 inline mr-1" /> Format
                                </label>
                                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm">
                                    PDF
                                </div>
                                <p className="text-xs text-[var(--color-muted)]">
                                    Le téléchargement produit directement un fichier PDF prêt à l’emploi.
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {step === 2 && selectedReport?.isGenerator && (
                    <div className="animate-fade-in">
                        {selectedReport.id === 'decharges' && <DechargeGenerator />}
                        {selectedReport.id === 'purchase_orders' && <BonCommandeGenerator />}
                        {selectedReport.id === 'inventory' && <InventoryGenerator />}
                        {selectedReport.id === 'bon_receptions' && (
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-muted)]">
                                Le formulaire de bons de réception est disponible dans l’espace documents.
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && !selectedReport?.isGenerator && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Aperçu & Export</h3>
                        <div className="border border-[var(--color-border)] rounded-xl p-6 mb-6 bg-[var(--color-bg)] space-y-4">
                            <div className="flex items-start gap-4">
                                {selectedReport && (
                                    <div className="p-2.5 rounded-lg bg-sonatrach-green/10 text-sonatrach-green">
                                        <selectedReport.icon className="w-6 h-6" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-lg">{selectedReport?.label}</h4>
                                    <p className="text-sm text-[var(--color-muted)]">{selectedReport?.desc}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-[var(--color-muted)] text-xs mb-0.5">Période</p>
                                    <p className="font-medium">{selectedPeriod}</p>
                                </div>
                                <div>
                                    <p className="text-[var(--color-muted)] text-xs mb-0.5">Format</p>
                                    <p className="font-medium">PDF</p>
                                </div>
                                <div>
                                    <p className="text-[var(--color-muted)] text-xs mb-0.5">Génération</p>
                                    <p className="font-medium">{new Date().toLocaleDateString('fr-DZ')}</p>
                                </div>
                            </div>
                        </div>

                        {reportLoading ? <DownloadSkeleton /> : renderReportPreview()}

                        <button
                            onClick={handleDownloadPdf}
                            disabled={!reportPayload || isDownloading || reportLoading}
                            className={cn(
                                'flex items-center justify-center gap-2 w-full py-3 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-xl font-medium transition-colors btn-press',
                                (!reportPayload || isDownloading || reportLoading) && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            <Download className="w-5 h-5" />
                            {isDownloading ? 'Génération du PDF...' : 'Télécharger le rapport PDF'}
                        </button>
                    </>
                )}
            </div>

            <div className="flex justify-between print:hidden">
                <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors btn-press',
                        step === 1 ? 'text-[var(--color-muted)] cursor-not-allowed' : 'bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                    )}
                >
                    <ChevronLeft className="w-4 h-4" /> {selectedReport?.isGenerator && step === 2 ? 'Retour aux rapports' : 'Précédent'}
                </button>

                {step < 3 && !selectedReport?.isGenerator && (
                    <button
                        onClick={() => setStep(Math.min(3, step + 1))}
                        disabled={!canProceed}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors btn-press',
                            canProceed
                                ? 'bg-sonatrach-green hover:bg-sonatrach-green-light text-white'
                                : 'bg-[var(--color-bg)] text-[var(--color-muted)] cursor-not-allowed'
                        )}
                    >
                        Suivant <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
