import { useState, useRef } from 'react'
import { Printer, Calendar, ListPlus, Trash2, Building, Scan } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { api as apiClient } from '@/lib/api/client'

export function InventoryGenerator() {
    const componentRef = useRef()

    const [departmentId, setDepartmentId] = useState('')
    const [locationId, setLocationId] = useState('')
    const [bureau, setBureau] = useState('')
    const [inventoriedBy, setInventoriedBy] = useState('')
    const [validatedBy, setValidatedBy] = useState('')

    // Fetch data for dropdowns
    const { data: departments = [] } = useQuery({
        queryKey: ['departments', 'all'],
        queryFn: async () => {
            const res = await apiClient.departments.getAll()
            return res.data
        }
    })

    const { data: locations = [] } = useQuery({
        queryKey: ['locations', 'all'],
        queryFn: async () => {
            const res = await apiClient.locations.getAll()
            return res.data
        }
    })

    // Fetch assets based on criteria
    const { data: assets = [], isFetching } = useQuery({
        queryKey: ['assets', 'inventory', departmentId, locationId, bureau],
        queryFn: async () => {
            // In a real app we'd pass filters to the API, 
            // for the mock we fetch all and filter client-side
            const res = await apiClient.assets.getAll()
            return res.data.filter(a =>
                (!departmentId || a.department?.id === departmentId) &&
                (!locationId || a.location?.id === locationId) &&
                (!bureau || a.bureau === bureau)
            )
        },
        enabled: !!departmentId || !!locationId || !!bureau
    })

    const handlePrint = () => {
        window.print()
    }

    const selectedDepartment = departments.find(d => d.id === departmentId)
    const selectedLocation = locations.find(l => l.id === locationId)

    return (
        <div className="space-y-8">
            {/* UI - Hidden on Print */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                    <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Scan className="w-5 h-5 text-sonatrach-orange" />
                            Générer Fiche d'Inventaire Physique
                        </h4>
                        <p className="text-sm text-[var(--color-muted)]">Filtrez les équipements pour construire la fiche de pointage.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Filtres d'emplacement */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Structure / Département</label>
                        <select
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        >
                            <option value="">-- Tous les départements --</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Site / Bâtiment</label>
                        <select
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        >
                            <option value="">-- Tous les sites --</option>
                            {locations.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium">N° Bureau (Optionnel)</label>
                        <input
                            type="text"
                            value={bureau}
                            onChange={(e) => setBureau(e.target.value)}
                            placeholder="Ex: 402"
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--color-muted)]">Agents de recensement</label>
                        <input value={inventoriedBy} onChange={e => setInventoriedBy(e.target.value)} placeholder="Noms des agents..." className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--color-muted)]">Responsable validation</label>
                        <input value={validatedBy} onChange={e => setValidatedBy(e.target.value)} placeholder="Nom du responsable..." className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none" />
                    </div>
                </div>

                {assets.length > 0 && (
                    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden mt-6">
                        <div className="bg-[var(--color-surface)] px-4 py-3 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-sm">Aperçu des articles trouvés ({assets.length})</h3>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)] sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Code Barre</th>
                                        <th className="px-4 py-2 text-left font-medium">Désignation</th>
                                        <th className="px-4 py-2 text-left font-medium">N° Série</th>
                                        <th className="px-4 py-2 text-left font-medium">Bureau</th>
                                        <th className="px-4 py-2 text-left font-medium">État</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {assets.map(asset => (
                                        <tr key={asset.id} className="hover:bg-[var(--color-bg)]">
                                            <td className="px-4 py-2 font-mono text-xs">{asset.tag}</td>
                                            <td className="px-4 py-2">{asset.category} {asset.brand}</td>
                                            <td className="px-4 py-2 font-mono text-xs text-[var(--color-muted)]">{asset.serialNumber}</td>
                                            <td className="px-4 py-2">{asset.bureau || '-'}</td>
                                            <td className="px-4 py-2">{asset.status.replace('_', ' ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {assets.length === 0 && (departmentId || locationId || bureau) && !isFetching && (
                    <div className="text-center py-8 text-[var(--color-muted)]">
                        Aucun équipement trouvé pour ces critères.
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handlePrint}
                        disabled={assets.length === 0}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors btn-press",
                            assets.length > 0
                                ? "bg-sonatrach-green hover:bg-sonatrach-green-light text-white"
                                : "bg-[var(--color-bg)] text-[var(--color-muted)] cursor-not-allowed border border-[var(--color-border)]"
                        )}
                    >
                        <Printer className="w-4 h-4" />
                        Aperçu & Imprimer Fiche
                    </button>
                </div>
            </div>

            {/* Print Layout - Visible only during printing */}
            <div className="hidden print:block font-serif text-black bg-white" ref={componentRef}>
                <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                    <div className="w-1/3">
                        <div className="text-xl font-bold tracking-wider mb-1">SONATRACH</div>
                        <div className="text-sm">ACTIVITÉ AVAL</div>
                    </div>

                    <div className="w-1/3 text-center">
                        <h1 className="text-2xl font-bold uppercase mb-2">FICHE D'INVENTAIRE PHYSIQUE</h1>
                        <div className="text-md">Exercice : {new Date().getFullYear()}</div>
                    </div>

                    <div className="w-1/3 text-right">
                        <div className="text-sm">Date d'édition : {format(new Date(), 'dd/MM/yyyy')}</div>
                        <div className="text-sm mt-1">Page 1 / 1</div>
                    </div>
                </div>

                <div className="flex justify-between mb-8 text-sm">
                    <div className="space-y-2">
                        <div><span className="font-bold underline w-24 inline-block">Structure :</span> {selectedDepartment ? `${selectedDepartment.name} (${selectedDepartment.code})` : 'Toutes structures'}</div>
                        <div><span className="font-bold underline w-24 inline-block">Site :</span> {selectedLocation ? selectedLocation.name : 'Tous les sites'}</div>
                        {bureau && <div><span className="font-bold underline w-24 inline-block">Bureau N° :</span> {bureau}</div>}
                    </div>
                </div>

                <table className="w-full border-collapse mb-12 text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-center" rowSpan={2}>N°</th>
                            <th className="border border-black p-2 text-center" rowSpan={2}>CODE BARRE</th>
                            <th className="border border-black p-2 text-left" rowSpan={2}>DÉSIGNATION DE L'ARTICLE</th>
                            <th className="border border-black p-2 text-left" rowSpan={2}>N° SÉRIE / MODÈLE</th>
                            <th className="border border-black p-2 text-center" rowSpan={2}>BUREAU</th>
                            <th className="border border-black p-2 text-center" colSpan={3}>POINTAGE PHYSIQUE</th>
                            <th className="border border-black p-2 text-left" rowSpan={2}>OBSERVATIONS</th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-1 py-2 w-10 text-center text-[10px]">T.B</th>
                            <th className="border border-black px-1 py-2 w-10 text-center text-[10px]">M.E</th>
                            <th className="border border-black px-1 py-2 w-10 text-center text-[10px]">H.S</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset, index) => (
                            <tr key={asset.id} className="h-10">
                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                <td className="border border-black p-2 font-mono text-center tracking-wider">{asset.tag}</td>
                                <td className="border border-black p-2 truncate max-w-[200px]">{asset.category} {asset.brand}</td>
                                <td className="border border-black p-2 text-[11px] break-words max-w-[120px]">{asset.serialNumber} / {asset.model}</td>
                                <td className="border border-black p-2 text-center font-bold">{asset.bureau || ''}</td>
                                <td className="border border-black p-0"></td>
                                <td className="border border-black p-0"></td>
                                <td className="border border-black p-0"></td>
                                <td className="border border-black p-2"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between text-xs mb-8">
                    <div>
                        <span className="font-bold">Légende État :</span>
                        <span className="ml-2">T.B : Très Bon</span>
                        <span className="ml-4">M.E : Mauvais État</span>
                        <span className="ml-4">H.S : Hors Service</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-16 text-center text-sm border-2 border-black p-4">
                    <div className="h-32">
                        <h3 className="font-bold underline mb-2">Les Agents de Recensement</h3>
                        <div className="font-medium uppercase mb-1">
                            {inventoriedBy || 'Noms & Signatures'}
                        </div>
                    </div>
                    <div className="h-32">
                        <h3 className="font-bold underline mb-2">Le Responsable Structure</h3>
                        <div className="font-medium uppercase mb-1">
                            {validatedBy || 'Nom & Signature'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
