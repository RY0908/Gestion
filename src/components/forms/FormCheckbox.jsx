import { cn } from '@/lib/utils.js'

export const FormCheckbox = ({ label, name, register, errors, disabled, className }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <input
                id={name}
                type="checkbox"
                disabled={disabled}
                {...(register ? register(name) : {})}
                className="w-4 h-4 rounded border-[var(--color-border)] text-sonatrach-green focus:ring-sonatrach-green/20 cursor-pointer"
            />
            {label && (
                <label htmlFor={name} className="text-sm text-[var(--color-text)] cursor-pointer select-none">
                    {label}
                </label>
            )}
        </div>
    )
}
