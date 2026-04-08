import { useState } from 'react'
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
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'

import { useDocumentPrefill } from '@/hooks/useDocumentPrefill.js'
import { useDraftAutosave } from '@/hooks/useDraftAutosave.js'
import { useHydratedFormDefaults } from '@/hooks/useHydratedFormDefaults.js'

const DIRECTIONS = [
    { value: 'SPE', label: 'SPE' }, { value: 'FIN', label: 'FIN' }, { value: 'RHU', label: 'RHU' },
    { value: 'BDM', label: 'BDM' }, { value: 'ACT', label: 'ACT' }, { value: 'JUR', label: 'JUR' },
    { value: 'ISI', label: 'ISI' }, { value: 'MLG', label: 'MLG' }, { value: 'HSE', label: 'HSE' }, { value: 'RDT', label: 'RDT' },
]

const schema = yup.object({
    nom: yup.string().required('Le nom est obligatoire'),
    prenom: yup.string().required('Le prénom est obligatoire'),
    matricule: yup.string().required('Le matricule est obligatoire').min(6, 'Min 6 caractères'),
    direction: yup.string().required('La direction est obligatoire'),
    structure: yup.string().required('La structure est obligatoire'),
    poste: yup.string().required('Le poste est obligatoire'),
})

const DRAFT_KEY = 'draft_demande_materiel'
const generateNumero = () => `DM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormDemandeMateriel() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [articles, setArticles] = useState([{ designation: '', quantite: 1, motif: '' }])

    const { defaults } = useDocumentPrefill('DEMANDE_MATERIEL')

    const { register, handleSubmit, formState: { errors }, watch, reset, getValues } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: defaults.date || new Date().toISOString().split('T')[0],
            nom: defaults.nom || '',
            prenom: defaults.prenom || '',
            matricule: defaults.matricule || '',
            direction: defaults.direction || '',
            structure: defaults.structure || '',
            poste: user?.position || '',
            telephone: defaults.telephone || '',
            observations: '', urgence: 'Normal',
        }
    })

    useHydratedFormDefaults({
        enabled: Boolean(user),
        reset,
        signature: `DEMANDE_MATERIEL-${user?.id || 'guest'}`,
        values: {
            date: defaults.date || new Date().toISOString().split('T')[0],
            nom: defaults.nom || '',
            prenom: defaults.prenom || '',
            matricule: defaults.matricule || '',
            direction: defaults.direction || '',
            structure: defaults.structure || '',
            poste: user?.position || '',
            telephone: defaults.telephone || '',
            observations: '',
            urgence: 'Normal',
        },
    })

    const saveDraft = useDraftAutosave({
        draftKey: DRAFT_KEY,
        watch,
        reset,
        onLoadDraft: (draft, resetFn) => {
            if (draft?.formData) resetFn(draft.formData)
            if (draft?.articles) setArticles(draft.articles)
        },
        buildDraft: (formData) => ({ formData, articles }),
    })

    const updateCell = (idx, key, val) => setArticles(prev => prev.map((row, i) => i === idx ? { ...row, [key]: val } : row))
    const addRow = () => setArticles(prev => [...prev, { designation: '', quantite: 1, motif: '' }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))

    const cols = [
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'quantite', label: 'Quantité', type: 'number', min: 1, required: true, align: 'right' },
        { key: 'motif', label: 'Motif', required: true },
    ]

    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        setPrintData({
            numero, date: fd.date,
            demandeur: { nom: fd.nom, prenom: fd.prenom, matricule: fd.matricule, direction: fd.direction, structure: fd.structure, poste: fd.poste, telephone: fd.telephone },
            articles, observations: fd.observations, urgence: fd.urgence,
        })
        setShowPreview(true)
        localStorage.removeItem(DRAFT_KEY)
    }


    if (showPreview) return (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
            <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"><ArrowLeft className="w-4 h-4" /> Retour</button>
            <PrintManager documentType="DEMANDE_MATERIEL" data={printData} />
        </div>
    )

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Demande de Matériel" description={`${numero} — ${new Date().toLocaleDateString('fr-FR')}`} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Informations de la Demande">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="N° Demande" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} disabled />
                    </div>
                </FormSection>
                <FormSection title="Informations Demandeur">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nom" name="nom" register={register} errors={errors} required />
                        <FormField label="Prénom" name="prenom" register={register} errors={errors} required />
                        <FormField label="Matricule" name="matricule" register={register} errors={errors} required />
                        <FormSelect label="Direction" name="direction" register={register} errors={errors} required options={DIRECTIONS} placeholder="Sélectionner" />
                        <FormField label="Structure" name="structure" register={register} errors={errors} required placeholder="ex: DC-ISI/TI/Helpdesk" />
                        <FormField label="Poste" name="poste" register={register} errors={errors} required />
                        <FormField label="Téléphone" name="telephone" type="tel" register={register} errors={errors} placeholder="0XX XX XX XX" />
                    </div>
                </FormSection>
                <FormSection title="Articles Demandés">
                    <DynamicTable columns={cols} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                </FormSection>
                <FormSection title="Informations Complémentaires">
                    <FormTextarea label="Observations" name="observations" register={register} errors={errors} rows={4} />
                    <FormRadioGroup label="Degré d'urgence" name="urgence" register={register} errors={errors} options={[
                        { value: 'Urgent', label: 'Urgent' }, { value: 'Normal', label: 'Normal' }, { value: 'Différable', label: 'Différable' },
                    ]} />
                </FormSection>
                <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-end gap-3 z-30 shadow-lg">
                    <button type="button" onClick={() => navigate('/documents')} className="px-4 py-2 text-sm text-[var(--color-muted)]">Annuler</button>
                    <button type="button" onClick={saveDraft} className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg)]"><Save className="w-4 h-4" /> Brouillon</button>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg font-medium btn-press"><Eye className="w-4 h-4" /> Aperçu & Imprimer</button>
                </div>
            </form>
        </div>
    )
}
