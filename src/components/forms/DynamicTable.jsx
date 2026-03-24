import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export const DynamicTable = ({ columns, rows, onAddRow, onRemoveRow, onCellChange, minRows = 1, className }) => {
    return (
        <div className={cn('space-y-3', className)}>
            <div className="overflow-x-auto border border-[var(--color-border)] rounded-lg">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                            <th className="py-2 px-3 text-left text-xs uppercase font-semibold text-[var(--color-muted)] w-10">N°</th>
                            {columns.map(col => (
                                <th key={col.key} className={cn('py-2 px-3 text-xs uppercase font-semibold text-[var(--color-muted)]', col.align === 'right' ? 'text-right' : 'text-left')}>
                                    {col.label} {col.required && <span className="text-red-500">*</span>}
                                </th>
                            ))}
                            <th className="py-2 px-3 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/50">
                                <td className="py-2 px-3 text-xs text-[var(--color-muted)] font-mono">{rowIdx + 1}</td>
                                {columns.map(col => (
                                    <td key={col.key} className="py-1.5 px-2">
                                        {col.render ? (
                                            col.render(row, rowIdx, onCellChange)
                                        ) : col.readOnly ? (
                                            <span className={cn('text-sm', col.align === 'right' && 'block text-right')}>
                                                {row[col.key] ?? '—'}
                                            </span>
                                        ) : col.type === 'select' ? (
                                            <select
                                                value={row[col.key] || ''}
                                                onChange={(e) => onCellChange(rowIdx, col.key, e.target.value)}
                                                className="w-full h-8 px-2 rounded border border-[var(--color-border)] text-sm bg-transparent outline-none focus:border-sonatrach-green/50"
                                            >
                                                {col.placeholder && <option value="">{col.placeholder}</option>}
                                                {col.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type={col.type || 'text'}
                                                value={row[col.key] ?? ''}
                                                onChange={(e) => onCellChange(rowIdx, col.key, col.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                                                min={col.min}
                                                step={col.step}
                                                placeholder={col.placeholder}
                                                disabled={col.disabled}
                                                className={cn(
                                                    'w-full h-8 px-2 rounded border border-[var(--color-border)] text-sm bg-transparent outline-none focus:border-sonatrach-green/50 transition-all',
                                                    col.align === 'right' && 'text-right'
                                                )}
                                            />
                                        )}
                                    </td>
                                ))}
                                <td className="py-2 px-2">
                                    {rows.length > minRows && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveRow(rowIdx)}
                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                onClick={onAddRow}
                className="flex items-center gap-2 px-3 py-2 text-sm text-sonatrach-green hover:bg-sonatrach-green/10 rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Ajouter une ligne
            </button>
        </div>
    )
}
