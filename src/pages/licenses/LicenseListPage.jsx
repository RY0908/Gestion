import { useState } from 'react'
import { useLicenses, useDeleteLicense } from '@/hooks/useLicenses.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { KpiCard } from '@/components/atoms/KpiCard.jsx'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { formatDate, formatCurrency } from '@/lib/utils.js'
import { Key, AlertTriangle, ShieldCheck, Plus, Edit2, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import { LicenseFormModal } from './components/LicenseFormModal.jsx'

const COMPLIANCE_ICONS = {
    COMPLIANT: { emoji: '✅', label: 'Conforme', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
    OVER_LICENSED: { emoji: '⚠️', label: 'Sous-utilisée', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
    NON_COMPLIANT: { emoji: '❌', label: 'Non conforme', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
    UNKNOWN: { emoji: '💤', label: 'Non défini', bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
}

const UTIL_COLORS = ['#1B6B3A', '#e5e7eb']

export default function LicenseListPage() {
    const { data, isLoading } = useLicenses({})
    const deleteMutation = useDeleteLicense()
    const licenses = data?.data || []

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedLicense, setSelectedLicense] = useState(null)

    const handleEdit = (license) => {
        setSelectedLicense(license)
        setIsModalOpen(true)
    }

    const handleDelete = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette licence ?")) {
            deleteMutation.mutate(id)
        }
    }

    const openNewModal = () => {
        setSelectedLicense(null)
        setIsModalOpen(true)
    }

    // SAM Metrics
    const metrics = (() => {
        const total = licenses.length
        const now = new Date()
        const in30 = new Date(now.getTime() + 30 * 86400000)
        const expiring = licenses.filter(l => l.expiryDate && new Date(l.expiryDate) <= in30 && new Date(l.expiryDate) > now).length
        const expired = licenses.filter(l => l.expiryDate && new Date(l.expiryDate) <= now).length
        const totalSeats = licenses.reduce((s, l) => s + (l.totalSeats || 0), 0)
        const usedSeats = licenses.reduce((s, l) => s + (l.usedSeats || 0), 0)
        const utilization = totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0
        const compliant = licenses.filter(l => l.complianceStatus === 'COMPLIANT').length
        const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0
        return { total, expiring, expired, utilization, complianceRate, totalSeats, usedSeats }
    })()

    const utilizationData = [
        { name: 'Utilisé', value: metrics.usedSeats },
        { name: 'Disponible', value: Math.max(0, metrics.totalSeats - metrics.usedSeats) }
    ]

    const columns = [
        {
            accessorKey: 'softwareName',
            header: 'Logiciel',
            cell: info => (
                <div>
                    <div className="font-medium">{info.getValue()}</div>
                    <div className="text-xs text-[var(--color-muted)]">{info.row.original.vendor}</div>
                </div>
            )
        },
        {
            accessorKey: 'licenseKey',
            header: 'Clé de licence',
            cell: info => <CopyableText value={info.getValue()} className="font-mono text-xs" />
        },
        {
            accessorFn: row => `${row.usedSeats || 0}/${row.totalSeats || 0}`,
            id: 'seats',
            header: 'Postes',
            cell: info => {
                const lic = info.row.original
                const used = lic.usedSeats || 0
                const total = lic.totalSeats || 1
                const pct = Math.round((used / total) * 100)
                const isOver = used > total
                return (
                    <div className="min-w-[100px]">
                        <div className="flex justify-between text-xs mb-1">
                            <span className={isOver ? 'text-red-500 font-bold' : ''}>{used}/{total}</span>
                            <span className={isOver ? 'text-red-500' : 'text-[var(--color-muted)]'}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-sonatrach-green'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'cost',
            header: 'Coût',
            cell: info => formatCurrency(info.getValue())
        },
        {
            accessorKey: 'expiryDate',
            header: 'Expiration',
            cell: info => {
                const d = info.getValue()
                if (!d) return <span className="text-[var(--color-muted)]">—</span>
                const expired = new Date(d) < new Date()
                return (
                    <span className={expired ? 'text-red-500 font-semibold flex items-center gap-2' : ''}>
                        {formatDate(d)}
                        {expired && <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Expiré</span>}
                    </span>
                )
            }
        },
        {
            accessorKey: 'complianceStatus',
            header: 'Conformité',
            cell: info => {
                const status = info.getValue()
                const config = COMPLIANCE_ICONS[status] || COMPLIANCE_ICONS.UNKNOWN
                return (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                        <span>{config.emoji}</span> {config.label}
                    </span>
                )
            }
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const rowLic = info.row.original
                return (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleEdit(rowLic)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Modifier"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(rowLic.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Gestion des Licences"
                count={metrics.total}
                description="Software Asset Management — Suivez les licences et la conformité."
            >
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Licence
                </button>
            </PageHeader>

            {/* SAM KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Total Licences"
                    value={metrics.total}
                    icon={Key}
                    accentColor="#3b82f6"
                    isLoading={isLoading}
                />
                <KpiCard
                    label="Expirent < 30j"
                    value={metrics.expiring + metrics.expired}
                    icon={AlertTriangle}
                    accentColor="#ef4444"
                    trend={metrics.expiring + metrics.expired > 0 ? -1 : 1}
                    trendLabel={metrics.expired > 0 ? `${metrics.expired} expirée(s)` : 'Aucune urgence'}
                    isLoading={isLoading}
                />
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 shadow-sm flex items-center gap-4" style={{ borderLeft: '3px solid #DDA73B' }}>
                    <div className="w-14 h-14 shrink-0">
                        <PieChart width={56} height={56}>
                            <Pie data={utilizationData} cx={28} cy={28} innerRadius={16} outerRadius={24} paddingAngle={2} dataKey="value" strokeWidth={0}>
                                {utilizationData.map((_, i) => <Cell key={i} fill={UTIL_COLORS[i]} />)}
                            </Pie>
                        </PieChart>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Utilisation</p>
                        <p className="text-2xl font-display font-bold">{metrics.utilization}%</p>
                        <p className="text-[10px] text-[var(--color-muted)]">{metrics.usedSeats}/{metrics.totalSeats} postes</p>
                    </div>
                </div>
                <KpiCard
                    label="Conformité"
                    value={metrics.complianceRate}
                    icon={ShieldCheck}
                    accentColor="#1B6B3A"
                    trend={metrics.complianceRate >= 80 ? 1 : -1}
                    trendLabel={metrics.complianceRate >= 80 ? 'Bon niveau' : 'À améliorer'}
                    suffix="%"
                    isLoading={isLoading}
                />
            </div>

            {/* License Table */}
            {licenses.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={licenses}
                    isLoading={isLoading}
                    rowClassName="group"
                />
            ) : !isLoading && (
                <EmptyState
                    icon={Key}
                    title="Aucune licence enregistrée"
                    description="Commencez par ajouter vos licences logicielles."
                    actionLabel="Ajouter une licence"
                    onAction={openNewModal}
                />
            )}

            <LicenseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                license={selectedLicense}
            />
        </div>
    )
}

