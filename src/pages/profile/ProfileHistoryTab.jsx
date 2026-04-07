import { useAssignments } from '@/hooks/useAssignments.js'
import { cn } from '@/lib/utils.js'
import { ArrowRight, CheckCircle, History } from 'lucide-react'

const CONDITION_CONFIG = {
    GOOD: { label: 'Bon état', color: 'text-sonatrach-green', bg: 'bg-green-50 dark:bg-green-900/20' },
    DAMAGED: { label: 'Endommagé', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    BROKEN: { label: 'Hors service', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
}

export default function ProfileHistoryTab({ userId }) {
    const { data, isLoading } = useAssignments({ userId, status: 'RETURNED', pageSize: 50 })
    const history = data?.data || []

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0" />
                        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                            <div className="h-4 w-40 bg-[var(--color-bg)] rounded mb-2" />
                            <div className="h-3 w-64 bg-[var(--color-bg)] rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-[var(--color-muted)]" />
                </div>
                <h3 className="font-semibold mb-1">Aucun historique</h3>
                <p className="text-sm text-[var(--color-muted)]">Votre historique d'affectations matériel apparaîtra ici.</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <p className="text-sm text-[var(--color-muted)] mb-4">
                {history.length} affectation{history.length > 1 ? 's' : ''} passée{history.length > 1 ? 's' : ''}
            </p>
            <div className="relative">
                {/* Timeline vertical line */}
                <div className="absolute left-5 top-5 bottom-5 w-px bg-[var(--color-border)]" />

                <div className="space-y-3">
                    {history.map(asg => {
                        const asset = asg.asset
                        const cond = CONDITION_CONFIG[asg.returnCondition] || null
                        const daysHeld = asg.assignedAt && asg.returnedAt
                            ? Math.round((new Date(asg.returnedAt) - new Date(asg.assignedAt)) / (1000 * 60 * 60 * 24))
                            : null

                        return (
                            <div key={asg.id} className="flex gap-4">
                                {/* Timeline dot */}
                                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] flex items-center justify-center shrink-0 z-10">
                                    <CheckCircle className="w-4 h-4 text-[var(--color-muted)]" />
                                </div>

                                {/* Content card */}
                                <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm hover:border-sonatrach-green/30 transition-colors mb-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <div className="font-semibold text-sm">{asset?.marque} {asset?.modele || '—'}</div>
                                            <div className="text-xs text-[var(--color-muted)] font-mono">
                                                {asset?.codeInventaire || asset?.code_inventaire || asset?.inventoryCode || '—'}
                                            </div>
                                        </div>
                                        {cond && (
                                            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0', cond.bg, cond.color)}>
                                                {cond.label}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                        <span>{asg.assignedAt ? new Date(asg.assignedAt).toLocaleDateString('fr-FR') : '—'}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span>{asg.returnedAt ? new Date(asg.returnedAt).toLocaleDateString('fr-FR') : '—'}</span>
                                        {daysHeld !== null && (
                                            <span className="text-[var(--color-border)]">• {daysHeld} jour{daysHeld > 1 ? 's' : ''}</span>
                                        )}
                                    </div>

                                    {asg.reason && (
                                        <p className="text-xs text-[var(--color-muted)] mt-1.5 italic">"{asg.reason}"</p>
                                    )}
                                    {asg.returnNotes && (
                                        <p className="text-xs text-[var(--color-muted)] mt-1">📝 {asg.returnNotes}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
