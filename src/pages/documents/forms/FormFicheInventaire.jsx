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
import { FormDatePicker } from '@/components/forms/FormDatePicker.jsx'
import { FormRadioGroup } from '@/components/forms/FormRadioGroup.jsx'
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'

import { useDocumentPrefill } from '@/hooks/useDocumentPrefill.js'

const DIRECTIONS = [
    { value: 'SPE', label: 'SPE' }, { value: 'FIN', label: 'FIN' }, { value: 'RHU', label: 'RHU' },
    { value: 'BDM', label: 'BDM' }, { value: 'ACT', label: 'ACT' }, { value: 'JUR', label: 'JUR' },
    { value: 'ISI', label: 'ISI' }, { value: 'MLG', label: 'MLG' }, { value: 'HSE', label: 'HSE' }, { value: 'RDT', label: 'RDT' },
]
const CATEGORIES = [
    { value: 'Micro-ordinateurs', label: 'Micro-ordinateurs' }, { value: 'Laptops', label: 'Laptops' },
    { value: 'Imprimantes', label: 'Imprimantes' }, { value: 'Écrans', label: 'Écrans' },
    { value: 'Switchs & Routeurs', label: 'Switchs & Routeurs' }, { value: 'Serveurs', label: 'Serveurs' },
    { value: 'Téléphones', label: 'Téléphones' }, { value: 'Onduleurs', label: 'Onduleurs' },
    { value: 'Périphériques', label: 'Périphériques' }, { value: 'Consommables', label: 'Consommables' }, { value: 'Tout', label: 'Tout' },
]
const ETATS = [
    { value: 'Neuf', label: 'Neuf' }, { value: 'Bon état', label: 'Bon état' },
    { value: 'Usagé', label: 'Usagé' }, { value: 'Défectueux', label: 'Défectueux' }, { value: 'Réformé', label: 'Réformé' },
]

const schema = yup.object({
    direction: yup.string().required('La direction est obligatoire'),
    sousStructure: yup.string().required('La sous-structure est obligatoire'),
    dateInventaire: yup.string().required('La date est obligatoire'),
    agentNom: yup.string().required('Le nom est obligatoire'),
    agentPrenom: yup.string().required('Le prénom est obligatoire'),
})

