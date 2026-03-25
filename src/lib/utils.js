import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  parseISO,
  differenceInDays,
  formatDistanceToNow,
} from "date-fns";
import { fr } from "date-fns/locale";

/** Merge Tailwind classes safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format number as Algerian Dinar */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    currencyDisplay: "code",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Format ISO date string */
export function formatDate(iso, fmt = "dd MMM yyyy") {
  if (!iso) return "—";
  return format(parseISO(iso), fmt, { locale: fr });
}

/** Relative time: "il y a 2 heures" */
export function formatRelative(iso) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: fr });
}

/** Days until a date (negative = overdue) */
export function daysUntil(iso) {
  return differenceInDays(parseISO(iso), new Date());
}

/** Get initials from full name */
export function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Generate Sonatrach-style asset tag: STR-LPT-2024-0042 */
export function generateAssetTag(category, year, seq) {
  const normalized = category.trim().toUpperCase();
  const codeMap = {
    LAPTOP: "LPT",
    DESKTOP: "DST",
    MONITOR: "MON",
    PRINTER: "PRT",
    ROUTER: "RTR",
    SWITCH: "SWT",
    PHONE: "PHN",
    TABLET: "TAB",
  };

  const cat = codeMap[normalized] || normalized.slice(0, 3);
  return `STR-${cat}-${year}-${String(seq).padStart(4, "0")}`;
}

/** Truncate a string to maxLen characters */
export function truncate(str, maxLen = 40) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/** Format a large number with French locale separators */
export function formatNumber(n) {
  return new Intl.NumberFormat("fr-DZ").format(n);
}
