import { describe, it, expect } from 'vitest'
import { formatAcceptanceRate } from './utils'

describe('formatAcceptanceRate', () => {
    it('should format whole numbers without decimals', () => {
        expect(formatAcceptanceRate(92)).toBe('92%')
        expect(formatAcceptanceRate(100)).toBe('100%')
    })

    it('should format floating point numbers with up to 2 decimal places', () => {
        expect(formatAcceptanceRate(81.3444)).toBe('81.34%')
        expect(formatAcceptanceRate(75.5)).toBe('75.5%')
        expect(formatAcceptanceRate(66.666)).toBe('66.67%')
    })

    it('should return 0% for invalid inputs', () => {
        expect(formatAcceptanceRate(undefined)).toBe('0%')
        expect(formatAcceptanceRate(null)).toBe('0%')
        expect(formatAcceptanceRate('invalid')).toBe('0%')
    })

    it('should handle string numbers correctly', () => {
        expect(formatAcceptanceRate('85.5')).toBe('85.5%')
    })
})
