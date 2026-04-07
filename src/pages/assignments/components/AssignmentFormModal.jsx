import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateAssignment } from '@/hooks/useAssignments.js'
import { useAssets } from '@/hooks/useAssets.js'
import { useUsers } from '@/hooks/useUsers.js'

export function AssignmentFormModal({ isOpen, onClose }) {
    const createMutation = useCreateAssignment()
    const { data: assetsRes, isLoading: isLoadingAssets } = useAssets({ status: 'IN_STOCK' })
    const { data: usersRes, isLoading: isLoadingUsers } = useUsers({})

    const availableAssets = assetsRes?.data || []
    const users = usersRes?.data || []

    const [assetId, setAssetId] = useState('')
    const [userId, setUserId] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!assetId || !userId) return

        createMutation.mutate(
            { assetId, assignedToId: userId, notes },
            {
                onSuccess: () => {
                    setAssetId('')
                    setUserId('')
                    setNotes('')
                    onClose()
                }
            }
        )
    }

    const isPending = createMutation.isPending || isLoadingAssets || isLoadingUsers

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouvelle affectation"
            description="Assignez un équipement disponible à un utilisateur du système."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Équipement (Disponible) <span className="text-red-500">*</span></label>
                    <select
                        value={assetId}
                        onChange={e => setAssetId(e.target.value)}
                        required
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        disabled={isLoadingAssets}
                    >
                        <option value="">Sélectionnez un appareil...</option>
                        {availableAssets.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.assetTag} - {a.brand} {a.model} ({a.category})
                            </option>
                        ))}
                    </select>
                    {availableAssets.length === 0 && !isLoadingAssets && (
                        <p className="text-xs text-yellow-600 mt-1">⚠️ Aucun équipement "Disponible" n'a été trouvé.</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Utilisateur / Assigné à <span className="text-red-500">*</span></label>
                    <select
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        required
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        disabled={isLoadingUsers}
                    >
                        <option value="">Sélectionnez un employé...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.fullName} {u.department ? `— ${u.department.name}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Notes (Optionnel)</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                        placeholder="Raison de l'affectation, état au moment de la remise..."
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
                        disabled={isPending || !assetId || !userId}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {createMutation.isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
                        Définir l'affectation
                    </button>
                </div>
            </form>
        </Modal>
    )
}
