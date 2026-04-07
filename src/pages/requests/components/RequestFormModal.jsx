import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateRequest } from '@/hooks/useRequests.js'
import { useAuthStore } from '@/store/authStore.js'

const CATEGORIES = [
    { value: 'PC', label: 'PC Fixe / Unité Centrale' },
    { value: 'LAPTOP', label: 'Ordinateur Portable' },
    { value: 'PRINTER', label: 'Imprimante / Scanner' },
    { value: 'NETWORK', label: 'Équipement Réseau (Routeur, Switch)' },
    { value: 'ACCESSORY', label: 'Accessoire (Clavier, Souris, Casque)' },
    { value: 'SOFTWARE', label: 'Licence Logiciel' },
    { value: 'OTHER', label: 'Autre' }
]

export function RequestFormModal({ isOpen, onClose }) {
    const createMutation = useCreateRequest()
    const { user } = useAuthStore()

    const [category, setCategory] = useState('LAPTOP')
    const [priority, setPriority] = useState('MEDIUM')
    const [reason, setReason] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        
        createMutation.mutate({
            requestedById: user.id, // Current user is making the request
            assetCategory: category,
            priority,
            reason
        }, {
            onSuccess: () => {
                setReason('')
                onClose()
            }
        })
    }

    const isPending = createMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouvelle demande"
            description="Soumettez une demande pour un nouvel équipement ou logiciel."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Type d'équipement <span className="text-red-500">*</span></label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Priorité</label>
                    <select
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                    >
                        <option value="LOW">Basse — Pas d'urgence</option>
                        <option value="MEDIUM">Moyenne — Standard</option>
                        <option value="HIGH">Haute — Bloquant pour mon travail</option>
                        <option value="URGENT">Urgente — Panne totale / Critique</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Justification professionnelle <span className="text-red-500">*</span></label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                        rows={4}
                        className="w-full form-input py-2 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20 resize-none"
                        placeholder="Veuillez détailler pourquoi vous avez besoin de cet équipement..."
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
                        disabled={isPending || !reason}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
                        Soumettre la demande
                    </button>
                </div>
            </form>
        </Modal>
    )
}
