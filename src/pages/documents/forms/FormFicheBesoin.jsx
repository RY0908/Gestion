import { useState } from 'react'
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
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { MoneyInput } from '@/components/forms/MoneyInput.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'

import { useDocumentPrefill } from '@/hooks/useDocumentPrefill.js'
import { useDraftAutosave } from '@/hooks/useDraftAutosave.js'
import { useHydratedFormDefaults } from '@/hooks/useHydratedFormDefaults.js'

const schema = yup.object({
    structure: yup.string().required('La structure est obligatoire'),
    justification: yup.string().required('La justification est obligatoire'),
    budget: yup.number().typeError('Montant requis').positive('Doit être > 0').required('Le budget est obligatoire'),
    imputation: yup.string().required("L'imputation est obligatoire"),
    etabliPar: yup.string().required('Obligatoire'),
})

const DRAFT_KEY = 'draft_fiche_besoin'
const generateNumero = () => `FB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormFicheBesoin() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [articles, setArticles] = useState([{ designation: '', quantite: 1, specifications: '', prixEstimatif: 0, montantTotal: 0 }])

    const { defaults } = useDocumentPrefill('FICHE_BESOIN')

    const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: defaults.date || new Date().toISOString().split('T')[0],
            structure: defaults.structure || '',
            nature: 'Nouveau', justification: '', budget: '', imputation: '',
            etabliPar: defaults.demandeur || user?.fullName || '',
            approuvePar: '',
        }
    })

    useHydratedFormDefaults({
        enabled: Boolean(user),
        reset,
        signature: `FICHE_BESOIN-${user?.id || 'guest'}`,
        values: {
            date: defaults.date || new Date().toISOString().split('T')[0],
            structure: defaults.structure || '',
            nature: 'Nouveau',
            justification: '',
            budget: '',
            imputation: '',
            etabliPar: defaults.demandeur || user?.fullName || '',
            approuvePar: '',
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

    const updateCell = (idx, key, val) => {
        setArticles(prev => prev.map((r, i) => {
            if (i !== idx) return r
            const u = { ...r, [key]: val }
            u.montantTotal = (u.quantite || 0) * (u.prixEstimatif || 0)
            return u
        }))
    }
    const addRow = () => setArticles(prev => [...prev, { designation: '', quantite: 1, specifications: '', prixEstimatif: 0, montantTotal: 0 }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))

    const totalEstime = articles.reduce((s, a) => s + (a.montantTotal || 0), 0)
    const fmt = (n) => new Intl.NumberFormat('fr-DZ').format(n)

    const cols = [
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'quantite', label: 'Qté', type: 'number', min: 1, required: true, align: 'right' },
        { key: 'specifications', label: 'Spécifications techniques' },
        { key: 'prixEstimatif', label: 'PU estimatif (DA)', type: 'number', min: 0, step: 0.01, required: true, align: 'right' },
        { key: 'montantTotal', label: 'Montant total', readOnly: true, align: 'right' },
    ]

    const onSubmit = () => { setShowPreview(true); localStorage.removeItem(DRAFT_KEY) }
    const formData = watch()
    const printData = { numero, date: formData.date, structure: formData.structure, nature: formData.nature, articles, totalEstime, justification: formData.justification, budget: formData.budget, imputation: formData.imputation, etabliPar: formData.etabliPar, approuvePar: formData.approuvePar }


    if (showPreview) return (<div className="p-6 max-w-7xl mx-auto space-y-4"><button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><ArrowLeft className="w-4 h-4" /> Retour</button><PrintManager documentType="FICHE_BESOIN" data={printData} /></div>)

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Fiche Besoin" description={numero} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Référence" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} disabled />
                        <FormField label="Structure" name="structure" register={register} errors={errors} required />
                    </div>
                </FormSection>
                <FormSection title="Nature du Besoin">
                    <FormRadioGroup label="Nature" name="nature" register={register} errors={errors} required options={[
                        { value: 'Renouvellement', label: 'Renouvellement' }, { value: 'Extension', label: 'Extension' }, { value: 'Nouveau', label: 'Nouveau' },
                    ]} />
                </FormSection>
                <FormSection title="Articles / Besoins">
                    <DynamicTable columns={cols} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                    <div className="bg-[var(--color-bg)] rounded-lg p-4 text-sm font-bold text-[#E87722] flex justify-between">
                        <span>TOTAL ESTIMÉ</span><span>{fmt(totalEstime)} DA</span>
                    </div>
                </FormSection>
                <FormSection title="Budget et Imputation">
                    <FormTextarea label="Justification du besoin" name="justification" register={register} errors={errors} required rows={4} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MoneyInput label="Budget disponible" name="budget" register={register} errors={errors} required setValue={setValue} />
                        <FormField label="Imputation budgétaire" name="imputation" register={register} errors={errors} required placeholder="ex: 63001-ISI-2025" />
                    </div>
                </FormSection>
                <FormSection title="Signataires">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Établi par" name="etabliPar" register={register} errors={errors} required />
                        <FormField label="Approuvé par" name="approuvePar" register={register} errors={errors} />
                    </div>
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
