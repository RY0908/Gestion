import { useMemo, useState } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateRequest } from '@/hooks/useRequests.js'
import { useAssignments } from '@/hooks/useAssignments.js'
import { useAuthStore } from '@/store/authStore.js'
import { REQUEST_CATEGORIES, getRequestSpecificationFields, compactSpecifications, summarizeSpecifications } from '@/lib/specifications.js'

const buildDefaultSpecifications = (category) => {
    const fields = getRequestSpecificationFields(category)
    return fields.reduce((acc, field) => {
        acc[field.key] = field.type === 'number' ? 1 : ''
        return acc
    }, {})
}

const REQUEST_TABS = [
    { value: 'material', label: 'Materiel', description: "Demande d'equipement ou de logiciel" },
    { value: 'maintenance', label: 'Maintenance', description: 'Panne ou intervention sur un actif existant' },
]

const MATERIAL_REQUEST_CATEGORIES = REQUEST_CATEGORIES.filter(category => category.value !== 'MAINTENANCE')

export function RequestFormModal({ isOpen, onClose }) {
    const createMutation = useCreateRequest()
    const { user } = useAuthStore()
    const { data: assignmentsRes } = useAssignments({ userId: user?.id, status: 'ACTIVE' })
    const assignedMaintenanceAssets = useMemo(() => {
        return (assignmentsRes?.data ?? [])
            .map(assignment => ({
                assignmentId: assignment.id,
                assignedAt: assignment.assignedAt,
                assignedBy: assignment.assignedBy,
                request: assignment.sourceRequest,
                asset: assignment.asset,
            }))
            .filter(entry => entry.asset?.id)
    }, [assignmentsRes?.data])

    const [activeTab, setActiveTab] = useState('material')

    const [materialCategory, setMaterialCategory] = useState('LAPTOP')
    const [materialPriority, setMaterialPriority] = useState('MEDIUM')
    const [materialReason, setMaterialReason] = useState('')
    const [materialSpecifications, setMaterialSpecifications] = useState(() => buildDefaultSpecifications('LAPTOP'))
    const [materialSpecsCache, setMaterialSpecsCache] = useState({
        LAPTOP: buildDefaultSpecifications('LAPTOP'),
    })

    const [maintenancePriority, setMaintenancePriority] = useState('MEDIUM')
    const [maintenanceReason, setMaintenanceReason] = useState('')
    const [maintenanceAssetId, setMaintenanceAssetId] = useState('')
    const [maintenanceSpecifications, setMaintenanceSpecifications] = useState(() => buildDefaultSpecifications('MAINTENANCE'))

    const materialSpecFields = getRequestSpecificationFields(materialCategory)
    const maintenanceSpecFields = getRequestSpecificationFields('MAINTENANCE')

    const handleMaterialCategoryChange = (nextCategory) => {
        setMaterialSpecsCache(prev => ({
            ...prev,
            [materialCategory]: materialSpecifications,
        }))
        setMaterialCategory(nextCategory)
        setMaterialSpecifications(materialSpecsCache[nextCategory] || buildDefaultSpecifications(nextCategory))
    }

    const handleMaterialSpecChange = (key, value) => {
        setMaterialSpecifications(prev => {
            const next = { ...prev, [key]: value }
            setMaterialSpecsCache(cache => ({
                ...cache,
                [materialCategory]: next,
            }))
            return next
        })
    }

    const handleMaintenanceSpecChange = (key, value) => {
        setMaintenanceSpecifications(prev => ({ ...prev, [key]: value }))
    }

    const buildMaintenanceSpecificationsFromAsset = (selectedEntry) => {
        if (!selectedEntry?.asset) return buildDefaultSpecifications('MAINTENANCE')
        const selectedAsset = selectedEntry.asset
        return compactSpecifications({
            ...buildDefaultSpecifications('MAINTENANCE'),
            assetId: selectedAsset.id,
            assignmentId: selectedEntry.assignmentId,
            assetTag: selectedAsset.assetTag,
            serialNumber: selectedAsset.serialNumber,
            category: selectedAsset.category,
            brand: selectedAsset.brand,
            model: selectedAsset.model,
            status: selectedAsset.status,
            condition: selectedAsset.condition,
            location: selectedAsset.location,
            acquisitionDate: selectedAsset.acquisitionDate,
            warrantyDate: selectedAsset.warrantyDate,
            supplier: selectedAsset.supplier,
            invoiceNumber: selectedAsset.invoiceNumber,
            assetNotes: selectedAsset.notes,
            assetSpecifications: summarizeSpecifications(selectedAsset.category, selectedAsset.specifications, 'asset') || '',
        })
    }

    const selectedMaintenanceAssetId = maintenanceAssetId || (activeTab === 'maintenance' && assignedMaintenanceAssets.length === 1 ? assignedMaintenanceAssets[0].asset.id : '')
    const selectedMaintenanceAsset = assignedMaintenanceAssets.find(entry => entry.asset.id === selectedMaintenanceAssetId) || null

    const resetMaterialForm = () => {
        setMaterialCategory('LAPTOP')
        setMaterialPriority('MEDIUM')
        setMaterialReason('')
        const defaults = buildDefaultSpecifications('LAPTOP')
        setMaterialSpecifications(defaults)
        setMaterialSpecsCache({ LAPTOP: defaults })
    }

    const resetMaintenanceForm = () => {
        setMaintenancePriority('MEDIUM')
        setMaintenanceReason('')
        setMaintenanceAssetId('')
        setMaintenanceSpecifications(buildDefaultSpecifications('MAINTENANCE'))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const isMaintenance = activeTab === 'maintenance'
        const selectedCategory = isMaintenance ? 'MAINTENANCE' : materialCategory
        const selectedPriority = isMaintenance ? maintenancePriority : materialPriority
        const selectedReason = isMaintenance ? maintenanceReason : materialReason
        const selectedSpecifications = isMaintenance
            ? buildMaintenanceSpecificationsFromAsset(selectedMaintenanceAsset)
            : materialSpecifications

        createMutation.mutate({
            requestedById: user.id,
            assetCategory: selectedCategory,
            priority: selectedPriority,
            reason: selectedReason,
            specifications: compactSpecifications({
                ...selectedSpecifications,
            }),
        }, {
            onSuccess: () => {
                resetMaterialForm()
                resetMaintenanceForm()
                onClose()
            },
        })
    }

    const isPending = createMutation.isPending
    const canSubmit = activeTab === 'maintenance'
        ? Boolean(maintenanceReason && selectedMaintenanceAsset)
        : Boolean(materialReason && materialCategory)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouvelle demande"
            description="Choisissez le type de demande puis remplissez les champs adaptes."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                    {REQUEST_TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setActiveTab(tab.value)}
                            className={`rounded-lg px-4 py-3 text-left transition-colors ${
                                activeTab === tab.value
                                    ? 'bg-sonatrach-green text-white shadow-sm'
                                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                            }`}
                        >
                            <div className="font-semibold">{tab.label}</div>
                            <div className={`text-xs ${activeTab === tab.value ? 'text-white/80' : 'text-[var(--color-muted)]'}`}>
                                {tab.description}
                            </div>
                        </button>
                    ))}
                </div>

                {activeTab === 'material' ? (
                    <>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Type d'equipement <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={materialCategory}
                                onChange={e => handleMaterialCategoryChange(e.target.value)}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            >
                                {MATERIAL_REQUEST_CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="border-t border-[var(--color-border)] pt-4">
                            <label className="text-sm font-medium block mb-2">Specifications souhaitees</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materialSpecFields.map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <label className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            min={field.min}
                                            placeholder={field.placeholder}
                                            value={materialSpecifications[field.key] ?? (field.type === 'number' ? 1 : '')}
                                            onChange={(e) => handleMaterialSpecChange(
                                                field.key,
                                                field.type === 'number'
                                                    ? Number(e.target.value || 0)
                                                    : e.target.value
                                            )}
                                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--color-muted)] mt-2">
                                Les champs changent selon la categorie materiel choisie.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Equipement concerne <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedMaintenanceAssetId}
                                onChange={e => {
                                    const nextAssetId = e.target.value
                                    setMaintenanceAssetId(nextAssetId)
                                    const nextEntry = assignedMaintenanceAssets.find(entry => entry.asset.id === nextAssetId) || null
                                    setMaintenanceSpecifications(buildMaintenanceSpecificationsFromAsset(nextEntry))
                                }}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            required
                        >
                                <option value="">Selectionnez un equipement affecte...</option>
                                {assignedMaintenanceAssets.map(entry => (
                                    <option key={entry.asset.id} value={entry.asset.id}>
                                        {entry.asset.assetTag || entry.asset.code_inventaire} - {entry.asset.brand} {entry.asset.model} ({entry.asset.category || entry.asset.categorie})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-[var(--color-muted)]">
                                La maintenance utilise uniquement les actifs qui vous sont actuellement affectes.
                            </p>
                        </div>

                                {selectedMaintenanceAsset && (
                            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-sm font-semibold text-[var(--color-text)]">
                                            {selectedMaintenanceAsset.asset.assetTag} - {selectedMaintenanceAsset.asset.brand} {selectedMaintenanceAsset.asset.model}
                                        </div>
                                        <div className="text-xs text-[var(--color-muted)]">
                                            {selectedMaintenanceAsset.asset.category} • {selectedMaintenanceAsset.asset.status}
                                        </div>
                                    </div>
                                    <div className="text-xs text-[var(--color-muted)] text-right">
                                        Affecte le {selectedMaintenanceAsset.assignedAt ? new Date(selectedMaintenanceAsset.assignedAt).toLocaleDateString('fr-FR') : '—'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    <div><span className="text-[var(--color-muted)]">Numéro de série:</span> <span className="font-medium">{selectedMaintenanceAsset.asset.serialNumber || '—'}</span></div>
                                    <div><span className="text-[var(--color-muted)]">Localisation:</span> <span className="font-medium">{selectedMaintenanceAsset.asset.location || '—'}</span></div>
                                    <div><span className="text-[var(--color-muted)]">Condition:</span> <span className="font-medium">{selectedMaintenanceAsset.asset.condition || '—'}</span></div>
                                    <div><span className="text-[var(--color-muted)]">Garantie:</span> <span className="font-medium">{selectedMaintenanceAsset.asset.warrantyDate || '—'}</span></div>
                                    <div><span className="text-[var(--color-muted)]">Fournisseur:</span> <span className="font-medium">{selectedMaintenanceAsset.asset.supplier || '—'}</span></div>
                                    <div><span className="text-[var(--color-muted)]">Facture:</span> <span className="font-medium">{selectedMaintenanceAsset.asset.invoiceNumber || '—'}</span></div>
                                </div>
                                {summarizeSpecifications(selectedMaintenanceAsset.asset.category, selectedMaintenanceAsset.asset.specifications, 'asset') && (
                                    <div className="text-xs text-[var(--color-muted)]">
                                        {summarizeSpecifications(selectedMaintenanceAsset.asset.category, selectedMaintenanceAsset.asset.specifications, 'asset')}
                                    </div>
                                )}
                                {selectedMaintenanceAsset.assignmentId && (
                                    <div className="text-xs text-[var(--color-muted)]">
                                        Affectation: {selectedMaintenanceAsset.assignmentId}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-t border-[var(--color-border)] pt-4">
                            <label className="text-sm font-medium block mb-2">Specifications de maintenance</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {maintenanceSpecFields.map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <label className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                                            {field.label}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={field.placeholder}
                                            value={maintenanceSpecifications[field.key] ?? ''}
                                            onChange={(e) => handleMaintenanceSpecChange(field.key, e.target.value)}
                                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--color-muted)] mt-2">
                                Cette demande cree un ticket de maintenance si elle est acceptee par le superviseur.
                            </p>
                        </div>
                    </>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium">Priorite</label>
                    <select
                        value={activeTab === 'maintenance' ? maintenancePriority : materialPriority}
                        onChange={e => activeTab === 'maintenance'
                            ? setMaintenancePriority(e.target.value)
                            : setMaterialPriority(e.target.value)}
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                    >
                        <option value="LOW">Basse - Pas d'urgence</option>
                        <option value="MEDIUM">Moyenne - Standard</option>
                        <option value="HIGH">Haute - Bloquant pour mon travail</option>
                        <option value="URGENT">Urgente - Panne totale / Critique</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">
                        Justification professionnelle <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={activeTab === 'maintenance' ? maintenanceReason : materialReason}
                        onChange={e => activeTab === 'maintenance'
                            ? setMaintenanceReason(e.target.value)
                            : setMaterialReason(e.target.value)}
                        required
                        rows={4}
                        className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                        placeholder={activeTab === 'maintenance'
                            ? 'Expliquez la panne ou le besoin d intervention...'
                            : 'Veuillez detailler pourquoi vous avez besoin de cet equipement...'}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)] mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                        disabled={isPending}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isPending || !canSubmit}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Soumettre la demande {activeTab === 'maintenance' ? 'de maintenance' : 'materiel'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
