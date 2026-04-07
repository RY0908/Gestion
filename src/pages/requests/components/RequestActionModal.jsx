import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useAssignRequest, useResolveRequest, useUpdateRequest } from '@/hooks/useRequests.js'
import { useUsers } from '@/hooks/useUsers.js'

export function RequestActionModal({ isOpen, onClose, request, actionType }) {
    const isAssigning = actionType === 'assign'
    const isEditing = actionType === 'edit'
    
    const assignMutation = useAssignRequest()
    const resolveMutation = useResolveRequest()
    const updateMutation = useUpdateRequest()

    const { data: usersRes, isLoading: isLoadingUsers } = useUsers({})
    const users = usersRes?.data?.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN') || []

    const [techId, setTechId] = useState('')
    const [notes, setNotes] = useState('')
    const [status, setStatus] = useState('PENDING')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (actionType === 'assign') {
            assignMutation.mutate({ id: request.id, data: { assignedToId: techId, status: 'ASSIGNED' } }, {
                onSuccess: () => { setTechId(''); onClose() }
            })
        } else if (actionType === 'resolve') {
            resolveMutation.mutate({ id: request.id, data: { status: 'RESOLVED', notes } }, {
                onSuccess: () => { setNotes(''); onClose() }
            })
        } else if (actionType === 'edit') {
            updateMutation.mutate({ id: request.id, data: { status, notes } }, {
                onSuccess: () => onClose()
            })
        }
    }

    const isPending = assignMutation.isPending || resolveMutation.isPending || updateMutation.isPending

    let title = "Action sur la demande"
    let desc = ""
    if (isAssigning) {
        title = "Assigner la demande"
        desc = "Choisissez un technicien pour prendre en charge cette demande."
    } else if (actionType === 'resolve') {
        title = "Clôturer la demande"
        desc = "Marquez la demande comme résolue (matériel livré, logiciel installé, etc)."
    } else if (isEditing) {
        title = "Modifier l'état"
        desc = "Changez manuellement l'état de la demande ou ajoutez une note."
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} description={desc}>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {isAssigning && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Technicien <span className="text-red-500">*</span></label>
                        <select
                            value={techId}
                            onChange={e => setTechId(e.target.value)}
                            required
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            disabled={isLoadingUsers}
                        >
                            <option value="">Sélectionnez un technicien...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.fullName}
                                </option>
                            ))}
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
                            <option value="PENDING">En attente (Pending)</option>
                            <option value="APPROVED">Approuvée</option>
                            <option value="ASSIGNED">Assignée</option>
                            <option value="RESOLVED">Résolue</option>
                            <option value="REJECTED">Rejetée</option>
                            <option value="CANCELLED">Annulée</option>
                        </select>
                    </div>
                )}

                {(actionType === 'resolve' || isEditing) && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Notes / Motif de résolution</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            required={actionType === 'resolve'}
                            rows={3}
                            className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                            placeholder="Détails de clôture ou motif de rejet..."
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
                        disabled={isPending || (isAssigning && !techId) || (actionType === 'resolve' && !notes)}
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
