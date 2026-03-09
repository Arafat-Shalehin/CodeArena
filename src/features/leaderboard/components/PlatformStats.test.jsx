import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Sparkline } from './PlatformStats'
import React from 'react'

/**
 * @vitest-environment jsdom
 */

describe('Sparkline Component', () => {
    it('renders null if no data is provided', () => {
        const { container } = render(<Sparkline data={[]} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders an SVG with points when data is provided', () => {
        const data = [10, 20, 30, 40, 50]
        const { container } = render(<Sparkline data={data} positive={true} />)
        const svg = container.querySelector('svg')
        expect(svg).toBeDefined()

        const polyline = container.querySelector('polyline')
        expect(polyline).toBeDefined()

        const points = polyline.getAttribute('points')
        // Check if points are within the padded range (pad=2, width=64, height=24)
        // Normalized values: 0, 0.25, 0.5, 0.75, 1
        // Expected Y values: pad + (1 - normalizedV) * (height - 2*pad)
        // height-2*pad = 20
        // Expected Y: 22, 17, 12, 7, 2
        expect(points).toContain(',22')
        expect(points).toContain(',2')
    })

    it('handles constant data (flat line)', () => {
        const data = [100, 100, 100]
        const { container } = render(<Sparkline data={data} stable={true} />)
        const polyline = container.querySelector('polyline')
        const points = polyline.getAttribute('points')

        // range === 0, so normalizedV should be 0.5
        // y = pad + (1 - 0.5) * 20 = 2 + 10 = 12
        expect(points).toContain(',12')
    })

    it('renders a dot at the terminal point', () => {
        const data = [10, 50] // min=10, max=50
        const { container } = render(<Sparkline data={data} positive={true} />)
        const circle = container.querySelector('circle')

        // lastV = 50, normalizedV = 1
        // y = pad + (1 - 1) * 20 = 2
        // x = pad + w = 62
        expect(circle.getAttribute('cx')).toBe('62')
        expect(circle.getAttribute('cy')).toBe('2')
    })
})
