'use client'

import { cloneElement } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useTheme } from 'next-themes'

const CALENDAR_THEME = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
}

const CALENDAR_LABELS = {
    legend: {
        less: 'Less',
        more: 'More',
        colors: [
            'No activity',
            '1-2 submissions',
            '3-5 submissions',
            '6-9 submissions',
            '10+ submissions',
        ],
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    totalCount: '{{count}} submissions in the last year',
}

export default function ActivityHeatmap({ calendarData }) {
    const { theme } = useTheme()

    return (
        <section className="bg-bg-subtle border-border overflow-hidden rounded-2xl border p-6 shadow-sm">
            <h3 className="text-text-primary mb-6 text-lg font-bold">Submission Activity</h3>
            <div className="no-scrollbar flex w-full justify-start overflow-x-auto pb-4 sm:justify-center">
                <div className="w-max min-w-full">
                    <ActivityCalendar
                        data={calendarData}
                        colorScheme={theme === 'dark' ? 'dark' : 'light'}
                        theme={CALENDAR_THEME}
                        labels={CALENDAR_LABELS}
                        fontSize={12}
                        blockSize={12}
                        blockMargin={4}
                        blockRadius={2}
                        renderBlock={(block, activity) =>
                            cloneElement(block, {
                                'data-tooltip-id': 'activity-tooltip',
                                'data-tooltip-html': `<strong>${activity.count} submissions</strong> on ${activity.date}`,
                            })
                        }
                    />
                    <ReactTooltip id="activity-tooltip" />
                </div>
            </div>
        </section>
    )
}
