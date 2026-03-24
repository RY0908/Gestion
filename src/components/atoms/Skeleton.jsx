import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-dark-elevated", className)}
            {...props}
        />
    )
}

Skeleton.propTypes = {
    className: PropTypes.string,
}
