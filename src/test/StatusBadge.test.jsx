import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '../components/atoms/StatusBadge.jsx'

describe('StatusBadge', () => {
    it('renders correctly for IN_STOCK status', () => {
        const { container } = render(<StatusBadge status="IN_STOCK" />)
        expect(screen.getByText('En stock')).toBeInTheDocument()
        // Check if the correct color class is applied (bg-green-100/text-green-800)
        expect(container.firstChild).toHaveClass('bg-blue-50')
        expect(container.firstChild).toHaveClass('text-blue-600')
    })

    it('renders correctly for IN_MAINTENANCE status', () => {
        render(<StatusBadge status="IN_MAINTENANCE" />)
        expect(screen.getByText('En maintenance')).toBeInTheDocument()
    })

    it('returns null for an invalid status', () => {
        const { container } = render(<StatusBadge status="INVALID_STATUS" />)
        expect(container).toBeEmptyDOMElement()
    })
})
