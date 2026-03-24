import { useState } from 'react'
import { cn } from '@/lib/utils.js'

export const MoneyInput = ({ label, name, register, errors, required, disabled, className, setValue }) => {
    const error = errors?.[name]
    const hasError = !!error
    const [display, setDisplay] = useState('')

    const formatDA = (val) => {
        const num = parseFloat(String(val).replace(/[^\d.]/g, ''))
        if (isNaN(num)) return ''
        return new Intl.NumberFormat('fr-DZ').format(num)
    }

    const handleChange = (e) => {
        const raw = e.target.value.replace(/[^\d.]/g, '')
        setDisplay(raw ? formatDA(raw) : '')
        if (setValue) setValue(name, raw ? parseFloat(raw) : '')
    }

    return (
        <div className={cn('space-y-1', className)}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text)]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={name}
                    type="text"
                    inputMode="decimal"
                    disabled={disabled}
                    value={display}
                    onChange={handleChange}
                    placeholder="0"
                    className={cn(
                        'w-full h-9 pl-3 pr-10 rounded-lg border text-sm bg-transparent outline-none transition-all',
                        disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-bg)]',
                        hasError
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                            : 'border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20'
                    )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-muted)]">DA</span>
            </div>
            {/* Hidden input for react-hook-form */}
            {register && <input type="hidden" {...register(name)} />}
            {hasError && <p className="text-xs text-red-500 mt-0.5">{error.message}</p>}
        </div>
    )
}
