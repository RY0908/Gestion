import { formatRelative, initials } from '@/lib/utils.js'
import PropTypes from 'prop-types'

export const ActivityFeed = ({ activities = [], isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-elevated shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 dark:bg-dark-elevated rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-dark-elevated rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!activities.length) {
        return <div className="text-sm text-[var(--color-muted)] text-center py-6">Aucune activité récente.</div>
    }

    return (
        <div className="relative border-l border-[var(--color-border)] ml-4 space-y-6">
            {activities.map((item, index) => (
                <div key={item.id || index} className="relative pl-6">
                    <div className="absolute -left-4 top-1 w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-xs font-medium text-sonatrach-green shadow-sm">
                        {initials(item.performedBy?.fullName || 'S Y')}
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text)]">
                            <span className="font-medium">{item.performedBy?.fullName || 'Système'}</span> a effectué
                            <span className="font-medium"> {item.action.replace('_', ' ').toLowerCase()}</span>
                        </p>
                        <p className="text-sm text-[var(--color-muted)] mt-0.5">{item.description}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-1.5">{item.performedAt ? formatRelative(item.performedAt) : 'Date inconnue'}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

ActivityFeed.propTypes = {
    activities: PropTypes.array,
    isLoading: PropTypes.bool,
}
