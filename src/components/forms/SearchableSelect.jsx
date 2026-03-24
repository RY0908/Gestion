import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export const SearchableSelect = ({ label, name, register, errors, required, options = [], placeholder = 'Rechercher...', disabled, className, onSelect, value }) => {
    const error = errors?.[name]
    const hasError = !!error
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const wrapperRef = useRef(null)

    const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(query.toLowerCase())
    )

    const selected = options.find(o => o.value === value)

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className={cn('space-y-1 relative', className)} ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text)]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    'w-full h-9 px-3 rounded-lg border text-sm bg-transparent outline-none transition-all flex items-center justify-between text-left',
                    disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-bg)]',
                    hasError
                        ? 'border-red-500'
                        : open ? 'border-sonatrach-green/50 ring-1 ring-sonatrach-green/20' : 'border-[var(--color-border)]'
                )}
            >
                <span className={selected ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-[var(--color-muted)] transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-[var(--color-border)]">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Filtrer..."
                                className="w-full h-8 pl-8 pr-3 rounded border border-[var(--color-border)] text-sm bg-transparent outline-none focus:border-sonatrach-green/50"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-48">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-[var(--color-muted)] text-center">Aucun résultat</div>
                        ) : (
                            filtered.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onSelect?.(opt)
                                        setOpen(false)
                                        setQuery('')
                                    }}
                                    className={cn(
                                        'w-full text-left px-3 py-2 text-sm hover:bg-sonatrach-green/10 transition-colors',
                                        value === opt.value && 'bg-sonatrach-green/5 text-sonatrach-green font-medium'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Hidden input for form */}
            {register && <input type="hidden" {...register(name)} value={value || ''} />}
            {hasError && <p className="text-xs text-red-500 mt-0.5">{error.message}</p>}
        </div>
    )
}
