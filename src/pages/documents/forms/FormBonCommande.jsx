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
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { MoneyInput } from '@/components/forms/MoneyInput.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'

const schema = yup.object({
    fournisseurNom: yup.string().required('Le nom du fournisseur est obligatoire'),
    fournisseurAdresse: yup.string().required("L'adresse est obligatoire"),
    solliciteur: yup.string().required('Le solliciteur est obligatoire'),
    approbateur: yup.string().required("L'approbateur est obligatoire"),
})

const TVA_OPTIONS = [{ value: '19', label: '19%' }, { value: '9', label: '9%' }]
const EXP_OPTIONS = [
    { value: 'Livraison directe', label: 'Livraison directe' },
    { value: 'Enlèvement', label: 'Enlèvement' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Autre', label: 'Autre' },
]

const DRAFT_KEY = 'draft_bon_commande'
const generateNumero = () => `BC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormBonCommande() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [articles, setArticles] = useState([{ code: '', designation: '', quantite: 1, prixUnitaire: 0, montant: 0 }])
    const [tvaRate, setTvaRate] = useState('19')

    const { register, handleSubmit, formState: { errors }, watch, reset, setValue, getValues } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            fournisseurNom: '', fournisseurAdresse: '', fournisseurContact: '',
            refDevis: '', dateLivraison: '', modeExpedition: '', noteFournisseur: '',
            compteGeneral: '', compteAnalytique: '',
            solliciteur: user?.fullName || '', approbateur: '',
        }
    })

    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) { try { const d = JSON.parse(saved); if (d.formData) reset(d.formData); if (d.articles) setArticles(d.articles) } catch { } }
    }, [reset])
    const saveDraft = useCallback(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: watch(), articles, savedAt: Date.now() })) }, [watch, articles])
    useEffect(() => { const i = setInterval(saveDraft, 30000); return () => clearInterval(i) }, [saveDraft])

    const updateCell = (idx, key, val) => {
        setArticles(prev => prev.map((row, i) => {
            if (i !== idx) return row
            const updated = { ...row, [key]: val }
            updated.montant = (updated.quantite || 0) * (updated.prixUnitaire || 0)
            return updated
        }))
    }
    const addRow = () => setArticles(prev => [...prev, { code: '', designation: '', quantite: 1, prixUnitaire: 0, montant: 0 }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))

    const totalHT = articles.reduce((s, a) => s + (a.montant || 0), 0)
    const montantTVA = totalHT * (parseFloat(tvaRate) / 100)
    const totalTTC = totalHT + montantTVA
    const fmt = (n) => new Intl.NumberFormat('fr-DZ').format(n)

    const cols = [
        { key: 'code', label: 'Code', required: true },
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'quantite', label: 'Qté', type: 'number', min: 1, required: true, align: 'right' },
        { key: 'prixUnitaire', label: 'PU (DA)', type: 'number', min: 0, step: 0.01, required: true, align: 'right' },
        { key: 'montant', label: 'Montant (DA)', readOnly: true, align: 'right' },
    ]

    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        setPrintData({
            numero, date: fd.date,
            fournisseur: { nom: fd.fournisseurNom, adresse: fd.fournisseurAdresse, contact: fd.fournisseurContact },
            articles: articles.map(a => ({ ...a, montant: fmt(a.montant) })),
            conditions: { refDevis: fd.refDevis, dateLivraison: fd.dateLivraison, modeExpedition: fd.modeExpedition, note: fd.noteFournisseur },
            totalHT, montantTVA, totalTTC, tvaRate,
            imputation: { compteGeneral: fd.compteGeneral, compteAnalytique: fd.compteAnalytique },
            solliciteur: fd.solliciteur, approbateur: fd.approbateur,
        })
        setShowPreview(true)
        localStorage.removeItem(DRAFT_KEY)
    }


    if (showPreview) return (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
            <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"><ArrowLeft className="w-4 h-4" /> Retour</button>
            <PrintManager documentType="BON_COMMANDE" data={printData} />
        </div>
    )

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Bon de Commande" description={`${numero} — Alger, le ${new Date().toLocaleDateString('fr-FR')}`} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="N° BC" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} />
                    </div>
                </FormSection>
                <FormSection title="Fournisseur">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nom fournisseur" name="fournisseurNom" register={register} errors={errors} required />
                        <FormField label="Contact" name="fournisseurContact" register={register} errors={errors} />
                    </div>
                    <FormTextarea label="Adresse" name="fournisseurAdresse" register={register} errors={errors} required rows={2} />
                </FormSection>
                <FormSection title="Conditions Particulières">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Réf. Devis/Facture" name="refDevis" register={register} errors={errors} />
                        <FormDatePicker label="Date livraison souhaitée" name="dateLivraison" register={register} errors={errors} />
                        <FormSelect label="Mode d'expédition" name="modeExpedition" register={register} errors={errors} options={EXP_OPTIONS} placeholder="Sélectionner" />
                    </div>
                    <FormTextarea label="Note au fournisseur" name="noteFournisseur" register={register} errors={errors} rows={3} />
                </FormSection>
                <FormSection title="Articles Commandés">
                    <DynamicTable columns={cols} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                    <div className="bg-[var(--color-bg)] rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[var(--color-muted)]">Total HT</span><span className="font-medium">{fmt(totalHT)} DA</span></div>
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--color-muted)] flex items-center gap-2">TVA
                                <select value={tvaRate} onChange={e => setTvaRate(e.target.value)} className="h-7 px-2 border border-[var(--color-border)] rounded text-xs bg-transparent">
                                    {TVA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </span>
                            <span className="font-medium">{fmt(montantTVA)} DA</span>
                        </div>
                        <div className="flex justify-between border-t border-[var(--color-border)] pt-2"><span className="font-bold text-[#E87722]">TOTAL TTC</span><span className="font-bold text-[#E87722]">{fmt(totalTTC)} DA</span></div>
                    </div>
                </FormSection>
                <FormSection title="Imputation">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Compte Général" name="compteGeneral" register={register} errors={errors} />
                        <FormField label="Compte Analytique" name="compteAnalytique" register={register} errors={errors} />
                    </div>
                </FormSection>
                <FormSection title="Signataires">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Sollicité par" name="solliciteur" register={register} errors={errors} required />
                        <FormField label="Approuvé par" name="approbateur" register={register} errors={errors} required />
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