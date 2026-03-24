import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'

const PRIORITY_MAP = {
    CRITICAL: { label: 'Critique', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', emoji: '🔴', pulse: true },
    HIGH: { label: 'Haute', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', emoji: '🟠' },
    MEDIUM: { label: 'Moyenne', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', emoji: '🔵' },
    LOW: { label: 'Basse', bg: 'bg-gray-50 dark:bg-gray-800/40', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', emoji: '⚪' },
    URGENT: { label: 'Urgente', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', emoji: '🔴', pulse: true },
}

export const PriorityBadge = ({ priority, showEmoji = true, className }) => {
    const config = PRIORITY_MAP[priority] || PRIORITY_MAP.MEDIUM

    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border',
            config.bg, config.text, config.border,
            config.pulse && 'pulse-critical',
            className
        )}>
            {showEmoji && <span className="text-[10px]">{config.emoji}</span>}
            {config.label}
        </span>
    )
}

PriorityBadge.propTypes = {
    priority: PropTypes.string.isRequired,
    showEmoji: PropTypes.bool,
    className: PropTypes.string,
}
