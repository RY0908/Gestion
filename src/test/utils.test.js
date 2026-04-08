import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, generateAssetTag } from '../lib/utils.js'

describe('Utils', () => {
    describe('cn()', () => {
        it('merges tailwind classes correctly', () => {
            expect(cn('px-2 py-1', 'bg-red-50')).toBe('px-2 py-1 bg-red-50')
            expect(cn('px-2 py-1', undefined, 'text-sm')).toBe('px-2 py-1 text-sm')
            expect(cn('p-4 px-2')).toBe('p-4 px-2') // tailwind-merge handles specificity
        })
    })

    describe('formatCurrency()', () => {
        it('formats numbers into DZD currency correctly', () => {
            const result = formatCurrency(150000)
            expect(result).toContain('150')
            expect(result).toContain('000')
            expect(result).toContain('DZD')
        })
    })

    describe('generateAssetTag()', () => {
        it('generates a correct Sonatrach asset tag', () => {
            const tag = generateAssetTag('LAPTOP', 2024, 42)
            expect(tag).toBe('STR-LPT-2024-0042')
        })
    })
})
