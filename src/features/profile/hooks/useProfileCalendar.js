'use client'

import { useMemo } from 'react'

export function useProfileCalendar(activityCalendar) {
    return useMemo(() => {
        const rawCalendar = activityCalendar || {}
        const calendar = rawCalendar instanceof Map ? Object.fromEntries(rawCalendar) : rawCalendar
        return Array.from({ length: 365 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (364 - i))
            const dateStr = d.toISOString().split('T')[0]
            const count = calendar[dateStr] || 0
            const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4
            return { date: dateStr, count, level }
        })
    }, [activityCalendar])
}
