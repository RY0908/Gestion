import PropTypes from "prop-types";
import { cn } from "@/lib/utils.js";

const STATUS_MAP = {
  // Asset statuses
  IN_STOCK: {
    label: "En stock",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  ASSIGNED: {
    label: "Affecté",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  IN_MAINTENANCE: {
    label: "En maintenance",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  RETIRED: {
    label: "Hors service",
    bg: "bg-gray-100 dark:bg-gray-800/40",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  LOST: {
    label: "Perdu/Volé",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    pulse: true,
  },
  RESERVED: {
    label: "Réservé",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  ORDERED: {
    label: "En commande",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  // Maintenance statuses
  PENDING: {
    label: "En attente",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  IN_PROGRESS: {
    label: "En cours",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Terminé",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  // Request statuses
  APPROVED: {
    label: "Approuvé",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  FULFILLED: {
    label: "Satisfait",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Refusé",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  // Assignment statuses
  ACTIVE: {
    label: "Actif",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  RETURNED: {
    label: "Retourné",
    bg: "bg-gray-100 dark:bg-gray-800/40",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  // License compliance
  COMPLIANT: {
    label: "Conforme",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  OVER_LICENSED: {
    label: "Sous-utilisée",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  NON_COMPLIANT: {
    label: "Non conforme",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    pulse: true,
  },
  // Late / critical
  LATE: {
    label: "En retard",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    pulse: true,
  },
  CRITICAL: {
    label: "Critique",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    pulse: true,
  },
};

export const StatusBadge = ({ status, label: customLabel, className }) => {
  const config = STATUS_MAP[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        config.bg,
        config.text,
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          config.dot,
          config.pulse && "pulse-critical",
        )}
      />
      {customLabel || config.label}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};
