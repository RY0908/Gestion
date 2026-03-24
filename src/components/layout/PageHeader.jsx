import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'

export const PageHeader = ({ title, count, description, children, className }) => {
    return (
        <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4', className)}>
            <div>
                <h1 className="text-2xl font-display font-bold flex items-center gap-3">
                    {title}
                    {typeof count === 'number' && (
                        <span className="text-sm font-medium text-[var(--color-muted)] bg-[var(--color-bg)] px-2.5 py-1 rounded-full">
                            {count.toLocaleString('fr-DZ')}
                        </span>
                    )}
                </h1>
                {description && (
                    <p className="text-[var(--color-muted)] mt-1">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2 shrink-0">
                    {children}
                </div>
            )}
        </div>
    )
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    count: PropTypes.number,
    description: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
}
