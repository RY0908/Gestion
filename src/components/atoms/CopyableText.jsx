import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'

export const CopyableText = ({ value, className }) => {
    const [copied, setCopied] = useState(false)
    const copy = (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <span className={cn('inline-flex items-center gap-1.5 group', className)}>
            <code className="font-mono text-xs text-[var(--color-muted)]">{value}</code>
            <button
                onClick={copy}
                aria-label={`Copier ${value}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-muted)] hover:text-sonatrach-green"
            >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
        </span>
    )
}

CopyableText.propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string,
}