const DRAFT_KEY = 'draft_fiche_inventaire'
const generateNumero = () => `FIN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormFicheInventaire() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [typeInventaire, setTypeInventaire] = useState('par_bureau')
    const [articles, setArticles] = useState([{ numInventaire: '', categorie: '', designation: '', quantite: 1, marque: '', modele: '', numSerie: '', dateAcquisition: '', etat: 'Bon état', affectation: '', numBureau: '', observations: '' }])

    const { defaults } = useDocumentPrefill('FICHE_INVENTAIRE')
    const nameParts = (user?.fullName || '').split(' ')

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            direction: defaults.structure || '',
            sousStructure: '',
            dateInventaire: defaults.date || new Date().toISOString().split('T')[0],
            agentNom: nameParts.slice(1).join(' ') || '',
            agentPrenom: nameParts[0] || '',
            bureau: '', etage: '', responsableBureau: '',
            activite: '', categorieDoc: 'Tout',
        }
    })

    useEffect(() => { const s = localStorage.getItem(DRAFT_KEY); if (s) { try { const d = JSON.parse(s); if (d.formData) reset(d.formData); if (d.articles) setArticles(d.articles); if (d.type) setTypeInventaire(d.type) } catch { } } }, [reset])
    const saveDraft = useCallback(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: watch(), articles, type: typeInventaire, savedAt: Date.now() })) }, [watch, articles, typeInventaire])
    useEffect(() => { const i = setInterval(saveDraft, 30000); return () => clearInterval(i) }, [saveDraft])

    const updateCell = (idx, key, val) => setArticles(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))
    const addRow = () => setArticles(prev => [...prev, { numInventaire: '', categorie: '', designation: '', quantite: 1, marque: '', modele: '', numSerie: '', dateAcquisition: '', etat: 'Bon état', affectation: '', numBureau: '', observations: '' }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))

    const cols = [
        { key: 'numInventaire', label: 'N° Inv.', required: true },
        { key: 'categorie', label: 'Catégorie', type: 'select', options: CATEGORIES, required: true },
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'quantite', label: 'Qté', type: 'number', min: 1, required: true, align: 'right' },
        { key: 'marque', label: 'Marque' },
        { key: 'modele', label: 'Modèle' },
        { key: 'numSerie', label: 'N° Série' },
        { key: 'etat', label: 'État', type: 'select', options: ETATS, required: true },
        { key: 'affectation', label: 'Affectation' },
        { key: 'observations', label: 'Obs.' },
    ]

    const onSubmit = () => { setShowPreview(true); localStorage.removeItem(DRAFT_KEY) }
    const formData = watch()
    const printData = { numero, type: typeInventaire, direction: formData.direction, sousStructure: formData.sousStructure, dateInventaire: formData.dateInventaire, agent: { nom: formData.agentNom, prenom: formData.agentPrenom }, bureau: { numero: formData.bureau, etage: formData.etage }, responsableBureau: formData.responsableBureau, categorieDoc: formData.categorieDoc, activite: formData.activite, articles }


    if (showPreview) return (<div className="p-6 max-w-7xl mx-auto space-y-4"><button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><ArrowLeft className="w-4 h-4" /> Retour</button><PrintManager documentType="FICHE_INVENTAIRE" data={printData} /></div>)

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Fiche d'Inventaire" description={numero} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Type d'Inventaire">
                    <div className="flex gap-3">
                        {[{ v: 'par_bureau', l: 'Par bureau (A4 Portrait)' }, { v: 'global', l: 'Global / Catégorie (A4 Paysage)' }].map(o => (
                            <label key={o.v} className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm cursor-pointer transition-all ${typeInventaire === o.v ? 'border-[#E87722] bg-[#FDE9D9] font-medium' : 'border-[var(--color-border)]'}`}>
                                <input type="radio" checked={typeInventaire === o.v} onChange={() => setTypeInventaire(o.v)} className="text-[#E87722]" /> {o.l}
                            </label>
                        ))}
                    </div>
                </FormSection>
                <FormSection title="Informations Générales">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="N° Fiche" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormSelect label="Direction" name="direction" register={register} errors={errors} required options={DIRECTIONS} placeholder="Sélectionner" />
                        <FormField label="Sous-structure" name="sousStructure" register={register} errors={errors} required />
                        <FormDatePicker label="Date inventaire" name="dateInventaire" register={register} errors={errors} required />
                        <FormField label="Agent (Nom)" name="agentNom" register={register} errors={errors} required />
                        <FormField label="Agent (Prénom)" name="agentPrenom" register={register} errors={errors} required />
                    </div>
                </FormSection>
                {typeInventaire === 'par_bureau' && (
                    <FormSection title="Paramètres Bureau">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Bureau N°" name="bureau" register={register} errors={errors} required />
                            <FormField label="Étage" name="etage" register={register} errors={errors} required />
                            <FormField label="Responsable bureau" name="responsableBureau" register={register} errors={errors} />
                        </div>
                    </FormSection>
                )}
                {typeInventaire === 'global' && (
                    <FormSection title="Paramètres Global">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Activité" name="activite" register={register} errors={errors} required placeholder="ex: Activité TI / Helpdesk" />
                            <FormSelect label="Catégorie" name="categorieDoc" register={register} errors={errors} required options={CATEGORIES} />
                        </div>
                    </FormSection>
                )}
                <FormSection title="Articles à Inventorier">
                    <DynamicTable columns={cols} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                    <div className="bg-[var(--color-bg)] rounded-lg p-3 text-sm flex items-center gap-4">
                        <span className="font-medium">Total: <strong className="text-[#E87722]">{articles.length}</strong> articles</span>
                        {ETATS.map(e => {
                            const c = articles.filter(a => a.etat === e.value).length
                            return c > 0 ? <span key={e.value} className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface)] border border-[var(--color-border)]">{e.label}: {c}</span> : null
                        })}
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