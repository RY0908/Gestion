import { useState, useRef } from 'react'
import { Printer, Calendar, User, Package, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api as apiClient } from '@/lib/api/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function DechargeGenerator() {
    const componentRef = useRef()

    const [selectedAssets, setSelectedAssets] = useState([])
    const [cedant, setCedant] = useState('')
    const [recevant, setRecevant] = useState('')
    const [observation, setObservation] = useState('')

    // Fetch data for dropdowns
    const { data: assets = [] } = useQuery({
        queryKey: ['assets', 'all'],
        queryFn: async () => {
            const res = await apiClient.assets.getAll()
            return res.data
        }
    })

    const { data: users = [] } = useQuery({
        queryKey: ['users', 'all'],
        queryFn: async () => {
            const res = await apiClient.users.getAll()
            return res.data
        }
    })

    const handlePrint = () => {
        window.print()
    }

    const availableAssets = selectedAssets.length === 0
        ? assets
        : assets.filter(a => !selectedAssets.some(sa => sa.id === a.id))

    const addAsset = (e) => {
        const id = e.target.value
        if (!id) return
        const asset = assets.find(a => a.id === id)
        if (asset) {
            setSelectedAssets([...selectedAssets, asset])
        }
        e.target.value = ''
    }

    const removeAsset = (id) => {
        setSelectedAssets(selectedAssets.filter(a => a.id !== id))
    }

    const selectedCedantUser = users.find(u => u.id === cedant)
    const selectedRecevantUser = users.find(u => u.id === recevant)

    return (
        <div className="space-y-8">
            {/* UI - Hidden on Print */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                    <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-sonatrach-orange" />
                            Générer une Décharge
                        </h4>
                        <p className="text-sm text-[var(--color-muted)]">Configurez les équipements et les parties concernées.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parties */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Partie Cédante (Ancien propriétaire)</label>
                        <select
                            value={cedant}
                            onChange={(e) => setCedant(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        >
                            <option value="">-- Sélectionner un employé --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.department?.code || 'N/A'})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Partie Recevante (Nouveau propriétaire)</label>
                        <select
                            value={recevant}
                            onChange={(e) => setRecevant(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        >
                            <option value="">-- Sélectionner un employé --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.department?.code || 'N/A'})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium">Équipements à transférer</label>
                    <div className="flex gap-2">
                        <select
                            onChange={addAsset}
                            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                            defaultValue=""
                        >
                            <option value="" disabled>-- Ajouter un équipement --</option>
                            {availableAssets.map(a => (
                                <option key={a.id} value={a.id}>{a.tag} - {a.brand} {a.model}</option>
                            ))}
                        </select>
                    </div>

                    {selectedAssets.length > 0 && (
                        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Désignation</th>
                                        <th className="px-4 py-2 text-left font-medium">Marque</th>
                                        <th className="px-4 py-2 text-left font-medium">Modèle</th>
                                        <th className="px-4 py-2 text-left font-medium">N° Série</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {selectedAssets.map(asset => (
                                        <tr key={asset.id} className="hover:bg-[var(--color-bg)]">
                                            <td className="px-4 py-3">{asset.category}</td>
                                            <td className="px-4 py-3">{asset.brand}</td>
                                            <td className="px-4 py-3">{asset.model}</td>
                                            <td className="px-4 py-3">{asset.serialNumber}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => removeAsset(asset.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium">Observation générale</label>
                    <input
                        type="text"
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        placeholder="Ex: Transfert suite à un déménagement..."
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handlePrint}
                        disabled={selectedAssets.length === 0 || !cedant || !recevant}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors btn-press",
                            selectedAssets.length > 0 && cedant && recevant
                                ? "bg-sonatrach-green hover:bg-sonatrach-green-light text-white"
                                : "bg-[var(--color-bg)] text-[var(--color-muted)] cursor-not-allowed border border-[var(--color-border)]"
                        )}
                    >
                        <Printer className="w-4 h-4" />
                        Aperçu & Imprimer
                    </button>
                </div>
            </div>

            {/* Print Layout - Visible only during printing */}
            <div className="hidden print:block font-serif text-black bg-white" ref={componentRef}>
                <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-4">
                    <div>
                        <div className="text-xl font-bold tracking-wider mb-1">SONATRACH</div>
                        <div className="text-sm">ACTIVITÉ AVAL</div>
                        <div className="text-sm font-semibold mt-1">DIRECTION GÉNÉRALE</div>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold uppercase mb-2">Décharge de Matériel {observation && <span>/ {observation}</span>}</h1>
                    <div className="text-lg">Date : {format(new Date(), 'dd/MM/yyyy')}</div>
                </div>

                <div className="mb-8">
                    <p className="mb-4 text-justify leading-relaxed text-lg">
                        Je soussigné(e), déclare par la présente procéder au transfert des équipements désignés ci-dessous.
                    </p>
                </div>

                <table className="w-full border-collapse mb-12">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-2 border-black p-3 text-left font-bold w-12 text-center">N°</th>
                            <th className="border-2 border-black p-3 text-left font-bold">Désignation</th>
                            <th className="border-2 border-black p-3 text-left font-bold">Marque</th>
                            <th className="border-2 border-black p-3 text-left font-bold">Modèle</th>
                            <th className="border-2 border-black p-3 text-left font-bold">N° Série</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedAssets.map((asset, index) => (
                            <tr key={asset.id}>
                                <td className="border-2 border-black p-3 text-center">{index + 1}</td>
                                <td className="border-2 border-black p-3">{asset.category}</td>
                                <td className="border-2 border-black p-3">{asset.brand}</td>
                                <td className="border-2 border-black p-3">{asset.model}</td>
                                <td className="border-2 border-black p-3 font-mono">{asset.serialNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="grid grid-cols-2 gap-16 mt-16 text-center text-lg">
                    <div>
                        <h3 className="font-bold underline mb-4">La Partie Cédante</h3>
                        <div className="font-medium mb-1 uppercase">
                            {selectedCedantUser ? `${selectedCedantUser.firstName} ${selectedCedantUser.lastName}` : '....................'}
                        </div>
                        <div className="text-sm mb-16">
                            {selectedCedantUser?.department?.name || 'Structure: ....................'}
                        </div>
                        <div className="text-sm italic">(Signature)</div>
                    </div>
                    <div>
                        <h3 className="font-bold underline mb-4">La Partie Recevante</h3>
                        <div className="font-medium mb-1 uppercase">
                            {selectedRecevantUser ? `${selectedRecevantUser.firstName} ${selectedRecevantUser.lastName}` : '....................'}
                        </div>
                        <div className="text-sm mb-16">
                            {selectedRecevantUser?.department?.name || 'Structure: ....................'}
                        </div>
                        <div className="text-sm italic">(Signature)</div>
                    </div>
                </div>

                <div className="mt-24 text-center text-sm font-medium">
                    DOCUMENT CONFIDENTIEL - STRICTEMENT INTERNE
                </div>
            </div>
        </div>
    )
}
