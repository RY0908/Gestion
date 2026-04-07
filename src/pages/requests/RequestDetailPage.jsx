import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useRequest } from '@/hooks/useRequests.js'
import { useAuthStore } from '@/store/authStore.js'
import { formatDate, cn, initials } from '@/lib/utils.js'
import { REQUEST_STATES } from '@/lib/constants.js'
import { ArrowLeft, Edit3, UserCheck, ShieldCheck, FileText, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react'
import { AssetTypeBadge } from '@/components/atoms/AssetTypeBadge.jsx'
import { RequestActionModal } from './components/RequestActionModal.jsx'
import { useState } from 'react'

export default function RequestDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, canDo } = useAuthStore()
    const { data: qData, isLoading, isError } = useRequest(id)
    const request = qData?.data

    const [actionConfig, setActionConfig] = useState({ isOpen: false, type: null })

    const openAction = (type) => setActionConfig({ isOpen: true, type })
    const closeAction = () => setActionConfig({ isOpen: false, type: null })

    if (isLoading) return <div className="p-8 flex items-center justify-center"><span className="animate-pulse text-[var(--color-muted)]">Chargement...</span></div>
    if (isError || !request) return <div className="p-8 text-center text-red-500">Demande introuvable ou accès non autorisé.</div>

    const stateObj = REQUEST_STATES.find(s => s.value === request.status)
    const isTechOrAdmin = user.role === 'TECHNICIAN' || user.role === 'ADMIN' || user.role === 'SUPERVISOR'

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-display font-bold">{request.requestNumber}</h1>
                            <span className={cn("px-2.5 py-1 rounded text-xs font-semibold border", stateObj?.color)}>
                                {stateObj?.label || request.status}
                            </span>
                            <span className={cn(
                                "px-2.5 py-1 rounded text-xs font-semibold border",
                                request.priority === 'URGENT' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20' :
                                    request.priority === 'HIGH' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20' :
                                        request.priority === 'MEDIUM' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20' :
                                            'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-800'
                            )}>
                                {request.priority} priorite
                            </span>
                        </div>
                        <p className="text-sm text-[var(--color-muted)] mt-1">
                            Créée le {formatDate(request.createdAt)}
                        </p>
                    </div>
                </div>

                {isTechOrAdmin && request.status !== 'RESOLVED' && (
                    <div className="flex gap-2">
                        {(user.role === 'SUPERVISOR' || user.role === 'ADMIN') && request.status === 'PENDING' && (
                            <button
                                onClick={() => openAction('ASSIGN')}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-sm font-medium transition-colors"
                            >
                                <UserCheck className="w-4 h-4 text-blue-500" /> Assigner
                            </button>
                        )}
                        {(user.role === 'TECHNICIAN' || user.role === 'ADMIN') && request.status === 'ASSIGNED' && (
                            <button
                                onClick={() => openAction('RESOLVE')}
                                className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Marquer comme résolu
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-sonatrach-green" /> Informations
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">Catégorie / Objet</label>
                                <div className="text-[var(--color-text)] font-medium">
                                    <AssetTypeBadge category={request.objet} />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">Motif de la demande</label>
                                <div className="p-4 bg-gray-50 dark:bg-dark-elevated rounded-lg text-sm text-[var(--color-text)] leading-relaxed border border-[var(--color-border)]">
                                    {request.description || <span className="italic text-gray-400">Aucune description fournie.</span>}
                                </div>
                            </div>

                            {request.notes && (
                                <div>
                                    <label className="text-xs uppercase font-bold text-[var(--color-muted)] tracking-wider block mb-1">Notes de Résolution</label>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800/30 rounded-lg text-sm leading-relaxed">
                                        {request.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline History */}
                    {request.history?.length > 0 && (
                        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" /> Historique d'Audit
                            </h2>
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
                        </div>
                    )}
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="text-sm uppercase font-bold text-[var(--color-muted)] tracking-wider">Demandeur</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                {initials(request.requestedBy?.fullName || 'I N')}
                            </div>
                            <div>
                                <div className="font-medium text-[var(--color-text)]">{request.requestedBy?.fullName}</div>
                                <div className="text-xs text-[var(--color-muted)]">{request.requestedBy?.position || 'Employé'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="text-sm uppercase font-bold text-[var(--color-muted)] tracking-wider">Assignation</h3>
                        {request.assignedTo ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                                    {initials(request.assignedTo?.fullName)}
                                </div>
                                <div>
                                    <div className="font-medium text-[var(--color-text)]">{request.assignedTo?.fullName}</div>
                                    <div className="text-xs text-[var(--color-muted)] flex items-center gap-1 mt-0.5">
                                        <ShieldCheck className="w-3 h-3" /> Technicien Assigné
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
                    </div>
                    
                    {request.resolvedAt && (
                        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-5 shadow-sm">
                            <h3 className="text-xs uppercase font-bold text-green-800 dark:text-green-400 tracking-wider mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Date de résolution
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
                    onClose={closeAction}
                    request={request}
                    actionType={actionConfig.type}
                />
            )}
        </div>
    )
}
