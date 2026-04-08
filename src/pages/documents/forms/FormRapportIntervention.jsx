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
const PANNE_TYPES = [{ value: 'Matérielle', label: 'Matérielle' }, { value: 'Logicielle', label: 'Logicielle' }, { value: 'Réseau', label: 'Réseau' }, { value: 'Utilisateur', label: 'Utilisateur' }]
const RESULTATS = [{ value: 'Résolu', label: 'Résolu définitivement' }, { value: 'Temporaire', label: 'Solution temporaire' }, { value: 'Fournisseur', label: 'Renvoyé fournisseur' }, { value: 'Réformé', label: 'Mis en réforme' }]

const schema = yup.object({
    etabliPar: yup.string().required('Obligatoire'),
    matricule: yup.string().required('Obligatoire'),
})

const DRAFT_KEY = 'draft_rapport_intervention'
const generateNumero = () => `RI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormRapportIntervention() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [typeRapport, setTypeRapport] = useState('unique')
    const [interventions, setInterventions] = useState([{ date: '', utilisateur: '', materiel: '', typePanne: 'Matérielle', duree: 0, resultat: 'Résolu' }])

    const { defaults } = useDocumentPrefill('RAPPORT_INTERV')

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            dateDebut: defaults.date || new Date().toISOString().split('T')[0], dateFin: '',
            etabliPar: defaults.technicien || user?.fullName || '',
            matricule: defaults.technicienMatricule || '',
            refDemande: '', dateDeclaration: '', utilisateur: '',
            direction: defaults.direction || '',
            bureau: '', materiel: '', numSerie: '', dateIntervention: '', duree: '',
            cause: '', typePanne: 'Matérielle', actionsRealisees: '', resultat: 'Résolu', preconisations: '',
        }
    })

    useHydratedFormDefaults({
        enabled: Boolean(user),
        reset,
        signature: `RAPPORT_INTERV-${user?.id || 'guest'}`,
        values: {
            dateDebut: defaults.date || new Date().toISOString().split('T')[0],
            dateFin: '',
            etabliPar: defaults.technicien || user?.fullName || '',
            matricule: defaults.technicienMatricule || '',
            refDemande: '',
            dateDeclaration: '',
            utilisateur: '',
            direction: defaults.direction || '',
            bureau: '',
            materiel: '',
            numSerie: '',
            dateIntervention: '',
            duree: '',
            cause: '',
            typePanne: 'Matérielle',
            actionsRealisees: '',
            resultat: 'Résolu',
            preconisations: '',
        },
    })

    const saveDraft = useDraftAutosave({
        draftKey: DRAFT_KEY,
        watch,
        reset,
        onLoadDraft: (draft, resetFn) => {
            if (draft?.formData) resetFn(draft.formData)
            if (draft?.interventions) setInterventions(draft.interventions)
            if (draft?.type) setTypeRapport(draft.type)
        },
        buildDraft: (formData) => ({ formData, interventions, type: typeRapport }),
    })

    const updateCell = (idx, key, val) => setInterventions(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))
    const addRow = () => setInterventions(prev => [...prev, { date: '', utilisateur: '', materiel: '', typePanne: 'Matérielle', duree: 0, resultat: 'Résolu' }])
    const removeRow = (idx) => setInterventions(prev => prev.filter((_, i) => i !== idx))

    const mensuelCols = [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'utilisateur', label: 'Utilisateur', required: true },
        { key: 'materiel', label: 'Matériel', required: true },
        { key: 'typePanne', label: 'Type', type: 'select', options: PANNE_TYPES, required: true },
        { key: 'duree', label: 'Durée (h)', type: 'number', min: 0, step: 0.5, required: true, align: 'right' },
        { key: 'resultat', label: 'Résultat', type: 'select', options: [{ value: 'Résolu', label: 'Résolu' }, { value: 'En cours', label: 'En cours' }, { value: 'Renvoyé', label: 'Renvoyé' }, { value: 'Réformé', label: 'Réformé' }], required: true },
    ]
    const totalDuree = interventions.reduce((s, i) => s + (parseFloat(i.duree) || 0), 0)

    const onSubmit = () => { setShowPreview(true); localStorage.removeItem(DRAFT_KEY) }
    const formData = watch()
    const printData = { numero, dateDebut: formData.dateDebut, dateFin: formData.dateFin, technicien: { nom: formData.etabliPar, matricule: formData.matricule }, intervention: { refDemande: formData.refDemande, dateDeclaration: formData.dateDeclaration, utilisateur: formData.utilisateur, direction: formData.direction, bureau: formData.bureau, materiel: formData.materiel, numSerie: formData.numSerie, dateIntervention: formData.dateIntervention, duree: formData.duree }, diagnostic: { cause: formData.cause, typePanne: formData.typePanne }, actionsRealisees: formData.actionsRealisees, resultat: formData.resultat, preconisations: formData.preconisations, estRapportMensuel: typeRapport === 'mensuel', interventionsMensuelles: interventions }


    if (showPreview) return (<div className="p-6 max-w-7xl mx-auto space-y-4"><button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><ArrowLeft className="w-4 h-4" /> Retour</button><PrintManager documentType="RAPPORT_INTERV" data={printData} /></div>)

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Rapport d'Intervention" description={numero} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références Rapport">
                    <div className="flex gap-3 mb-4">
                        {[{ v: 'unique', l: 'Rapport unique (intervention)' }, { v: 'mensuel', l: 'Rapport mensuel' }].map(o => (
                            <label key={o.v} className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm cursor-pointer transition-all ${typeRapport === o.v ? 'border-[#E87722] bg-[#FDE9D9] font-medium' : 'border-[var(--color-border)]'}`}>
                                <input type="radio" checked={typeRapport === o.v} onChange={() => setTypeRapport(o.v)} /> {o.l}
                            </label>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="N° Rapport" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Période du" name="dateDebut" register={register} errors={errors} />
                        <FormDatePicker label="Période au" name="dateFin" register={register} errors={errors} />
                        <FormField label="Établi par" name="etabliPar" register={register} errors={errors} required />
                        <FormField label="Matricule" name="matricule" register={register} errors={errors} required />
                    </div>
                </FormSection>
                {typeRapport === 'unique' && (<>
                    <FormSection title="Résumé Intervention">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Réf. Demande" name="refDemande" register={register} errors={errors} />
                            <FormDatePicker label="Date déclaration" name="dateDeclaration" register={register} errors={errors} />
                            <FormField label="Utilisateur" name="utilisateur" register={register} errors={errors} />
                            <FormSelect label="Direction" name="direction" register={register} errors={errors} options={DIRECTIONS} placeholder="Sélectionner" />
                            <FormField label="Bureau" name="bureau" register={register} errors={errors} />
                            <FormField label="Matériel" name="materiel" register={register} errors={errors} />
                            <FormField label="N° Série" name="numSerie" register={register} errors={errors} />
                            <FormDatePicker label="Date intervention" name="dateIntervention" register={register} errors={errors} />
                            <FormField label="Durée (heures)" name="duree" type="number" register={register} errors={errors} />
                        </div>
                    </FormSection>
                    <FormSection title="Diagnostic">
                        <FormTextarea label="Cause identifiée" name="cause" register={register} errors={errors} rows={3} />
                        <FormRadioGroup label="Type de panne" name="typePanne" register={register} errors={errors} options={PANNE_TYPES} />
                    </FormSection>
                    <FormSection title="Actions et Résultat">
                        <FormTextarea label="Actions réalisées" name="actionsRealisees" register={register} errors={errors} rows={5} />
                        <FormRadioGroup label="Résultat final" name="resultat" register={register} errors={errors} options={RESULTATS} />
                        <FormTextarea label="Préconisations" name="preconisations" register={register} errors={errors} rows={3} />
                    </FormSection>
                </>)}
                {typeRapport === 'mensuel' && (
                    <FormSection title="Tableau Mensuel">
                        <DynamicTable columns={mensuelCols} rows={interventions} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                        <div className="bg-[var(--color-bg)] rounded-lg p-3 text-sm font-medium">Total durée : <strong className="text-[#E87722]">{totalDuree}h</strong></div>
                    </FormSection>
                )}
                <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-end gap-3 z-30 shadow-lg">
                    <button type="button" onClick={() => navigate('/documents')} className="px-4 py-2 text-sm text-[var(--color-muted)]">Annuler</button>
                    <button type="button" onClick={saveDraft} className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg)]"><Save className="w-4 h-4" /> Brouillon</button>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg font-medium btn-press"><Eye className="w-4 h-4" /> Aperçu & Imprimer</button>
                </div>
            </form>
        </div>
    )
}
