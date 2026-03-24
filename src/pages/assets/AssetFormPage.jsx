import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '@/lib/api/client.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ASSET_CATEGORIES, ASSET_STATUSES, STRUCTURES } from '@/lib/constants.js'

const schema = z.object({
    category: z.string().min(1, 'Requis'),
    brand: z.string().min(2, 'Trop court'),
    model: z.string().min(2, 'Trop court'),
    serialNumber: z.string().min(4, 'Trop court'),
    status: z.string().min(1, 'Requis'),
    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
    supplier: z.string().min(2, 'Trop court'),
    purchasePrice: z.number().min(0, 'La valeur doit être positive'),
    inventoryNumber: z.string().optional(),
    affectation: z.string().optional(),
    bureau: z.string().optional(),
    etage: z.string().optional(),
    notes: z.string().optional()
})

export default function AssetFormPage() {
    const { id } = useParams()
    const isEditing = Boolean(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: assetRes, isLoading: isLoadingAsset } = useQuery({
        queryKey: ['asset', id],
        queryFn: () => api.get(`/assets/${id}`),
        enabled: isEditing
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            condition: 'GOOD',
            status: 'IN_STOCK'
        }
    })

    useEffect(() => {
        if (isEditing && assetRes?.data) {
            reset(assetRes.data)
        }
    }, [isEditing, assetRes, reset])

    const mutation = useMutation({
        mutationFn: (data) => isEditing ? api.put(`/assets/${id}`, data) : api.post('/assets', data),
        onSuccess: (res) => {
            toast.success(isEditing ? 'Actif modifié' : 'Actif créé')
            queryClient.invalidateQueries({ queryKey: ['assets'] })
            navigate(isEditing ? `/assets/${id}` : '/assets')
        },
        onError: () => toast.error('Une erreur est survenue')
    })

    const onSubmit = (data) => mutation.mutate(data)

    if (isEditing && isLoadingAsset) return <div className="p-6 max-w-3xl mx-auto">Chargement...</div>

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 text-sm mb-2 text-[var(--color-muted)]">
                <button onClick={() => navigate('/assets')} className="hover:text-[var(--color-text)] flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Retour
                </button>
            </div>

            <div>
                <h1 className="text-2xl font-display font-bold">{isEditing ? 'Modifier l\'actif' : 'Nouvel actif'}</h1>
                <p className="text-[var(--color-muted)]">Remplissez les informations de l'équipement</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Catégorie *</label>
                        <select {...register('category')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green">
                            <option value="">Sélectionnez...</option>
                            {ASSET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Statut *</label>
                        <select {...register('status')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green">
                            {ASSET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Marque *</label>
                        <input type="text" {...register('brand')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Modèle *</label>
                        <input type="text" {...register('model')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Numéro de série *</label>
                        <input type="text" {...register('serialNumber')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">État *</label>
                        <select {...register('condition')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green">
                            <option value="EXCELLENT">Excellent (Neuf)</option>
                            <option value="GOOD">Bon</option>
                            <option value="FAIR">Passable</option>
                            <option value="POOR">Mauvais</option>
                        </select>
                        {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Fournisseur *</label>
                        <input type="text" {...register('supplier')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Prix d'achat (DZD) *</label>
                        <input type="number" {...register('purchasePrice', { valueAsNumber: true })} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice.message}</p>}
                    </div>
                </div>

                {/* Sonatrach-specific fields */}
                <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">Informations Sonatrach</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">N° d'inventaire</label>
                            <input type="text" {...register('inventoryNumber')} placeholder="INV-PC-0001" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Affectation / Structure</label>
                            <select {...register('affectation')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green">
                                <option value="">Sélectionnez une structure...</option>
                                {STRUCTURES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">N° Bureau</label>
                            <input type="text" {...register('bureau')} placeholder="Ex: 449, 351" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Étage</label>
                            <input type="text" {...register('etage')} placeholder="Ex: 5ème, RDC" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">Notes additionnelles</label>
                    <textarea {...register('notes')} rows={3} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg)] rounded-md text-sm font-medium transition-colors mr-3 btn-press"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-md text-sm font-medium transition-colors disabled:opacity-70 btn-press"
                    >
                        {mutation.isPending ? 'Enregistrement...' : <><Save className="w-4 h-4" /> {isEditing ? 'Mettre à jour' : 'Enregistrer'}</>}
                    </button>
                </div>
            </form>
        </div>
    )
}
