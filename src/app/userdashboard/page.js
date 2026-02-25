/**
 * @file page.js
 * @description The user dashboard page entry point.
 */

import Dashboard from '@/features/dashboard/components/Dashboard'

export const metadata = {
    title: 'Dashboard | CodeArena',
    description: 'Track your progress, view contribution heatmap, and recent submissions.',
}

/**
 * @page UserDashboard
 * @description Renders the dashboard feature for the logged-in user.
 */
export default function UserDashboardPage() {
    return <Dashboard />
}
