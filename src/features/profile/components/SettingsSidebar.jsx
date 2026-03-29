import React from 'react'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { SETTINGS_NAV_ITEMS } from '../data/settings.data'

/**
 * SettingsSidebar Component
 * * Provides the primary navigation for the settings dashboard.
 * Dynamically renders navigation links from a data configuration and
 * includes a "Pro Member" status call-to-action card.
 * * @component
 * @param {Object} props - The component props.
 * @param {string} props.activeSection - The ID of the currently selected section to apply active styling.
 * @param {Function} props.onSectionChange - Callback function to update the active section.
 * Expected signature: `(sectionId: string) => void`.
 * @param {string} [props.className] - Optional additional CSS classes for custom layout adjustments.
 * * @returns {React.JSX.Element} The rendered sidebar navigation.
 */
export default function SettingsSidebar({ activeSection, onSectionChange, className }) {
    return (
        <aside
            className={cn('flex w-full flex-col gap-1 md:w-64', className)}
            aria-label="Settings navigation"
        >
            {/* Map through navigation items defined in settings.data */}
            {SETTINGS_NAV_ITEMS.map((item) => {
                /** * Dynamically resolve the icon component from Lucide library
                 * based on the string name provided in the data.
                 */
                const Icon = Icons[item.icon]

                return (
                    <button
                        key={item.id}
                        onClick={() => onSectionChange(item.id)}
                        aria-current={activeSection === item.id ? 'page' : undefined}
                        className={cn(
                            'flex items-center gap-3 rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors',
                            activeSection === item.id
                                ? 'bg-accent-light text-accent border-accent border-l-2'
                                : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                        )}
                    >
                        {Icon && <Icon size={18} />}
                        {item.label}
                    </button>
                )
            })}

            {/* Account Status / Subscription Upsell Card */}
            <div className="bg-bg-subtle border-border mt-8 rounded-lg border p-5">
                <p className="text-text-muted mb-2 text-[10px] font-bold tracking-wider uppercase">
                    Pro Member
                </p>
                <p className="text-text-secondary mb-4 text-xs leading-relaxed">
                    You have 15 days left in your current billing cycle.
                </p>
                <button className="bg-accent hover:bg-accent-hover w-full rounded-md py-2 text-xs font-semibold text-white transition-colors">
                    Renew Now
                </button>
            </div>
        </aside>
    )
}
