import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'

const variants = {
    text: 'h-4 rounded',
    title: 'h-6 w-48 rounded',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-28 rounded-lg',
    chart: 'h-[250px] rounded-xl',
    row: 'h-12 rounded',
}

export const LoadingSkeleton = ({ variant = 'text', count = 1, className }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'skeleton-shimmer',
                        variants[variant] || variants.text,
                        className
                    )}
                />
            ))}
        </>
    )
}

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="flex-1 h-4 skeleton-shimmer rounded" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3 border-b border-[var(--color-border)]">
                    {Array.from({ length: cols }).map((_, j) => (
                        <div key={j} className="flex-1 h-4 skeleton-shimmer rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                    ))}
                </div>
            ))}
        </div>
    )
}

export const DashboardSkeleton = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <LoadingSkeleton key={i} variant="card" />
                ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <LoadingSkeleton variant="chart" />
                </div>
                <LoadingSkeleton variant="chart" />
            </div>
        </div>
    )
}

LoadingSkeleton.propTypes = {
    variant: PropTypes.oneOf(Object.keys(variants)),
    count: PropTypes.number,
    className: PropTypes.string,
}

TableSkeleton.propTypes = {
    rows: PropTypes.number,
    cols: PropTypes.number,
}
