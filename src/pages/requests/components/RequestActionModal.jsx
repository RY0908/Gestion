import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useUpdateRequest } from '@/hooks/useRequests.js'

export function RequestActionModal({ isOpen, onClose, request, actionType }) {
    const normalizedAction = String(actionType || '').toLowerCase()
    const isAccepting = normalizedAction === 'accept'
    const isRejecting = normalizedAction === 'reject'
    const isEditing = normalizedAction === 'edit'

    const updateMutation = useUpdateRequest()

    const [notes, setNotes] = useState('')
    const [status, setStatus] = useState('PENDING')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (isAccepting) {
            updateMutation.mutate({ id: request.id, data: { status: 'ASSIGNED', notes } }, { onSuccess: () => onClose() })
        } else if (isRejecting) {
            updateMutation.mutate({ id: request.id, data: { status: 'REJECTED', notes } }, { onSuccess: () => onClose() })
        } else if (isEditing) {
            updateMutation.mutate({ id: request.id, data: { status, notes } }, { onSuccess: () => onClose() })
        }
    }

    const isPending = updateMutation.isPending

    let title = 'Action sur la demande'
    let desc = ''
    if (isAccepting) {
        title = 'Accepter la demande'
        desc = request?.assetCategory === 'MAINTENANCE'
            ? "Validez la demande. Un ticket de maintenance sera créé automatiquement pour l'équipement concerné."
            : "Validez la demande. L'affectation du matériel se fera ensuite dans l'onglet Affectations."
    } else if (isRejecting) {
        title = 'Refuser la demande'
        desc = 'Rejetez la demande avec un motif clair.'
    } else if (isEditing) {
        title = "Modifier l'état"
        desc = "Changez manuellement l'état de la demande ou ajoutez une note."
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} description={desc}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {isEditing && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Statut</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        >
                            <option value="PENDING">En attente</option>
                            <option value="ASSIGNED">Acceptée</option>
                            <option value="RESOLVED">Résolue</option>
                            <option value="REJECTED">Refusée</option>
                            <option value="CANCELLED">Annulée</option>
                        </select>
                    </div>
                )}

                {(isAccepting || isRejecting || isEditing) && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            {isRejecting ? 'Motif du refus' : isAccepting ? 'Notes facultatives' : 'Notes'}
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            required={isRejecting}
                            rows={3}
                            className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                            placeholder={isRejecting ? 'Expliquez pourquoi la demande est refusée...' : 'Ajouter une note...'}
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
                        disabled={isPending || (isRejecting && !notes)}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
                        Confirmer
                    </button>
                </div>
            </form>
        </Modal>
    )
}
