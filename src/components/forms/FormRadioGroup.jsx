import { cn } from '@/lib/utils.js'

export const FormRadioGroup = ({ label, name, register, errors, options = [], required, disabled, className }) => {
    const error = errors?.[name]
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text)]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="flex flex-wrap gap-3">
                {options.map(opt => (
                    <label
                        key={opt.value}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all',
                            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-sonatrach-green/40',
                            'border-[var(--color-border)]'
                        )}
                    >
                        <input
                            type="radio"
                            value={opt.value}
                            disabled={disabled}
                            {...(register ? register(name) : {})}
                            className="w-4 h-4 text-sonatrach-green focus:ring-sonatrach-green/20 border-[var(--color-border)]"
                        />
                        {opt.icon && <span>{opt.icon}</span>}
                        <span>{opt.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-xs text-red-500">{error.message}</p>}
        </div>
    )
}
