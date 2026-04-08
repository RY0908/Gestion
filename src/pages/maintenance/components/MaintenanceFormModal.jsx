import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateMaintenance, useUpdateMaintenance } from '@/hooks/useMaintenances.js'
import { useAssets } from '@/hooks/useAssets.js'

function buildInitialState(maintenance) {
  if (!maintenance) {
    return {
      assetId: '',
      technician: '',
      type: 'PREVENTIVE',
      status: 'SCHEDULED',
      startDate: '',
      endDate: '',
      cost: 0,
      description: '',
      partsUsed: '',
    }
  }

  return {
    assetId: maintenance.asset?.id?.replace('ast-', '') || '',
    technician: maintenance.technician || '',
    type: maintenance.type || 'PREVENTIVE',
    status: maintenance.status || 'SCHEDULED',
    startDate: maintenance.startDate ? new Date(maintenance.startDate).toISOString().split('T')[0] : '',
    endDate: maintenance.endDate ? new Date(maintenance.endDate).toISOString().split('T')[0] : '',
    cost: maintenance.cost || 0,
    description: maintenance.description || '',
    partsUsed: maintenance.partsUsed || '',
  }
}

function MaintenanceFormContent({ onClose, maintenance }) {
  const isEditing = !!maintenance
  const createMutation = useCreateMaintenance()
  const updateMutation = useUpdateMaintenance()

  const { data: assetsRes, isLoading: isLoadingAssets } = useAssets({})
  const assets = assetsRes?.data || []

  const initial = buildInitialState(maintenance)
  const [assetId, setAssetId] = useState(initial.assetId)
  const [technician, setTechnician] = useState(initial.technician)
  const [type, setType] = useState(initial.type)
  const [status, setStatus] = useState(initial.status)
  const [startDate, setStartDate] = useState(initial.startDate)
  const [endDate, setEndDate] = useState(initial.endDate)
  const [cost, setCost] = useState(initial.cost)
  const [description, setDescription] = useState(initial.description)
  const [partsUsed, setPartsUsed] = useState(initial.partsUsed)

  const selectedAssetId = assetId || (!isEditing && assets.length === 1 ? assets[0].id : '')

  const handleSubmit = (e) => {
    e.preventDefault()

      if (isEditing) {
      const payload = {
        status,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        cost: parseFloat(cost) || 0,
        partsUsed,
        technician,
      }
      updateMutation.mutate({ id: maintenance.id, data: payload }, { onSuccess: () => onClose() })
      return
    }

    const payload = {
        assetId: selectedAssetId,
        technician,
        type,
        description,
      startDate: startDate ? new Date(startDate).toISOString() : null,
    }
    createMutation.mutate(payload, { onSuccess: () => onClose() })
  }

  const isPending = createMutation.isPending || updateMutation.isPending || isLoadingAssets

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Equipement concerne <span className="text-red-500">*</span></label>
          <select
            value={selectedAssetId}
            onChange={e => setAssetId(e.target.value)}
            required
            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
            disabled={isLoadingAssets}
          >
            <option value="">Selectionnez un appareil...</option>
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
              <option value="PREVENTIVE">Preventive</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="UPGRADE">Mise a niveau (Upgrade)</option>
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
              <option value="SCHEDULED">Planifiee</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminee</option>
              <option value="CANCELLED">Annulee</option>
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
          placeholder="Ex: Hassan Ouyahia (ou societe externe)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {!isEditing && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Date prevue</label>
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
            <label className="text-sm font-medium">Date de fin reelle</label>
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
            <label className="text-sm font-medium">Cout global (DZD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
              placeholder="Cout materiel + Mo"
            />
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Description du probleme / Motif</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
            placeholder="Description de la panne ou justification de la revision..."
            required
          />
        </div>
      )}

      {isEditing && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Pieces utilisees / Rapport</label>
          <textarea
            value={partsUsed}
            onChange={e => setPartsUsed(e.target.value)}
            rows={3}
            className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
            placeholder="Liste des materiels remplaces..."
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
          disabled={isPending || (!isEditing && (!selectedAssetId || !startDate))}
          className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
          {isEditing ? 'Enregistrer les modifications' : 'Creer le ticket'}
        </button>
      </div>
    </form>
  )
}

export function MaintenanceFormModal({ isOpen, onClose, maintenance }) {
  const key = maintenance?.id || 'new'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={maintenance ? 'Modifier le ticket' : 'Nouveau ticket de maintenance'}
      description={maintenance ? 'Modifiez l\'etat et cloturez l\'intervention.' : 'Planifiez ou enregistrez une maintenance sur un equipement.'}
    >
      <MaintenanceFormContent
        key={key}
        onClose={onClose}
        maintenance={maintenance}
      />
    </Modal>
  )
}
