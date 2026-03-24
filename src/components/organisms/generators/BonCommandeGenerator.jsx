import { useState, useRef } from 'react'
import { Printer, Calendar, ListPlus, Trash2, Building, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { api as apiClient } from '@/lib/api/client'

// Mock suppliers from constants mapped manually
const SUPPLIERS = [
    { code: 'DSYS', name: 'DOCU_SYS Algérie' },
    { code: 'FCORP', name: 'FURNI_CORP Industries' },
    { code: 'PPRO', name: 'PRINT_PRO Algérie' },
    { code: 'TCS', name: 'TECH_CORP Solutions' },
    { code: 'CSYS', name: 'COMPU_SYS Algérie' }
]

export function BonCommandeGenerator() {
    const componentRef = useRef()

    const [supplier, setSupplier] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [compteGeneral, setCompteGeneral] = useState('')
    const [compteAnalytique, setCompteAnalytique] = useState('')
    const [requestedBy, setRequestedBy] = useState('')
    const [approvedBy, setApprovedBy] = useState('')

    const [items, setItems] = useState([])
    const [newItem, setNewItem] = useState({ code: '', designation: '', quantity: 1, unitPrice: 0 })

    const handlePrint = () => {
        window.print()
    }

    const addItem = () => {
        if (!newItem.designation || newItem.quantity < 1 || newItem.unitPrice <= 0) {
            toast.error("Veuillez remplir les champs obligatoires de l'équipement")
            return
        }

        setItems([
            ...items,
            { ...newItem, total: newItem.quantity * newItem.unitPrice }
        ])

        setNewItem({ code: '', designation: '', quantity: 1, unitPrice: 0 })
    }

    const removeItem = (index) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const selectedSupplier = SUPPLIERS.find(s => s.code === supplier)

    const calculateTotalHT = () => items.reduce((sum, item) => sum + item.total, 0)
    const tvaAmount = calculateTotalHT() * 0.19
    const totalTTC = calculateTotalHT() + tvaAmount

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount)
    }

    return (
        <div className="space-y-8">
            {/* UI - Hidden on Print */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                    <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-sonatrach-orange" />
                            Créer un Bon de Commande
                        </h4>
                        <p className="text-sm text-[var(--color-muted)]">Remplissez les informations fournisseur et les équipements requis.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations générales */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Fournisseur</label>
                        <select
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        >
                            <option value="">-- Sélectionner un fournisseur --</option>
                            {SUPPLIERS.map(s => (
                                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Adresse de livraison</label>
                        <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Ex: Siège Aval - Zone Industrielle"
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--color-muted)]">Compte Général (Imputation)</label>
                        <input value={compteGeneral} onChange={e => setCompteGeneral(e.target.value)} placeholder="CG-..." className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--color-muted)]">Compte Analytique</label>
                        <input value={compteAnalytique} onChange={e => setCompteAnalytique(e.target.value)} placeholder="CA-..." className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--color-muted)]">Demandé par (Structure)</label>
                        <input value={requestedBy} onChange={e => setRequestedBy(e.target.value)} placeholder="DPT IT..." className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--color-muted)]">Approuvé par (Direction)</label>
                        <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="DSI..." className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:border-sonatrach-green outline-none" />
                    </div>
                </div>

                {/* Ajout d'articles */}
                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                    <label className="block text-sm font-medium">Articles commandés</label>
                    <div className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-12 gap-2">
                            <div className="col-span-2">
                                <input type="text" placeholder="Code (Optionnel)" value={newItem.code} onChange={(e) => setNewItem({ ...newItem, code: e.target.value })} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none" />
                            </div>
                            <div className="col-span-6">
                                <input type="text" placeholder="Désignation *" value={newItem.designation} onChange={(e) => setNewItem({ ...newItem, designation: e.target.value })} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none" />
                            </div>
                            <div className="col-span-2">
                                <input type="number" min="1" placeholder="Qté" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none" />
                            </div>
                            <div className="col-span-2">
                                <input type="number" min="0" placeholder="Prix Unitaire *" value={newItem.unitPrice === 0 ? '' : newItem.unitPrice} onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none" />
                            </div>
                        </div>
                        <button onClick={addItem} className="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sonatrach-green hover:bg-sonatrach-green/10 transition-colors">
                            <ListPlus className="w-5 h-5" />
                        </button>
                    </div>

                    {items.length > 0 && (
                        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Code</th>
                                        <th className="px-4 py-2 text-left font-medium">Désignation</th>
                                        <th className="px-4 py-2 text-right font-medium">Qté</th>
                                        <th className="px-4 py-2 text-right font-medium">Prix U. (DZD)</th>
                                        <th className="px-4 py-2 text-right font-medium">Total HT</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-[var(--color-bg)]">
                                            <td className="px-4 py-3">{item.code || '-'}</td>
                                            <td className="px-4 py-3">{item.designation}</td>
                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[var(--color-surface)]">
                                        <td colSpan="4" className="px-4 py-3 text-right font-semibold">Total Général TTC :</td>
                                        <td className="px-4 py-3 text-right font-bold text-sonatrach-orange">{formatCurrency(totalTTC)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handlePrint}
                        disabled={items.length === 0 || !supplier || !deliveryAddress}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors btn-press",
                            items.length > 0 && supplier && deliveryAddress
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
                <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                    <div className="w-1/3">
                        <div className="text-xl font-bold tracking-wider mb-1">SONATRACH</div>
                        <div className="text-sm">Siège Principal</div>
                        <div className="text-sm font-semibold mt-1">NIF: 099916000942034</div>
                        <div className="text-sm">RC: 99B0016000-ALGER</div>
                    </div>

                    <div className="w-1/3 text-center">
                        <h1 className="text-3xl font-bold uppercase mb-2">BON DE COMMANDE</h1>
                        <div className="text-lg font-bold border-2 border-black inline-block px-4 py-1">N° CMD-{format(new Date(), 'yyyy/MM/dd-HHmm')}</div>
                    </div>

                    <div className="w-1/3 text-right">
                        <div className="border border-black p-3 inline-block text-left w-full h-full">
                            <div className="text-sm font-bold underline mb-1">FOURNISSEUR:</div>
                            <div className="font-bold">{selectedSupplier?.name}</div>
                            <div className="text-sm">Code: {selectedSupplier?.code}</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mb-8 text-sm">
                    <div>
                        <span className="font-bold underline">Date :</span> {format(new Date(), 'dd/MM/yyyy')}
                    </div>
                    <div>
                        <span className="font-bold underline">Adresse de Livraison :</span> {deliveryAddress}
                    </div>
                </div>

                <div className="flex justify-between mb-8 text-sm border-2 border-black p-2">
                    <div className="flex gap-12">
                        <div><span className="font-bold">Compte Général:</span> {compteGeneral || '................'}</div>
                        <div><span className="font-bold">Compte Analytique:</span> {compteAnalytique || '................'}</div>
                    </div>
                    <div>
                        <span className="font-bold">Facture Prochaine</span>
                    </div>
                </div>

                <table className="w-full border-collapse mb-8 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-2 border-black p-2 text-left font-bold w-16">CODE</th>
                            <th className="border-2 border-black p-2 text-left font-bold">DÉSIGNATION</th>
                            <th className="border-2 border-black p-2 text-center font-bold w-16">QTÉ</th>
                            <th className="border-2 border-black p-2 text-right font-bold w-32">PRIX U. (DZD)</th>
                            <th className="border-2 border-black p-2 text-right font-bold w-32">TOTAL HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="border-2 border-black p-2 font-mono text-center">{item.code}</td>
                                <td className="border-2 border-black p-2">{item.designation}</td>
                                <td className="border-2 border-black p-2 text-center">{item.quantity}</td>
                                <td className="border-2 border-black p-2 text-right">{new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2 }).format(item.unitPrice)}</td>
                                <td className="border-2 border-black p-2 text-right font-medium">{new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2 }).format(item.total)}</td>
                            </tr>
                        ))}
                        {/* Fill rows to make the table look official */}
                        {Array(Math.max(0, 5 - items.length)).fill(0).map((_, i) => (
                            <tr key={`fill-${i}`}>
                                <td className="border-2 border-black p-2 h-8"></td>
                                <td className="border-2 border-black p-2"></td>
                                <td className="border-2 border-black p-2"></td>
                                <td className="border-2 border-black p-2"></td>
                                <td className="border-2 border-black p-2"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-16">
                    <div className="w-1/3">
                        <table className="w-full border-collapse text-sm">
                            <tbody>
                                <tr>
                                    <td className="border-2 border-black p-2 font-bold bg-gray-100">TOTAL H.T</td>
                                    <td className="border-2 border-black p-2 text-right font-medium">{new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2 }).format(calculateTotalHT())}</td>
                                </tr>
                                <tr>
                                    <td className="border-2 border-black p-2 font-bold bg-gray-100">TVA (19%)</td>
                                    <td className="border-2 border-black p-2 text-right font-medium">{new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2 }).format(tvaAmount)}</td>
                                </tr>
                                <tr>
                                    <td className="border-2 border-black p-2 font-bold bg-gray-100">TOTAL T.T.C (DZD)</td>
                                    <td className="border-2 border-black p-2 text-right font-bold text-lg">{new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2 }).format(totalTTC)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-16 text-center text-sm">
                    <div>
                        <h3 className="font-bold mb-8">Demandé par (L'Utilisateur)</h3>
                        <div className="font-medium uppercase">
                            {requestedBy || 'Responsable de la Structure'}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-8">Approuvé par (Direction / Achats)</h3>
                        <div className="font-medium uppercase">
                            {approvedBy || 'Directeur Concerné'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
