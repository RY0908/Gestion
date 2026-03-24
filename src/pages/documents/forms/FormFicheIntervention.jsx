import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { FormField } from '@/components/forms/FormField.jsx'
import { FormTextarea } from '@/components/forms/FormTextarea.jsx'
import { FormDatePicker } from '@/components/forms/FormDatePicker.jsx'
import { FormRadioGroup } from '@/components/forms/FormRadioGroup.jsx'
import { FormCheckbox } from '@/components/forms/FormCheckbox.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'

const schema = yup.object({
    nomTechnicien: yup.string().required('Le nom du technicien est obligatoire'),
    matriculeTechnicien: yup.string().required('Le matricule est obligatoire'),
    designation: yup.string().required('La désignation est obligatoire'),
    descriptionTravaux: yup.string().required('La description des travaux est obligatoire'),
    resultat: yup.string().required('Le résultat est obligatoire'),
})

const DRAFT_KEY = 'draft_fiche_intervention'
const generateNumero = () => `FIT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormFicheIntervention() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [typeIntervention, setTypeIntervention] = useState({ reparation: false, remplacement: false, configuration: false, installation: false, autre: false })
    const [autreType, setAutreType] = useState('')
    const [pieces, setPieces] = useState([{ designation: '', reference: '', quantite: 1, numSerieRemplace: '' }])

    const now = new Date()
    const { register, handleSubmit, formState: { errors }, watch, getValues, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: now.toISOString().split('T')[0],
            heureDebut: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            heureFin: '',
            numeroDemande: '',
            nomTechnicien: user?.fullName || '',
            matriculeTechnicien: '',
            service: 'Support Informatique (Helpdesk)',
            designation: '',
            numSerie: '',
            numInventaire: '',
            descriptionTravaux: '',
            resultat: '',
            observations: '',
        }
    })

    const heureDebut = watch('heureDebut')
    const heureFin = watch('heureFin')
    const duree = (() => {
        if (!heureDebut || !heureFin) return ''
        const [h1, m1] = heureDebut.split(':').map(Number)
        const [h2, m2] = heureFin.split(':').map(Number)
        const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
        if (diff <= 0) return ''
        const hours = Math.floor(diff / 60)
        const mins = diff % 60
        return `${hours}h${mins > 0 ? String(mins).padStart(2, '0') : ''}`
    })()

    // ── Draft ────────────────────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) { try { const d = JSON.parse(saved); if (d.formData) reset(d.formData); if (d.pieces) setPieces(d.pieces); if (d.typeIntervention) setTypeIntervention(d.typeIntervention) } catch { } }
    }, [reset])

    const saveDraft = useCallback(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: watch(), pieces, typeIntervention, savedAt: Date.now() }))
    }, [watch, pieces, typeIntervention])

    useEffect(() => { const i = setInterval(saveDraft, 30000); return () => clearInterval(i) }, [saveDraft])

    // ── Table handlers ───────────────────────────────────────────────
    const addPiece = () => setPieces(prev => [...prev, { designation: '', reference: '', quantite: 1, numSerieRemplace: '' }])
    const removePiece = (idx) => setPieces(prev => prev.filter((_, i) => i !== idx))
    const updatePiece = (idx, key, val) => setPieces(prev => prev.map((row, i) => i === idx ? { ...row, [key]: val } : row))

    const pieceColumns = [
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'reference', label: 'Référence' },
        { key: 'quantite', label: 'Qté', type: 'number', min: 1, required: true, align: 'right' },
        { key: 'numSerieRemplace', label: 'N° Série remplacé' },
    ]

    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        const typeStr = Object.entries(typeIntervention).filter(([, v]) => v).map(([k]) => k === 'autre' ? `Autre: ${autreType}` : k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
        setPrintData({
            numero, numeroDemande: fd.numeroDemande, date: fd.date, heureDebut: fd.heureDebut, heureFin: fd.heureFin, duree,
            technicien: { nom: fd.nomTechnicien, matricule: fd.matriculeTechnicien, service: fd.service },
            materiel: { designation: fd.designation, numSerie: fd.numSerie, numInventaire: fd.numInventaire },
            typeIntervention: typeStr, descriptionTravaux: fd.descriptionTravaux,
            composants: pieces.filter(p => p.designation), resultat: fd.resultat, observations: fd.observations,
        })
        setShowPreview(true)
        localStorage.removeItem(DRAFT_KEY)
    }

    if (showPreview) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-4">
                <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour au formulaire
                </button>
                <PrintManager documentType="FICHE_INTERV" data={printData} />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" />
                </button>
                <PageHeader title="Fiche d'Intervention" description={`${numero} — ${now.toLocaleDateString('fr-FR')}`} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="N° Fiche" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormField label="Liée à DI N°" name="numeroDemande" register={register} errors={errors} placeholder="DI-2025-XXXX" />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Heure début" name="heureDebut" type="time" register={register} errors={errors} required />
                        <FormField label="Heure fin" name="heureFin" type="time" register={register} errors={errors} />
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[var(--color-text)]">Durée</label>
                            <div className="h-9 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center text-sm font-medium text-sonatrach-green">
                                {duree || '–'}
                            </div>
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Technicien">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Nom" name="nomTechnicien" register={register} errors={errors} required />
                        <FormField label="Matricule" name="matriculeTechnicien" register={register} errors={errors} required />
                        <FormField label="Service" name="service" register={register} errors={errors} disabled />
                    </div>
                </FormSection>

                <FormSection title="Matériel">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Désignation" name="designation" register={register} errors={errors} required />
                        <FormField label="N° Série" name="numSerie" register={register} errors={errors} />
                        <FormField label="N° Inventaire" name="numInventaire" register={register} errors={errors} />
                    </div>
                </FormSection>

                <FormSection title="Intervention">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Type d'intervention <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-3">
                            {['reparation', 'remplacement', 'configuration', 'installation', 'autre'].map(key => (
                                <label key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm cursor-pointer hover:border-sonatrach-green/40 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={typeIntervention[key]}
                                        onChange={(e) => setTypeIntervention(prev => ({ ...prev, [key]: e.target.checked }))}
                                        className="w-4 h-4 rounded border-[var(--color-border)] text-sonatrach-green focus:ring-sonatrach-green/20"
                                    />
                                    {key === 'autre' ? 'Autre' : key.charAt(0).toUpperCase() + key.slice(1)}
                                </label>
                            ))}
                        </div>
                        {typeIntervention.autre && (
                            <input
                                type="text"
                                value={autreType}
                                onChange={(e) => setAutreType(e.target.value)}
                                placeholder="Précisez..."
                                className="mt-2 w-full h-9 px-3 rounded-lg border border-[var(--color-border)] text-sm bg-transparent outline-none focus:border-sonatrach-green/50"
                            />
                        )}
                    </div>
                    <FormTextarea label="Description des travaux" name="descriptionTravaux" register={register} errors={errors} required rows={6} />
                </FormSection>

                <FormSection title="Pièces Utilisées">
                    <DynamicTable columns={pieceColumns} rows={pieces} onAddRow={addPiece} onRemoveRow={removePiece} onCellChange={updatePiece} minRows={0} />
                </FormSection>

                <FormSection title="Résultat">
                    <FormRadioGroup
                        label="Résultat"
                        name="resultat"
                        register={register}
                        errors={errors}
                        required
                        options={[
                            { value: 'Résolu', label: 'Résolu' },
                            { value: 'En cours', label: 'En cours' },
                            { value: 'Réparation externe', label: 'Nécessite réparation externe' },
                            { value: 'Réformé', label: 'Matériel à réformer' },
                        ]}
                    />
                    <FormTextarea label="Observations / Recommandations" name="observations" register={register} errors={errors} rows={3} />
                </FormSection>

                {/* Sticky action bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-end gap-3 z-30 shadow-lg">
                    <button type="button" onClick={() => navigate('/documents')} className="px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">Annuler</button>
                    <button type="button" onClick={saveDraft} className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg)] transition-colors">
                        <Save className="w-4 h-4" /> Brouillon
                    </button>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg font-medium transition-colors btn-press">
                        <Eye className="w-4 h-4" /> Aperçu & Imprimer
                    </button>
                </div>
            </form>
        </div>
    )
}
