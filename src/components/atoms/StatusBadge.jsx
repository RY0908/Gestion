import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'

const STATUS_MAP = {
  IN_STOCK: {
    label: 'En stock',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  ASSIGNED: {
    label: 'Affecte',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  IN_MAINTENANCE: {
    label: 'En maintenance',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  RETIRED: {
    label: 'Hors service',
    bg: 'bg-gray-100 dark:bg-gray-800/40',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
  LOST: {
    label: 'Perdu/vole',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    pulse: true,
  },
  RESERVED: {
    label: 'Reserve',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  SCHEDULED: {
    label: 'Planifie',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  IN_PROGRESS: {
    label: 'En cours',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Termine',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  PENDING: {
    label: 'En attente',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  RESOLVED: {
    label: 'Resolu',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  REJECTED: {
    label: 'Rejete',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  CANCELLED: {
    label: 'Annule',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  ACTIVE: {
    label: 'Actif',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  RETURNED: {
    label: 'Retourne',
    bg: 'bg-gray-100 dark:bg-gray-800/40',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
  COMPLIANT: {
    label: 'Conforme',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  OVER_LICENSED: {
    label: 'Sous-utilisee',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  UNDER_LICENSED: {
    label: 'Sous-dimensionnee',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  EXPIRED: {
    label: 'Expiree',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    pulse: true,
  },
}

export const StatusBadge = ({ status, label: customLabel, className }) => {
  const config = STATUS_MAP[status]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        config.bg,
        config.text,
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          config.dot,
          config.pulse && 'pulse-critical',
        )}
      />
      {customLabel || config.label}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
}
