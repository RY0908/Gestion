import { cn } from '@/lib/utils.js'

export const FormTextarea = ({ label, name, register, errors, required, rows = 4, placeholder, disabled, className }) => {
    const error = errors?.[name]
    const hasError = !!error
    return (
        <div className={cn('space-y-1', className)}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text)]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea
                id={name}
                rows={rows}
                disabled={disabled}
                placeholder={placeholder}
                {...(register ? register(name) : {})}
                className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm bg-transparent outline-none transition-all resize-y',
                    disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-bg)]',
                    hasError
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : 'border-[var(--color-border)] focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20'
                )}
            />
            {hasError && <p className="text-xs text-red-500 mt-0.5">{error.message}</p>}
        </div>
    )
}
