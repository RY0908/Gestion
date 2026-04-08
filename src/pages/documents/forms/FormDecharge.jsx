import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { FormField } from '@/components/forms/FormField.jsx'
import { FormDatePicker } from '@/components/forms/FormDatePicker.jsx'
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'
import { saveDocument } from '@/lib/api/saveDocument.js'
import { useDocumentPrefill } from '@/hooks/useDocumentPrefill.js'
import { useDraftAutosave } from '@/hooks/useDraftAutosave.js'
import { useHydratedFormDefaults } from '@/hooks/useHydratedFormDefaults.js'

const schema = yup.object({
    activite: yup.string().required("L'activité est obligatoire"),
    structure: yup.string().required('La structure est obligatoire'),
    dateRemise: yup.string().required('La date de remise est obligatoire'),
    cedantNom: yup.string().required('Le nom du cédant est obligatoire'),
    cedantPrenom: yup.string().required('Le prénom du cédant est obligatoire'),
    cedantStructure: yup.string().required('La structure du cédant est obligatoire'),
    recevantNom: yup.string().required('Le nom du recevant est obligatoire'),
    recevantPrenom: yup.string().required('Le prénom du recevant est obligatoire'),
    recevantStructure: yup.string().required('La structure du recevant est obligatoire'),
})

const DRAFT_KEY = 'draft_decharge'
const generateNumero = () => `DCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormDecharge() {
    const navigate = useNavigate()
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const emptyRow = { designation: '', marque: '', modele: '', numSerie: '', observation: '' }
    const [articles, setArticles] = useState([emptyRow, emptyRow, emptyRow, emptyRow, emptyRow]) // min 5

    const { defaults } = useDocumentPrefill('DECHARGE')

    const { register, handleSubmit, formState: { errors }, watch, reset, getValues } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            activite: defaults.activite || 'Activité AVAL',
            structure: defaults.structure || '',
            dateRemise: defaults.dateRemise || new Date().toISOString().split('T')[0],
            cedantNom: defaults.cedantNom || '',
            cedantPrenom: defaults.cedantPrenom || '',
            cedantStructure: defaults.cedantStructure || '',
            recevantNom: '', recevantPrenom: '', recevantStructure: '',
        }
    })

    useHydratedFormDefaults({
        enabled: true,
        reset,
        signature: `DECHARGE-${numero}`,
        values: {
            activite: defaults.activite || 'Activité AVAL',
            structure: defaults.structure || '',
            dateRemise: defaults.dateRemise || new Date().toISOString().split('T')[0],
            cedantNom: defaults.cedantNom || '',
            cedantPrenom: defaults.cedantPrenom || '',
            cedantStructure: defaults.cedantStructure || '',
            recevantNom: '',
            recevantPrenom: '',
            recevantStructure: '',
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
    const addRow = () => setArticles(prev => [...prev, { ...emptyRow }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))

    const cols = [
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'marque', label: 'Marque' },
        { key: 'modele', label: 'Modèle' },
        { key: 'numSerie', label: 'N° Série' },
        { key: 'observation', label: 'Observation' },
    ]

    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        const data = {
            numero, activite: fd.activite, structure: fd.structure, dateRemise: fd.dateRemise,
            cedant: { nom: fd.cedantNom, prenom: fd.cedantPrenom, structure: fd.cedantStructure },
            recevant: { nom: fd.recevantNom, prenom: fd.recevantPrenom, structure: fd.recevantStructure },
            articles: articles.filter(a => a.designation),
        }
        setPrintData(data)
        setShowPreview(true)
        localStorage.removeItem(DRAFT_KEY)
        // Archive to PostgreSQL (non-blocking)
        saveDocument('DCH', numero, data)
    }


    if (showPreview) return (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
            <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"><ArrowLeft className="w-4 h-4" /> Retour</button>
            <PrintManager documentType="DECHARGE" data={printData} />
        </div>
    )

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Décharge Matériel" description={numero} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Contexte">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="N° Décharge" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormField label="Activité" name="activite" register={register} errors={errors} required />
                        <FormField label="Structure" name="structure" register={register} errors={errors} required />
                        <FormDatePicker label="Date de remise" name="dateRemise" register={register} errors={errors} required />
                    </div>
                </FormSection>
                <FormSection title="Partie Cédante">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Nom" name="cedantNom" register={register} errors={errors} required />
                        <FormField label="Prénom" name="cedantPrenom" register={register} errors={errors} required />
                        <FormField label="Structure" name="cedantStructure" register={register} errors={errors} required />
                    </div>
                </FormSection>
                <FormSection title="Partie Recevante">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Nom" name="recevantNom" register={register} errors={errors} required />
                        <FormField label="Prénom" name="recevantPrenom" register={register} errors={errors} required />
                        <FormField label="Structure" name="recevantStructure" register={register} errors={errors} required />
                    </div>
                </FormSection>
                <FormSection title="Matériel Remis">
                    <DynamicTable columns={cols} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} minRows={5} />
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
