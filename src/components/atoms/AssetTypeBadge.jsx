import PropTypes from 'prop-types'
import { Laptop, Monitor, Server, Printer, ScanLine, Tablet, Smartphone, Network, HardDrive, Projector, Keyboard, Package } from 'lucide-react'
import { ASSET_CATEGORIES } from '@/lib/constants.js'
import { REQUEST_CATEGORIES } from '@/lib/specifications.js'

// Map string names to lucide components
const ICON_MAP = {
    Laptop, Monitor, Server, Printer, ScanLine, Tablet, Smartphone, Network, HardDrive, Projector, Keyboard, Package
}

export const AssetTypeBadge = ({ category }) => {
    const config = ASSET_CATEGORIES.find(c => c.value === category) || REQUEST_CATEGORIES.find(c => c.value === category)
    const resolvedConfig = config || { label: category, icon: 'Package' }
    const IconComponent = ICON_MAP[resolvedConfig.icon] || Package

    return (
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--color-bg)] rounded text-[var(--color-muted)]">
                <IconComponent className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{resolvedConfig.label}</span>
        </div>
    )
}

AssetTypeBadge.propTypes = {
    category: PropTypes.string.isRequired,
}
