import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { cn } from '@/lib/utils.js'
import {
    FileBarChart, Package, Key, Wrench, UserCheck, TrendingUp,
    ChevronRight, ChevronLeft, Download, Calendar, Filter,
    Check, FileText, Receipt, ArrowLeftRight, ClipboardList, Scan
} from 'lucide-react'

import { DechargeGenerator } from '@/components/organisms/generators/DechargeGenerator'
import { BonCommandeGenerator } from '@/components/organisms/generators/BonCommandeGenerator'
import { InventoryGenerator } from '@/components/organisms/generators/InventoryGenerator'

const REPORT_TYPES = [
    { id: 'assets', icon: Package, label: 'Inventaire Actifs', desc: 'État complet du parc informatique, répartition par catégorie et statut.' },
    { id: 'inventory', icon: Scan, label: 'Fiche d\'Inventaire', desc: 'Générer la fiche vierge pour le pointage physique par zone.', isGenerator: true },
    { id: 'purchase_orders', icon: ClipboardList, label: 'Bons de Commande', desc: 'Générer un Bon de Commande réglementaire d\'achat.', isGenerator: true },
    { id: 'bon_receptions', icon: Receipt, label: 'Bons de Réception', desc: 'Générer un M-103 d\'entrée de matériel et d\'inventaire.', isGenerator: true },
    { id: 'decharges', icon: ArrowLeftRight, label: 'Décharges Matériel', desc: 'Générer une attestation de transfert / cession entre employés.', isGenerator: true },
    { id: 'licenses', icon: Key, label: 'Licences Logicielles', desc: 'Conformité, utilisation et coûts des licences par fournisseur.' },
    { id: 'maintenance', icon: Wrench, label: 'Maintenance', desc: 'Historique des interventions, MTTR et coûts de maintenance.' },
    { id: 'assignments', icon: UserCheck, label: 'Affectations', desc: 'Attribution des équipements par département et employé.' },
    { id: 'financial', icon: TrendingUp, label: 'Financier', desc: 'Valeur totale du parc, amortissements et prévisions budgétaires.' },
    { id: 'audit', icon: FileText, label: 'Audit Complet', desc: 'Journal complet des opérations et événements système.' },
]

const FORMATS = ['PDF', 'Excel', 'CSV']
const PERIODS = ['Ce mois', 'Ce trimestre', 'Cette année', 'Personnalisé']

export default function ReportsPage() {
    const [step, setStep] = useState(1)
    const [selectedType, setSelectedType] = useState(null)
    const [selectedFormat, setSelectedFormat] = useState('PDF')
    const [selectedPeriod, setSelectedPeriod] = useState('Ce mois')

    const selectedReport = REPORT_TYPES.find(r => r.id === selectedType)

    const canProceed = step === 1 ? !!selectedType : step === 2 ? true : false

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <PageHeader
                title="Rapports"
                description="Générez des rapports personnalisés pour le suivi de votre parc."
            />

            {/* Stepper (Only for classic reports) */}
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


            {/* Step Content */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm animate-fade-in" key={step}>
                {step === 1 && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Choisissez un type de rapport</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {REPORT_TYPES.map((type, i) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
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
                                    {PERIODS.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedPeriod(p)}
                                            className={cn(
                                                'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                                                selectedPeriod === p
                                                    ? 'border-sonatrach-green bg-sonatrach-green/5 text-sonatrach-green'
                                                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
                                    <FileText className="w-3.5 h-3.5 inline mr-1" /> Format de sortie
                                </label>
                                <div className="flex gap-2">
                                    {FORMATS.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setSelectedFormat(f)}
                                            className={cn(
                                                'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                                                selectedFormat === f
                                                    ? 'border-sonatrach-green bg-sonatrach-green/5 text-sonatrach-green'
                                                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                                            )}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {step === 2 && selectedReport?.isGenerator && (
                    <div className="animate-fade-in">
                        {selectedReport.id === 'decharges' && <DechargeGenerator />}
                        {selectedReport.id === 'purchase_orders' && <BonCommandeGenerator />}
                        {selectedReport.id === 'inventory' && <InventoryGenerator />}
                    </div>
                )}

                {step === 3 && !selectedReport?.isGenerator && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Aperçu & Export</h3>
                        <div className="border border-[var(--color-border)] rounded-xl p-6 mb-6 bg-[var(--color-bg)]">
                            <div className="flex items-start gap-4 mb-4">
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
                                    <p className="font-medium">{selectedFormat}</p>
                                </div>
                                <div>
                                    <p className="text-[var(--color-muted)] text-xs mb-0.5">Date de génération</p>
                                    <p className="font-medium">{new Date().toLocaleDateString('fr-DZ')}</p>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-xl font-medium transition-colors btn-press">
                            <Download className="w-5 h-5" />
                            Télécharger le rapport ({selectedFormat})
                        </button>
                    </>
                )}
            </div>

            {/* Navigation */}
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
