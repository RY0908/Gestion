import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trash2, FileText, User, Package, Link2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { useAssignment, useReturnAssignment, useDeleteAssignment } from '@/hooks/useAssignments.js'
import { api } from '@/lib/api/client.js'
import { formatDate, cn } from '@/lib/utils.js'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { ActivityFeed } from '@/components/organisms/ActivityFeed.jsx'

const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="w-4 h-4 text-sonatrach-green" />
            {title}
        </div>
        {children}
    </div>
)

const Field = ({ label, value }) => (
    <div>
        <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">{label}</div>
        <div className="text-sm font-medium text-[var(--color-text)]">{value || <span className="text-[var(--color-muted)] italic">—</span>}</div>
    </div>
)

export default function AssignmentDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { data: qData, isLoading, isError } = useAssignment(id)
    const { data: historyRes } = useQuery({
        queryKey: ['assignment-history', id],
        queryFn: () => api.get(`/assignments/${id}/history`),
        enabled: Boolean(id),
    })
    const returnMutation = useReturnAssignment()
    const deleteMutation = useDeleteAssignment()
    const assignment = qData?.data
    const assignmentHistory = historyRes?.data || []

    if (isLoading) {
        return <div className="p-8 max-w-5xl mx-auto space-y-4">
            <LoadingSkeleton variant="title" />
            <LoadingSkeleton variant="chart" />
        </div>
    }

    if (isError || !assignment) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <EmptyState
                    title="Affectation introuvable"
                    description="Cette affectation n'existe pas ou n'est plus accessible."
                    actionLabel="Retour aux affectations"
                    onAction={() => navigate('/assignments')}
                />
            </div>
        )
    }

    const isActive = assignment.status === 'ACTIVE'
    const canDelete = user?.role === 'ADMIN'

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/assignments')}
                        className="p-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-display font-bold">Affectation {assignment.id}</h1>
                        <p className="text-sm text-[var(--color-muted)]">
                            Créée le {formatDate(assignment.createdAt)} et liée à une demande confirmée.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isActive && (
                        <button
                            onClick={() => {
                                if (window.confirm('Enregistrer le retour de ce matériel ?')) {
                                    returnMutation.mutate(
                                        { id, data: { notes: 'Retour enregistré depuis la fiche d\'affectation' } },
                                        { onSuccess: () => navigate('/assignments') }
                                    )
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> Retourner
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => {
                                if (window.confirm("Supprimer cette trace d'affectation ?")) {
                                    deleteMutation.mutate(id, { onSuccess: () => navigate('/assignments') })
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Équipement" icon={Package}>
                    <Field label="Tag inventaire" value={assignment.asset?.assetTag} />
                    <Field label="Marque / modèle" value={`${assignment.asset?.brand || ''} ${assignment.asset?.model || ''}`.trim()} />
                    <Field label="Catégorie" value={assignment.asset?.category} />
                    <Field label="Statut" value={assignment.status === 'ACTIVE' ? 'Actif' : 'Retourné'} />
                    <Field label="Affecté le" value={formatDate(assignment.assignedAt)} />
                    {assignment.returnedAt && <Field label="Retourné le" value={formatDate(assignment.returnedAt)} />}
                </Card>

                <Card title="Bénéficiaire" icon={User}>
                    <Field label="Nom complet" value={assignment.employee?.fullName} />
                    <Field label="Poste" value={assignment.employee?.position} />
                    <Field label="Structure" value={assignment.employee?.structure} />
                    <Field label="Affecté par" value={assignment.assignedBy?.fullName} />
                </Card>

                <Card title="Demande source" icon={Link2}>
                    {assignment.sourceRequest ? (
                        <>
                            <Field label="N° demande" value={assignment.sourceRequest.requestNumber} />
                            <Field label="Statut demande" value={assignment.sourceRequest.status} />
                            <Field label="Demandeur" value={assignment.sourceRequest.requestedBy?.fullName} />
                            <Field label="Description" value={assignment.sourceRequest.description} />
                        </>
                    ) : (
                        <div className="text-sm text-[var(--color-muted)]">
                            Aucune demande liée pour cet enregistrement.
                        </div>
                    )}
                </Card>

                <Card title="Notes" icon={FileText}>
                    <Field label="Motif" value={assignment.reason} />
                    <Field label="Conditions de retour" value={assignment.returnCondition} />
                    <Field label="Notes retour" value={assignment.returnNotes} />
                </Card>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-4">
                <div className="text-sm font-semibold">Historique de l'affectation</div>
                {assignmentHistory.length > 0 ? (
                    <ActivityFeed activities={assignmentHistory} />
                ) : (
                    <EmptyState
                        title="Aucun historique"
                        description="Les événements liés à cette affectation apparaîtront ici."
                    />
                )}
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                <div className="text-sm font-semibold mb-3">Statut actuel</div>
                <div className={cn(
                    'inline-flex px-3 py-1 rounded-full text-xs font-semibold',
                    isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                )}>
                    {isActive ? 'ACTIVE' : assignment.status}
                </div>
            </div>
        </div>
    )
}
