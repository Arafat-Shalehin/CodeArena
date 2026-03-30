/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsSidebar from './SettingsSidebar'
import { SETTINGS_NAV_ITEMS } from '../data/settings.data'

describe('SettingsSidebar', () => {
    let mockOnSectionChange

    beforeEach(() => {
        mockOnSectionChange = vi.fn()
    })

    it('renders all navigation items from data', () => {
        render(<SettingsSidebar activeSection="profile" onSectionChange={mockOnSectionChange} />)

        SETTINGS_NAV_ITEMS.forEach((item) => {
            // getByText throws if not found – acts as an assertion
            expect(screen.getByText(item.label)).toBeTruthy()
        })
    })

    it('calls onSectionChange with the correct id when a section is clicked', () => {
        render(<SettingsSidebar activeSection="profile" onSectionChange={mockOnSectionChange} />)

        const accountItem = SETTINGS_NAV_ITEMS.find((i) => i.id === 'account')
        fireEvent.click(screen.getByText(accountItem.label))
        expect(mockOnSectionChange).toHaveBeenCalledWith('account')
    })

    it('sets aria-current="page" on the active section button', () => {
        render(<SettingsSidebar activeSection="privacy" onSectionChange={mockOnSectionChange} />)

        const privacyItem = SETTINGS_NAV_ITEMS.find((i) => i.id === 'privacy')
        const privacyButton = screen.getByText(privacyItem.label).closest('button')
        expect(privacyButton.getAttribute('aria-current')).toBe('page')

        // Non-active items must NOT have aria-current
        const profileItem = SETTINGS_NAV_ITEMS.find((i) => i.id === 'profile')
        const profileButton = screen.getByText(profileItem.label).closest('button')
        expect(profileButton.getAttribute('aria-current')).toBeNull()
    })
})
