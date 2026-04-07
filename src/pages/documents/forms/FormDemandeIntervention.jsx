import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { FormField } from '@/components/forms/FormField.jsx'
import { FormSelect } from '@/components/forms/FormSelect.jsx'
import { FormTextarea } from '@/components/forms/FormTextarea.jsx'
import { FormDatePicker } from '@/components/forms/FormDatePicker.jsx'
import { FormRadioGroup } from '@/components/forms/FormRadioGroup.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'
import { cn } from '@/lib/utils.js'
import { useDocumentPrefill } from '@/hooks/useDocumentPrefill.js'

const DIRECTIONS = [
    { value: 'SPE', label: 'SPE – Stratégie, Planification & Économie' },
    { value: 'FIN', label: 'FIN – Finances' },
    { value: 'RHU', label: 'RHU – Ressources Humaines' },
    { value: 'BDM', label: 'BDM – Business Développement Marketing' },
    { value: 'ACT', label: 'ACT – Activités Centrales' },
    { value: 'JUR', label: 'JUR – Juridique' },
    { value: 'ISI', label: 'ISI – Informatique & Système d\'Information' },
    { value: 'MLG', label: 'MLG – Marchés et Logistique' },
    { value: 'HSE', label: 'HSE – Santé, Sécurité & Environnement' },
    { value: 'RDT', label: 'RDT – Recherche & Développement' },
]

const schema = yup.object({
    nom: yup.string().required('Le nom est obligatoire'),
    matricule: yup.string().required('Le matricule est obligatoire').min(6, 'Min 6 caractères'),
    direction: yup.string().required('La direction est obligatoire'),
    bureau: yup.string().required('Le bureau est obligatoire'),
    telephone: yup.string().required('Le téléphone est obligatoire'),
    designation: yup.string().required('La désignation est obligatoire'),
    localisation: yup.string().required('La localisation est obligatoire'),
    descriptionPanne: yup.string().required('La description est obligatoire'),
    urgence: yup.string().required("Le degré d'urgence est requis"),
})

const DRAFT_KEY = 'draft_demande_intervention'
const generateNumero = () => `DI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormDemandeIntervention() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)

    const { defaults } = useDocumentPrefill('DEMANDE_INTERV')

    const now = new Date()
    const { register, handleSubmit, formState: { errors }, watch, getValues, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: defaults.date || now.toISOString().split('T')[0],
            heure: defaults.heure || `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
            nom: defaults.nom || user?.fullName || '',
            matricule: defaults.matricule || '',
            direction: defaults.direction || '',
            bureau: '',
            telephone: defaults.telephone || '',
            designation: '',
            marque: '',
            numSerie: '',
            numInventaire: '',
            localisation: '',
            descriptionPanne: '',
            urgence: 'Normal',
            historique: 'Non',
        }
    })

    // ── Auto-save draft ──────────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) { try { const d = JSON.parse(saved); if (d.formData) reset(d.formData) } catch { } }
    }, [reset])

    const saveDraft = useCallback(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: watch(), savedAt: Date.now() }))
    }, [watch])

    useEffect(() => {
        const i = setInterval(saveDraft, 30000)
        return () => clearInterval(i)
    }, [saveDraft])

    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        setPrintData({
            numero, date: fd.date, heure: fd.heure,
            demandeur: { nom: fd.nom, matricule: fd.matricule, direction: fd.direction, bureau: fd.bureau, telephone: fd.telephone },
            materiel: { designation: fd.designation, marque: fd.marque, numSerie: fd.numSerie, numInventaire: fd.numInventaire, localisation: fd.localisation },
            descriptionPanne: fd.descriptionPanne, urgence: fd.urgence, historique: fd.historique === 'Oui',
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
                <PrintManager documentType="DEMANDE_INTERV" data={printData} />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" />
                </button>
                <PageHeader title="Demande d'Intervention" description={`${numero} — ${now.toLocaleDateString('fr-FR')}`} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="N° Demande" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} disabled />
                        <FormField label="Heure" name="heure" type="time" register={register} errors={errors} />
                    </div>
                </FormSection>

                <FormSection title="Demandeur">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nom" name="nom" register={register} errors={errors} required />
                        <FormField label="Matricule" name="matricule" register={register} errors={errors} required />
                        <FormSelect label="Direction" name="direction" register={register} errors={errors} required options={DIRECTIONS} placeholder="Sélectionner" />
                        <FormField label="Bureau N°" name="bureau" register={register} errors={errors} required />
                        <FormField label="Téléphone" name="telephone" type="tel" register={register} errors={errors} required placeholder="0XX XX XX XX" />
                    </div>
                </FormSection>

                <FormSection title="Matériel Concerné">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Désignation" name="designation" register={register} errors={errors} required />
                        <FormField label="Marque" name="marque" register={register} errors={errors} />
                        <FormField label="N° Série" name="numSerie" register={register} errors={errors} />
                        <FormField label="N° Inventaire" name="numInventaire" register={register} errors={errors} />
                        <FormField label="Localisation" name="localisation" register={register} errors={errors} required placeholder="ex: Bureau 3A, Bâtiment Principal" className="md:col-span-2" />
                    </div>
                </FormSection>

                <FormSection title="Description de la Panne">
                    <FormTextarea label="Description" name="descriptionPanne" register={register} errors={errors} required rows={5} placeholder="Décrivez le problème observé..." />
                    <FormRadioGroup
                        label="Degré d'urgence"
                        name="urgence"
                        register={register}
                        errors={errors}
                        required
                        options={[
                            { value: 'Critique', label: 'Critique', icon: '🔴' },
                            { value: 'Urgent', label: 'Urgent', icon: '🟠' },
                            { value: 'Normal', label: 'Normal', icon: '🟢' },
                        ]}
                    />
                    <FormRadioGroup
                        label="Historique pannes"
                        name="historique"
                        register={register}
                        errors={errors}
                        options={[
                            { value: 'Oui', label: 'Oui' },
                            { value: 'Non', label: 'Non' },
                        ]}
                    />
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
