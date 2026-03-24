import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Printer, Download } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { FormField } from '@/components/forms/FormField.jsx'
import { FormSelect } from '@/components/forms/FormSelect.jsx'
import { FormTextarea } from '@/components/forms/FormTextarea.jsx'
import { FormDatePicker } from '@/components/forms/FormDatePicker.jsx'
import { FormRadioGroup } from '@/components/forms/FormRadioGroup.jsx'
import { SearchableSelect } from '@/components/forms/SearchableSelect.jsx'
import { FormSection } from '@/components/forms/FormSection.jsx'
import { DynamicTable } from '@/components/forms/DynamicTable.jsx'
import { PrintManager } from '@/components/print/PrintManager.jsx'
import { cn } from '@/lib/utils.js'

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

const MOTIFS = [
    { value: 'Usage', label: 'Usage' },
    { value: 'Remplacement', label: 'Remplacement' },
    { value: 'Affectation nouvelle', label: 'Affectation nouvelle' },
    { value: 'Projet', label: 'Projet' },
    { value: 'Autre', label: 'Autre (préciser)' },
]

const schema = yup.object({
    direction: yup.string().required('La direction est obligatoire'),
    beneficiaireNom: yup.string().required('Le nom est obligatoire'),
    beneficiairePrenom: yup.string().required('Le prénom est obligatoire'),
    beneficiaireMatricule: yup.string().required('Le matricule est obligatoire').min(6, 'Min 6 caractères'),
    beneficiairePoste: yup.string().required('Le poste est obligatoire'),
    motif: yup.string().required('Le motif est obligatoire'),
    gestionnaire: yup.string().required('Le gestionnaire est obligatoire'),
    responsableISI: yup.string().required('Le responsable ISI est obligatoire'),
})

const DRAFT_KEY = 'draft_bon_sortie'

const generateNumero = () => `BS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`

export default function FormBonSortie() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const [numero] = useState(generateNumero)
    const [showPreview, setShowPreview] = useState(false)
    const [articles, setArticles] = useState([{ codeArticle: '', designation: '', marque: '', modele: '', numSerie: '', numInventaire: '', quantite: 1, observations: '' }])

    const { register, handleSubmit, formState: { errors }, setValue, watch, getValues, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            direction: '',
            beneficiaireNom: user?.fullName?.split(' ')[1] || '',
            beneficiairePrenom: user?.fullName?.split(' ')[0] || '',
            beneficiaireMatricule: '',
            beneficiairePoste: user?.position || '',
            motif: '',
            motifPrecision: '',
            gestionnaire: user?.fullName || '',
            responsableISI: '',
        }
    })

    const motifValue = watch('motif')

    // ── Auto-save draft ──────────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
            try {
                const draft = JSON.parse(saved)
                if (draft.formData) reset(draft.formData)
                if (draft.articles) setArticles(draft.articles)
            } catch { /* ignore */ }
        }
    }, [reset])

    const saveDraft = useCallback(() => {
        const formData = watch()
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, articles, savedAt: Date.now() }))
    }, [watch, articles])

    useEffect(() => {
        const interval = setInterval(saveDraft, 30000)
        return () => clearInterval(interval)
    }, [saveDraft])

    // ── Table handlers ───────────────────────────────────────────────
    const addRow = () => setArticles(prev => [...prev, { codeArticle: '', designation: '', marque: '', modele: '', numSerie: '', numInventaire: '', quantite: 1, observations: '' }])
    const removeRow = (idx) => setArticles(prev => prev.filter((_, i) => i !== idx))
    const updateCell = (idx, key, val) => setArticles(prev => prev.map((row, i) => i === idx ? { ...row, [key]: val } : row))

    const articleColumns = [
        { key: 'codeArticle', label: 'Code Article', required: true },
        { key: 'designation', label: 'Désignation', required: true },
        { key: 'marque', label: 'Marque' },
        { key: 'modele', label: 'Modèle' },
        { key: 'numSerie', label: 'N° Série' },
        { key: 'numInventaire', label: 'N° Inventaire' },
        { key: 'quantite', label: 'Qté', type: 'number', min: 1, required: true, align: 'right' },
        { key: 'observations', label: 'Observations' },
    ]

    // ── Submit ────────────────────────────────────────────────────────
    const [printData, setPrintData] = useState(null)
    const onSubmit = () => {
        const fd = getValues()
        setPrintData({
            numero,
            date: fd.date,
            direction: DIRECTIONS.find(d => d.value === fd.direction),
            beneficiaire: { nom: fd.beneficiaireNom, prenom: fd.beneficiairePrenom, matricule: fd.beneficiaireMatricule, poste: fd.beneficiairePoste },
            motif: fd.motif,
            articles,
            gestionnaire: fd.gestionnaire,
            responsableISI: fd.responsableISI,
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
                <PrintManager documentType="BON_SORTIE" data={printData} />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" />
                </button>
                <PageHeader title="Bon de Sortie" description={`${numero} — Alger, le ${new Date().toLocaleDateString('fr-FR')}`} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Bloc 1: Références */}
                <FormSection title="Références Bon de Sortie">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="N° Bon de Sortie" name="numero" value={numero} disabled register={() => ({})} errors={{}} />
                        <FormDatePicker label="Date" name="date" register={register} errors={errors} disabled />
                    </div>
                </FormSection>

                {/* Bloc 2: Direction */}
                <FormSection title="Direction Destinataire">
                    <FormSelect label="Direction" name="direction" register={register} errors={errors} required options={DIRECTIONS} placeholder="Sélectionner une direction" />
                </FormSection>

                {/* Bloc 3: Bénéficiaire */}
                <FormSection title="Bénéficiaire">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Nom" name="beneficiaireNom" register={register} errors={errors} required />
                        <FormField label="Prénom" name="beneficiairePrenom" register={register} errors={errors} required />
                        <FormField label="Matricule" name="beneficiaireMatricule" register={register} errors={errors} required placeholder="6-10 caractères" />
                        <FormField label="Poste" name="beneficiairePoste" register={register} errors={errors} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect label="Motif de sortie" name="motif" register={register} errors={errors} required options={MOTIFS} placeholder="Sélectionner un motif" />
                        {motifValue === 'Autre' && (
                            <FormField label="Précision motif" name="motifPrecision" register={register} errors={errors} placeholder="Précisez le motif..." />
                        )}
                    </div>
                </FormSection>

                {/* Bloc 4: Articles */}
                <FormSection title="Articles Sortants">
                    <DynamicTable columns={articleColumns} rows={articles} onAddRow={addRow} onRemoveRow={removeRow} onCellChange={updateCell} />
                </FormSection>

                {/* Bloc 5: Signataires */}
                <FormSection title="Signataires">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Gestionnaire de stock" name="gestionnaire" register={register} errors={errors} required />
                        <FormField label="Responsable ISI" name="responsableISI" register={register} errors={errors} required />
                    </div>
                </FormSection>

                {/* Sticky action bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-end gap-3 z-30 shadow-lg">
                    <button type="button" onClick={() => navigate('/documents')} className="px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                        Annuler
                    </button>
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
