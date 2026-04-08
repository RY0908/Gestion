import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '@/lib/api/client.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ASSET_CATEGORIES, ASSET_STATUSES, STRUCTURES } from '@/lib/constants.js'
import { compactSpecifications, getAssetSpecificationFields } from '@/lib/specifications.js'
import { useHydratedFormDefaults } from '@/hooks/useHydratedFormDefaults.js'

const schema = z.object({
    category: z.string().min(1, 'Requis'),
    brand: z.string().min(2, 'Trop court'),
    model: z.string().min(2, 'Trop court'),
    serialNumber: z.string().min(4, 'Trop court'),
    status: z.string().min(1, 'Requis'),
    condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']),
    supplier: z.string().min(2, 'Trop court'),
    purchasePrice: z.number().min(0, 'La valeur doit être positive'),
    currentValue: z.number().min(0, 'La valeur doit être positive').optional(),
    assetTag: z.string().min(1, 'Requis'),
    acquisitionDate: z.string().optional(),
    warrantyDate: z.string().optional(),
    invoiceNumber: z.string().optional(),
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

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            condition: 'NEW',
            status: 'IN_STOCK',
            purchasePrice: 0,
            currentValue: 0,
            specifications: {},
        }
    })
    const selectedCategory = useWatch({ control, name: 'category' })
    const specificationFields = getAssetSpecificationFields(selectedCategory)

    useHydratedFormDefaults({
        enabled: isEditing && Boolean(assetRes?.data),
        reset,
        signature: assetRes?.data?.id || id || 'asset',
        values: isEditing && assetRes?.data ? (() => {
            const d = assetRes.data
            return {
                ...d,
                assetTag: d.assetTag || d.inventoryNumber,
                acquisitionDate: d.acquisitionDate ? new Date(d.acquisitionDate).toISOString().split('T')[0] : '',
                warrantyDate: d.warrantyDate ? new Date(d.warrantyDate).toISOString().split('T')[0] : '',
                specifications: d.specifications || {},
            }
        })() : null,
    })

    const mutation = useMutation({
        mutationFn: (data) => {
            // Optimize info flow: Consolidate location info
            const locationParts = []
            if (data.affectation) locationParts.push(data.affectation)
            if (data.bureau) locationParts.push(`Bureau ${data.bureau}`)
            if (data.etage) locationParts.push(data.etage)
            
            const payload = {
                ...data,
                location: locationParts.join(' - ') || 'Non localisé',
                // Ensure field names match backend expectation
                assetTag: data.assetTag,
                specifications: compactSpecifications(data.specifications || {}),
            }

            return isEditing ? api.put(`/assets/${id}`, payload) : api.post('/assets', payload)
        },
        onSuccess: (res) => {
            toast.success(isEditing ? 'Actif modifié' : 'Actif créé')
            // Invalidate everything related to assets to ensure fresh data everywhere
            queryClient.invalidateQueries({ queryKey: ['assets'] })
            if (isEditing) {
                queryClient.invalidateQueries({ queryKey: ['asset', id] })
            }
            navigate(isEditing ? `/assets/${id}` : '/assets')
        },
        onError: (err) => {
            console.error(err)
            toast.error(err.message || 'Une erreur est survenue')
        }
    })

    const onSubmit = (data) => mutation.mutate(data)

    if (isEditing && isLoadingAsset) return <div className="p-6 max-w-3xl mx-auto">Chargement...</div>

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6 pb-20">
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
                {/* Section 1: Informations de Base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1.5 font-semibold text-sonatrach-green">Code d'inventaire (Tag) *</label>
                        <input 
                            type="text" 
                            {...register('assetTag')} 
                            placeholder="Ex: INV-PC-2024-001"
                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green font-mono" 
                        />
                        {errors.assetTag && <p className="text-red-500 text-xs mt-1">{errors.assetTag.message}</p>}
                    </div>

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
                        <label className="block text-sm font-medium mb-1.5">État physique *</label>
                        <select {...register('condition')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green">
                            <option value="NEW">Neuf</option>
                            <option value="GOOD">Bon</option>
                            <option value="FAIR">Passable</option>
                            <option value="POOR">Mauvais</option>
                        </select>
                        {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
                    </div>
                </div>

                {/* Section 2: Acquisition & Finances */}
                <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">Acquisition & Valeur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Fournisseur</label>
                            <input type="text" {...register('supplier')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">N° Facture</label>
                            <input type="text" {...register('invoiceNumber')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Date d'acquisition</label>
                            <input type="date" {...register('acquisitionDate')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Date fin de garantie</label>
                            <input type="date" {...register('warrantyDate')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Prix d'achat (DZD)</label>
                            <input type="number" {...register('purchasePrice', { valueAsNumber: true })} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Valeur actuelle (DZD)</label>
                            <input type="number" {...register('currentValue', { valueAsNumber: true })} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Sonatrach-specific fields */}
                <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">Localisation & Affectation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
                        Spécifications selon la catégorie
                    </h3>
                    {!selectedCategory ? (
                        <p className="text-sm text-[var(--color-muted)]">Choisissez d’abord une catégorie pour afficher les champs spécifiques.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {specificationFields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        min={field.min}
                                        placeholder={field.placeholder}
                                        {...register(`specifications.${field.key}`)}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-sonatrach-green"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
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
