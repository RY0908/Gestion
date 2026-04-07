import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateLicense, useUpdateLicense } from '@/hooks/useLicenses.js'

export function LicenseFormModal({ isOpen, onClose, license }) {
    const isEditing = !!license
    const createMutation = useCreateLicense()
    const updateMutation = useUpdateLicense()

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            softwareName: '',
            vendor: '',
            licenseKey: '',
            totalSeats: 1,
            cost: 0,
            expiryDate: '',
        }
    })

    // Update form when editing
    useEffect(() => {
        if (isOpen) {
            if (isEditing && license) {
                reset({
                    softwareName: license.softwareName || '',
                    vendor: license.vendor || '',
                    licenseKey: license.licenseKey || '',
                    totalSeats: license.totalSeats || 1,
                    cost: license.cost || 0,
                    // format date for input type="date"
                    expiryDate: license.expiryDate ? new Date(license.expiryDate).toISOString().split('T')[0] : '',
                })
            } else {
                reset({
                    softwareName: '',
                    vendor: '',
                    licenseKey: '',
                    totalSeats: 1,
                    cost: 0,
                    expiryDate: '',
                })
            }
        }
    }, [isOpen, isEditing, license, reset])

    const onSubmit = (data) => {
        // format numbers and handle empty dates correctly
        const payload = {
            ...data,
            totalSeats: parseInt(data.totalSeats, 10),
            cost: parseFloat(data.cost),
            expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : null,
        }

        if (isEditing) {
            updateMutation.mutate({ id: license.id, data: payload }, {
                onSuccess: () => onClose()
            })
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => onClose()
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier la licence' : 'Nouvelle licence'}
            description={isEditing ? 'Mettez à jour les détails de l\'abonnement logiciel.' : 'Enregistrez un nouveau logiciel ou abonnement.'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Logiciel <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            {...register('softwareName', { required: 'Ce champ est requis' })}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="Ex: Microsoft Office 365"
                        />
                        {errors.softwareName && <p className="text-xs text-red-500">{errors.softwareName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Éditeur / Vendeur</label>
                        <input
                            type="text"
                            {...register('vendor')}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="Ex: Microsoft Corp."
                        />
                    </div>
                </div>

                <div className="space-y-1 block">
                    <label className="text-sm font-medium">Clé de licence</label>
                    <input
                        type="text"
                        {...register('licenseKey')}
                        className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-mono outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Nombre de postes</label>
                        <input
                            type="number"
                            min="1"
                            {...register('totalSeats', { required: true, min: 1 })}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Coût Total</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register('cost')}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="Ex: 50000"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Date d'expiration</label>
                        <input
                            type="date"
                            {...register('expiryDate')}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        />
                    </div>
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
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
                        {isEditing ? 'Enregistrer les modifications' : 'Créer la licence'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
