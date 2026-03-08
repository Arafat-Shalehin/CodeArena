import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Formats a number as a percentage string for acceptance rates.
 * - Max 2 decimal places.
 * - No decimal if it's a whole number.
 * - Always appends "%".
 * @param {number} rate - The acceptance rate (e.g., 81.3444 or 92).
 * @returns {string} The formatted string (e.g., "81.34%" or "92%").
 */
export function formatAcceptanceRate(rate) {
    if (rate === undefined || rate === null || isNaN(rate)) return '0%'

    // Convert to number just in case it's a string
    const num = Number(rate)

    // If it's a whole number, return it without decimals
    if (Number.isInteger(num)) {
        return `${num}%`
    }

    // Otherwise, limit to 2 decimal places and remove trailing zeros if any
    return `${parseFloat(num.toFixed(2))}%`
}
