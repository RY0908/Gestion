import PropTypes from 'prop-types'
import { PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export const EmptyState = ({
    icon: Icon = PackageOpen,
    title = 'Aucun résultat',
    description = 'Aucun élément à afficher pour le moment.',
    actionLabel,
    onAction,
    className
}) => {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-16 px-6 text-center animate-slide-up',
            className
        )}>
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mb-5">
                <Icon className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
            <p className="text-sm text-[var(--color-muted)] max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-5 py-2.5 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string,
    description: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
    className: PropTypes.string,
}
