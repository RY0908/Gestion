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
import { PrintManager } from '@/components/print/PrintManager.jsx'
import { cn } from '@/lib/utils.js'

import { useDocumentPrefill } from '@/hooks/useDocumentPrefill.js'

const schema = yup.object({
    designation: yup.string().required('La désignation est obligatoire'),
    marque: yup.string().required('La marque est obligatoire'),
    numSerie: yup.string().required('Le N° série est obligatoire'),
    dateFinGarantie: yup.string().required('La date fin garantie est obligatoire'),
    fournisseurNom: yup.string().required('Le fournisseur est obligatoire'),
    fournisseurContact: yup.string().required('Le contact est obligatoire'),
    descriptionPanne: yup.string().required('La description est obligatoire'),
    technicien: yup.string().required('Le technicien est obligatoire'),
    chefDepartement: yup.string().required('Le chef département est obligatoire'),
})

const DRAFT_KEY = 'draft_demande_garantie'
const generateNumero = () => `DRG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormDemandeGarantie() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [docs, setDocs] = useState({ bonCommande: false, facture: false, certificat: false, ficheTechnique: false, autre: false })
    const [autreDoc, setAutreDoc] = useState('')

    const { defaults } = useDocumentPrefill('DEMANDE_GARANTIE')

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: defaults.date || new Date().toISOString().split('T')[0],
            designation: '', marque: '', modele: '', numSerie: '', numInventaire: '', numBonCommande: '',
            dateAcquisition: '', dateFinGarantie: '',
            fournisseurNom: '', fournisseurContact: '',
            descriptionPanne: '',
            dateEnvoiFournisseur: '', dateRetourPrevue: '', remplacement: 'Non fourni',
            technicien: defaults.demandeur || user?.fullName || '',
            chefDepartement: '',
        }
    })

    useEffect(() => { const s = localStorage.getItem(DRAFT_KEY); if (s) { try { const d = JSON.parse(s); if (d.formData) reset(d.formData); if (d.docs) setDocs(d.docs) } catch { } } }, [reset])
    const saveDraft = useCallback(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: watch(), docs, savedAt: Date.now() })) }, [watch, docs])
    useEffect(() => { const i = setInterval(saveDraft, 30000); return () => clearInterval(i) }, [saveDraft])

    const dateFinGarantie = watch('dateFinGarantie')
    const garantieValide = dateFinGarantie ? new Date(dateFinGarantie) >= new Date() : null

    const onSubmit = () => { setShowPreview(true); localStorage.removeItem(DRAFT_KEY) }
    const formData = watch()
    const documentsJoints = Object.entries(docs).filter(([, v]) => v).map(([k]) => k === 'autre' ? `Autre: ${autreDoc}` : { bonCommande: 'Copie bon de commande', facture: 'Facture', certificat: 'Certificat de garantie', ficheTechnique: 'Fiche technique' }[k] || k)
    const printData = { numero, date: formData.date, materiel: { designation: formData.designation, marque: formData.marque, modele: formData.modele, numSerie: formData.numSerie, numInventaire: formData.numInventaire, numBonCommande: formData.numBonCommande, dateAcquisition: formData.dateAcquisition, dateFinGarantie: formData.dateFinGarantie }, fournisseur: { nom: formData.fournisseurNom, contact: formData.fournisseurContact }, descriptionPanne: formData.descriptionPanne, documentsJoints, technicien: formData.technicien, chefDepartement: formData.chefDepartement }


    if (showPreview) return (<div className="p-6 max-w-7xl mx-auto space-y-4"><button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><ArrowLeft className="w-4 h-4" /> Retour</button><PrintManager documentType="DEMANDE_GARANTIE" data={printData} /></div>)

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)]"><ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" /></button>
                <PageHeader title="Demande Réparation sous Garantie" description={numero} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Références">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="N°" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} />
                    </div>
                </FormSection>
                <FormSection title="Informations Matériel">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Désignation" name="designation" register={register} errors={errors} required />
                        <FormField label="Marque" name="marque" register={register} errors={errors} required />
                        <FormField label="Modèle" name="modele" register={register} errors={errors} />
                        <FormField label="N° Série" name="numSerie" register={register} errors={errors} required />
                        <FormField label="N° Inventaire" name="numInventaire" register={register} errors={errors} />
                        <FormField label="N° Bon de Commande" name="numBonCommande" register={register} errors={errors} />
                        <FormDatePicker label="Date d'acquisition" name="dateAcquisition" register={register} errors={errors} />
                        <div className="space-y-1">
                            <FormDatePicker label="Date fin garantie" name="dateFinGarantie" register={register} errors={errors} required />
                            {garantieValide !== null && (
                                <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', garantieValide ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')}>
                                    {garantieValide ? '✓ Garantie valide' : '✗ Garantie expirée'}
                                </span>
                            )}
                        </div>
                    </div>
                </FormSection>
                <FormSection title="Fournisseur">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nom fournisseur" name="fournisseurNom" register={register} errors={errors} required />
                        <FormField label="Contact (tél/email)" name="fournisseurContact" register={register} errors={errors} required />
                    </div>
                </FormSection>
                <FormSection title="Description Panne">
                    <FormTextarea label="Description" name="descriptionPanne" register={register} errors={errors} required rows={5} />
                </FormSection>
                <FormSection title="Documents Joints">
                    <div className="flex flex-wrap gap-3">
                        {[{ k: 'bonCommande', l: 'Copie bon de commande' }, { k: 'facture', l: 'Facture' }, { k: 'certificat', l: 'Certificat de garantie' }, { k: 'ficheTechnique', l: 'Fiche technique' }, { k: 'autre', l: 'Autre' }].map(d => (
                            <label key={d.k} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm cursor-pointer hover:border-sonatrach-green/40">
                                <input type="checkbox" checked={docs[d.k]} onChange={e => setDocs(prev => ({ ...prev, [d.k]: e.target.checked }))} className="w-4 h-4 rounded text-sonatrach-green" /> {d.l}
                            </label>
                        ))}
                    </div>
                    {docs.autre && <input type="text" value={autreDoc} onChange={e => setAutreDoc(e.target.value)} placeholder="Précisez..." className="mt-2 w-full h-9 px-3 rounded-lg border border-[var(--color-border)] text-sm bg-transparent outline-none" />}
                </FormSection>
                <FormSection title="Suivi">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormDatePicker label="Date envoi fournisseur" name="dateEnvoiFournisseur" register={register} errors={errors} />
                        <FormDatePicker label="Date retour prévue" name="dateRetourPrevue" register={register} errors={errors} />
                    </div>
                    <FormRadioGroup label="Matériel de remplacement" name="remplacement" register={register} errors={errors} options={[{ value: 'Fourni', label: 'Fourni' }, { value: 'Non fourni', label: 'Non fourni' }]} />
                </FormSection>
                <FormSection title="Signataires">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Technicien demandeur" name="technicien" register={register} errors={errors} required />
                        <FormField label="Chef département" name="chefDepartement" register={register} errors={errors} required />
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