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
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { MoneyInput } from '@/components/forms/MoneyInput.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'

const schema = yup.object({
    numCommande: yup.string().required('Le N° de commande est obligatoire'),
    numLivraison: yup.string().required('Le N° bon de livraison est obligatoire'),
    dateLivraison: yup.string().required('La date de livraison est obligatoire'),
    fournisseurNom: yup.string().required('Le nom du fournisseur est obligatoire'),
    receptionnaire: yup.string().required('Le réceptionnaire est obligatoire'),
})

const DRAFT_KEY = 'draft_bon_reception'
const generateNumero = () => `BR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormBonReception() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [articles, setArticles] = useState([{ code: '', designation: '', udm: 'U', qtyCommandee: 0, solde: 0, qtyReceptionnee: 0, prixUnitaire: 0, valeur: 0, numSerie: '', stockable: true }])

    const { register, handleSubmit, formState: { errors }, watch, reset, setValue, getValues } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            numCommande: '', numLivraison: '', dateLivraison: '',
            fournisseurNom: '', codeFournisseur: '', adresseFournisseur: '',
            factureN: '', classe: '',
            droitDouane: 0, fret: 0, transport: 0,
            receptionnaire: user?.fullName || '', valorisePar: '', fichiste: '', comptabilite: '',
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
            updated.valeur = (updated.qtyReceptionnee || 0) * (updated.prixUnitaire || 0)
            updated.solde = (updated.qtyCommandee || 0) - (updated.qtyReceptionnee || 0)
            return updated
        }))
    }
    const addRow = () => setArticles(prev => [...prev, { code: '', designation: '', udm: 'U', qtyCommandee: 0, solde: 0, qtyReceptionnee: 0, prixUnitaire: 0, valeur: 0, numSerie: '', stockable: true }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))

    const totalGeneral = articles.reduce((s, a) => s + (a.valeur || 0), 0)
    const fmt = (n) => new Intl.NumberFormat('fr-DZ').format(n)

    const cols = [
        { key: 'code', label: 'Code', required: true },
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'udm', label: 'U.M', type: 'select', options: [{ value: 'U', label: 'U' }, { value: 'Lot', label: 'Lot' }, { value: 'Boîte', label: 'Boîte' }, { value: 'Licence', label: 'Licence' }] },
        { key: 'qtyCommandee', label: 'Qté Cmd', type: 'number', min: 0, required: true, align: 'right' },
        { key: 'solde', label: 'Solde', readOnly: true, align: 'right' },
        { key: 'qtyReceptionnee', label: 'Qté Reçue', type: 'number', min: 0, required: true, align: 'right' },
        { key: 'prixUnitaire', label: 'PU (DA)', type: 'number', min: 0, step: 0.01, required: true, align: 'right' },
        { key: 'valeur', label: 'Valeur', readOnly: true, align: 'right' },
        { key: 'numSerie', label: 'N° Série' },
    ]

    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        setPrintData({
            numero, numCommande: fd.numCommande, numLivraison: fd.numLivraison, dateLivraison: fd.dateLivraison,
            fournisseur: { nom: fd.fournisseurNom, code: fd.codeFournisseur, adresse: fd.adresseFournisseur },
            articles, totalGeneral,
            factureN: fd.factureN, classe: fd.classe,
            droitDouane: fd.droitDouane, fret: fd.fret, transport: fd.transport,
            signataires: { receptionnaire: fd.receptionnaire, valorisePar: fd.valorisePar, fichiste: fd.fichiste, comptabilite: fd.comptabilite },
        })
        setShowPreview(true)
        localStorage.removeItem(DRAFT_KEY)
    }


    if (showPreview) return (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
            <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"><ArrowLeft className="w-4 h-4" /> Retour</button>
            <PrintManager documentType="BON_RECEPTION" data={printData} />
        </div>
    )

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Bon de Réception M-103" description={numero} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références Réception">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="N° BR" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormField label="N° Commande" name="numCommande" register={register} errors={errors} required />
                        <FormField label="N° Bon Livraison" name="numLivraison" register={register} errors={errors} required />
                        <FormDatePicker label="Date Livraison" name="dateLivraison" register={register} errors={errors} required />
                    </div>
                </FormSection>
                <FormSection title="Fournisseur">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nom Fournisseur" name="fournisseurNom" register={register} errors={errors} required />
                        <FormField label="Code Fournisseur" name="codeFournisseur" register={register} errors={errors} />
                    </div>
                    <FormTextarea label="Adresse" name="adresseFournisseur" register={register} errors={errors} rows={2} />
                </FormSection>
                <FormSection title="Articles Réceptionnés">
                    <DynamicTable columns={cols} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                    <div className="bg-[var(--color-bg)] rounded-lg p-4 text-sm font-bold text-[#E87722] flex justify-between">
                        <span>TOTAL GÉNÉRAL</span><span>{fmt(totalGeneral)} DA</span>
                    </div>
                </FormSection>
                <FormSection title="Récapitulatif Financier">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Facture N°" name="factureN" register={register} errors={errors} />
                        <FormField label="Classe" name="classe" register={register} errors={errors} />
                        <MoneyInput label="Droit de douane" name="droitDouane" register={register} errors={errors} setValue={setValue} />
                        <MoneyInput label="Fret / Assurance" name="fret" register={register} errors={errors} setValue={setValue} />
                        <MoneyInput label="Transport" name="transport" register={register} errors={errors} setValue={setValue} />
                    </div>
                </FormSection>
                <FormSection title="Signataires">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Réceptionnaire" name="receptionnaire" register={register} errors={errors} required />
                        <FormField label="Valorisé par" name="valorisePar" register={register} errors={errors} />
                        <FormField label="Fichiste" name="fichiste" register={register} errors={errors} />
                        <FormField label="Comptabilité" name="comptabilite" register={register} errors={errors} />
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