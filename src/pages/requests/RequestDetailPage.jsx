import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useState } from 'react'
import { ArrowLeft, UserCheck, ShieldCheck, FileText, CheckCircle2, Clock, Package, XCircle, Wrench } from 'lucide-react'
import { useRequest } from '@/hooks/useRequests.js'
import { useAuthStore } from '@/store/authStore.js'
import { formatDate, cn, initials } from '@/lib/utils.js'
import { REQUEST_STATES } from '@/lib/constants.js'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { RequestActionModal } from './components/RequestActionModal.jsx'
import { getSpecificationEntries, summarizeSpecifications } from '@/lib/specifications.js'

const Panel = ({ title, icon: Icon, children }) => (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm uppercase font-bold text-[var(--color-muted)] tracking-wider flex items-center gap-2">
            <Icon className="w-4 h-4 text-sonatrach-green" /> {title}
        </h3>
        {children}
    </div>
)

const DetailGrid = ({ title, items }) => (
    <Panel title={title} icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
                <div key={item.label}>
                    <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">{item.label}</label>
                    <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm">
                        {item.value || <span className="italic text-[var(--color-muted)]">—</span>}
                    </div>
                </div>
            ))}
        </div>
    </Panel>
)

export default function RequestDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { data: qData, isLoading, isError } = useRequest(id)
    const request = qData?.data
    const [actionConfig, setActionConfig] = useState({ isOpen: false, type: null })

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center"><span className="animate-pulse text-[var(--color-muted)]">Chargement...</span></div>
    }

    if (isError || !request) {
        return <div className="p-8 text-center text-red-500">Demande introuvable ou accès non autorisé.</div>
    }

    const stateObj = REQUEST_STATES.find(s => s.value === request.status)
    const canManage = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR'
    const isMaintenanceRequest = String(request.assetCategory || request.objet || '').toUpperCase() === 'MAINTENANCE'
    const stockCount = request.stockAvailability?.availableCount || 0
    const hasStock = isMaintenanceRequest
        ? Boolean(request.maintenanceAsset?.assetId)
        : request.stockAvailability?.hasStock
    const availabilityLabel = isMaintenanceRequest ? 'Actif concerné' : 'Disponibilité en stock'
    const availabilityValue = isMaintenanceRequest
        ? (request.maintenanceAsset?.assetTag || 'Aucun actif sélectionné')
        : (hasStock ? `${stockCount} équipement(s) disponible(s)` : 'Aucun équipement disponible')
    const availabilityTone = isMaintenanceRequest
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : (hasStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')
    const requestSpecs = getSpecificationEntries(request.assetCategory || request.objet, request.specifications, 'request')
    const requestSpecSummary = summarizeSpecifications(request.assetCategory || request.objet, request.specifications, 'request')

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-display font-bold">{request.requestNumber}</h1>
                            <span className={cn("px-2.5 py-1 rounded text-xs font-semibold border", stateObj?.color)}>
                                {stateObj?.label || request.status}
                            </span>
                            <span className={cn(
                                'px-2.5 py-1 rounded text-xs font-semibold border',
                                request.priority === 'URGENT' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20' :
                                request.priority === 'HIGH' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20' :
                                request.priority === 'MEDIUM' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20' :
                                'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-800'
                            )}>
                                {request.priority}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--color-muted)] mt-1">Créée le {formatDate(request.createdAt)}</p>
                    </div>
                </div>

                {canManage && request.status === 'PENDING' && (
                    <div className="flex gap-2">
                            <button
                                onClick={() => setActionConfig({ isOpen: true, type: 'accept' })}
                                disabled={!hasStock}
                                className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={request.assetCategory === 'MAINTENANCE'
                                    ? 'Créer le ticket de maintenance'
                                    : 'Accepter la demande'}
                            >
                            <UserCheck className="w-4 h-4" /> {request.assetCategory === 'MAINTENANCE' ? 'Créer ticket' : 'Accepter'}
                        </button>
                        <button
                            onClick={() => setActionConfig({ isOpen: true, type: 'reject' })}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            <XCircle className="w-4 h-4" /> Refuser
                        </button>
                    </div>
                )}

                {canManage && request.status === 'ASSIGNED' && (
                    <button
                        onClick={() => navigate('/assignments', { state: { requestId: request.id } })}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-sm font-medium transition-colors"
                    >
                        <UserCheck className="w-4 h-4 text-sonatrach-green" /> Créer l'affectation
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Panel title="Informations" icon={FileText}>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">Catégorie / Objet</label>
                                <AssetTypeBadge category={request.assetCategory || request.objet} />
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">Motif de la demande</label>
                                <div className="p-4 bg-gray-50 dark:bg-dark-elevated rounded-lg text-sm text-[var(--color-text)] leading-relaxed border border-[var(--color-border)]">
                                    {request.description || <span className="italic text-gray-400">Aucune description fournie.</span>}
                                </div>
                            </div>

                            <div>
                        <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">{availabilityLabel}</label>
                        <div className={cn(
                            'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold',
                            availabilityTone
                        )}>
                            <Package className="w-4 h-4" />
                            {availabilityValue}
                        </div>
                        {isMaintenanceRequest && request.maintenanceAsset?.assetStatus && (
                            <div className="mt-2 text-xs text-[var(--color-muted)]">
                                Statut de l’actif: {request.maintenanceAsset.assetStatus}
                            </div>
                        )}
                    </div>

                            {requestSpecs.some(spec => spec.value) ? (
                                <>
                                    <DetailGrid
                                        title="Spécifications demandées"
                                        items={requestSpecs.map(spec => ({
                                            label: spec.label,
                                            value: spec.value,
                                        }))}
                                    />
                                    {requestSpecSummary && (
                                        <div className="text-xs text-[var(--color-muted)]">
                                            {requestSpecSummary}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-dark-elevated rounded-lg text-sm text-[var(--color-muted)] border border-[var(--color-border)]">
                                    Aucune spécification détaillée n’a été renseignée pour cette demande.
                                </div>
                            )}

                            {request.notes && (
                                <div>
                                    <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">Notes</label>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800/30 rounded-lg text-sm leading-relaxed">
                                        {request.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>

                    {request.history?.length > 0 && (
                        <Panel title="Historique d'Audit" icon={Clock}>
                            <div className="relative border-l-2 border-[var(--color-border)] ml-3 space-y-8 pl-6 pb-2">
                                {request.history.map((log, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative"
                                    >
                                        <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[var(--color-bg)] border-2 border-sonatrach-green ring-4 ring-[var(--color-bg)]" />
                                        <div className="text-sm font-medium text-[var(--color-text)]">
                                            {log.action} <span className="text-xs text-[var(--color-muted)] ml-2 font-normal">{new Date(log.date).toLocaleString('fr-FR')}</span>
                                        </div>
                                        <div className="text-sm text-[var(--color-muted)] mt-1">{log.description}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] font-bold">
                                                {initials(log.user)}
                                            </div>
                                            Par {log.user}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Panel>
                    )}
                </div>

                <div className="space-y-6">
                    <Panel title="Demandeur" icon={ShieldCheck}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                {initials(request.requestedBy?.fullName || 'I N')}
                            </div>
                            <div>
                                <div className="font-medium text-[var(--color-text)]">{request.requestedBy?.fullName}</div>
                                <div className="text-xs text-[var(--color-muted)]">{request.requestedBy?.position || 'Employé'}</div>
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Affectation" icon={UserCheck}>
                        {request.assignedTo ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                                    {initials(request.assignedTo?.fullName)}
                                </div>
                                <div>
                                    <div className="font-medium text-[var(--color-text)]">{request.assignedTo?.fullName}</div>
                                    <div className="text-xs text-[var(--color-muted)] flex items-center gap-1 mt-0.5">
                                        <ShieldCheck className="w-3 h-3" /> Technicien assigné
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-4 bg-gray-50 dark:bg-dark-elevated rounded-lg border border-dashed border-[var(--color-border)]">
                                <span className="text-sm text-[var(--color-muted)]">Non assigné</span>
                            </div>
                        )}

                        {request.assignedBy && (
                            <div className="pt-3 border-t border-[var(--color-border)] mt-3">
                                <div className="text-xs text-[var(--color-muted)]">
                                    Assigné par <span className="font-medium text-[var(--color-text)]">{request.assignedBy.fullName}</span>
                                </div>
                            </div>
                        )}
                    </Panel>

                    {request.maintenanceTicket && (
                        <Panel title="Ticket de maintenance" icon={Wrench}>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-[var(--color-muted)]">Ticket</span>
                                    <div className="font-medium">{request.maintenanceTicket.id}</div>
                                </div>
                                <div>
                                    <span className="text-[var(--color-muted)]">Statut</span>
                                    <div className="font-medium">{request.maintenanceTicket.status}</div>
                                </div>
                                <div>
                                    <span className="text-[var(--color-muted)]">Équipement</span>
                                    <div className="font-medium">
                                        {request.maintenanceTicket.asset?.assetTag} - {request.maintenanceTicket.asset?.brand} {request.maintenanceTicket.asset?.model}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    )}

                    {request.resolvedAt && (
                        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-5 shadow-sm">
                            <h3 className="text-xs uppercase font-bold text-green-800 dark:text-green-400 tracking-wider mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Date de traitement
                            </h3>
                            <div className="text-sm text-green-900 dark:text-green-300 font-medium">
                                {new Date(request.resolvedAt).toLocaleString('fr-FR')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {actionConfig.isOpen && (
                <RequestActionModal
                    isOpen={actionConfig.isOpen}
                    onClose={() => setActionConfig({ isOpen: false, type: null })}
                    request={request}
                    actionType={actionConfig.type}
                />
            )}
        </div>
    )
}
