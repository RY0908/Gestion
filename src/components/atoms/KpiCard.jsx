import PropTypes from 'prop-types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils.js'

export const KpiCard = ({ label, value, unit, trend, trendLabel, icon: Icon, accentColor, isLoading }) => {
    const reducedMotion = useReducedMotion()
    const motionValue = useMotionValue(0)
    const spring = useSpring(motionValue, { stiffness: 60, damping: 15 })
    const displayValue = useTransform(spring, v => Math.round(v).toLocaleString('fr-DZ'))

    useEffect(() => {
        if (!reducedMotion && typeof value === 'number') motionValue.set(value)
    }, [value, reducedMotion])

    if (isLoading) return <div className="h-28 rounded-lg bg-gray-100 dark:bg-dark-elevated animate-pulse" />

    const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
    const trendColor = trend > 0 ? 'text-sonatrach-green' : trend < 0 ? 'text-red-500' : 'text-gray-400'

    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 shadow-sm card-hover" style={{ borderLeft: `3px solid ${accentColor || 'var(--color-border)'}` }}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1">{label}</p>
                    <div className="flex items-baseline gap-1">
                        {reducedMotion
                            ? <span className="text-3xl font-display font-bold">{value?.toLocaleString('fr-DZ')}</span>
                            : <motion.span className="text-3xl font-display font-bold">{displayValue}</motion.span>
                        }
                        {unit && <span className="text-sm text-[var(--color-muted)]">{unit}</span>}
                    </div>
                    {trendLabel && (
                        <div className={cn('flex items-center gap-1 mt-1.5 text-xs', trendColor)}>
                            <TrendIcon className="w-3 h-3" />
                            <span>{trendLabel}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className="p-2.5 rounded-lg shrink-0" style={{ backgroundColor: accentColor ? `${accentColor}1A` : 'var(--color-bg)' }}>
                        <Icon className="w-5 h-5" style={{ color: accentColor || 'var(--color-muted)' }} />
                    </div>
                )}
            </div>
        </div>
    )
}

KpiCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number,
    unit: PropTypes.string,
    trend: PropTypes.number,
    trendLabel: PropTypes.string,
    icon: PropTypes.elementType,
    accentColor: PropTypes.string,
    isLoading: PropTypes.bool,
}
