import { useState, useEffect } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateMaintenance, useUpdateMaintenance } from '@/hooks/useMaintenances.js'
import { useAssets } from '@/hooks/useAssets.js'

export function MaintenanceFormModal({ isOpen, onClose, maintenance }) {
    const isEditing = !!maintenance
    const createMutation = useCreateMaintenance()
    const updateMutation = useUpdateMaintenance()

    const { data: assetsRes, isLoading: isLoadingAssets } = useAssets({})
    const assets = assetsRes?.data || []

    const [assetId, setAssetId] = useState('')
    const [technician, setTechnician] = useState('')
    const [type, setType] = useState('PREVENTIVE')
    const [status, setStatus] = useState('SCHEDULED')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [cost, setCost] = useState(0)
    const [description, setDescription] = useState('')
    const [partsUsed, setPartsUsed] = useState('')

    useEffect(() => {
        if (isOpen) {
            if (isEditing && maintenance) {
                setAssetId(maintenance.asset?.id?.replace('ast-', '') || '')
                setTechnician(maintenance.technician || '')
                setType(maintenance.type || 'PREVENTIVE')
                setStatus(maintenance.status || 'SCHEDULED')
                setStartDate(maintenance.startDate ? new Date(maintenance.startDate).toISOString().split('T')[0] : '')
                setEndDate(maintenance.endDate ? new Date(maintenance.endDate).toISOString().split('T')[0] : '')
                setCost(maintenance.cost || 0)
                setDescription(maintenance.description || '')
                setPartsUsed(maintenance.partsUsed || '')
            } else {
                setAssetId('')
                setTechnician('')
                setType('PREVENTIVE')
                setStatus('SCHEDULED')
                setStartDate('')
                setEndDate('')
                setCost(0)
                setDescription('')
                setPartsUsed('')
            }
        }
    }, [isOpen, isEditing, maintenance])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (isEditing) {
            const payload = {
                status,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                cost: parseFloat(cost) || 0,
                partsUsed,
                technician
            }
            updateMutation.mutate({ id: maintenance.id, data: payload }, {
                onSuccess: () => onClose()
            })
        } else {
            const payload = {
                assetId,
                technician,
                type,
                description,
                startDate: startDate ? new Date(startDate).toISOString() : null
            }
            createMutation.mutate(payload, {
                onSuccess: () => onClose()
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending || isLoadingAssets

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier le ticket' : 'Nouveau ticket de maintenance'}
            description={isEditing ? 'Modifiez l\'état et clôturez l\'intervention.' : 'Planifiez ou enregistrez une maintenance sur un équipement.'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isEditing && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Équipement concerné <span className="text-red-500">*</span></label>
                        <select
                            value={assetId}
                            onChange={e => setAssetId(e.target.value)}
                            required
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            disabled={isLoadingAssets}
                        >
                            <option value="">Sélectionnez un appareil...</option>
                            {assets.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.assetTag} - {a.brand} {a.model} ({a.category})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {!isEditing && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Type de maintenance</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            >
                                <option value="PREVENTIVE">Préventive</option>
                                <option value="CORRECTIVE">Corrective</option>
                                <option value="UPGRADE">Mise à niveau (Upgrade)</option>
                            </select>
                        </div>
                    )}

                    {isEditing && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Statut</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            >
                                <option value="SCHEDULED">Planifiée</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="COMPLETED">En attente de clôture (Terminé)</option>
                                <option value="CANCELLED">Annulée</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Nom du technicien</label>
                    <input
                        type="text"
                        value={technician}
                        onChange={e => setTechnician(e.target.value)}
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        placeholder="Ex: Hassan Ouyahia (ou société externe)"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {!isEditing && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date prévue</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                                required
                            />
                        </div>
                    )}
                    {isEditing && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date de fin réelle</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            />
                        </div>
                    )}
                    {isEditing && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Coût global (DZD)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={cost}
                                onChange={e => setCost(e.target.value)}
                                className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                                placeholder="Coût matériel + Mo"
                            />
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Description du problème / Motif</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                            placeholder="Description de la panne ou justification de la révision..."
                            required
                        />
                    </div>
                )}
                
                {isEditing && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Pièces utilisées / Rapport</label>
                        <textarea
                            value={partsUsed}
                            onChange={e => setPartsUsed(e.target.value)}
                            rows={3}
                            className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                            placeholder="Liste des matériels remplacés..."
                        />
                    </div>
                )}

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
                        disabled={isPending || (!isEditing && (!assetId || !startDate))}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
                        {isEditing ? 'Enregistrer les modifications' : 'Créer le ticket'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

