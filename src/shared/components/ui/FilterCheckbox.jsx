import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

/**
 * Shared checkbox component for filtering across the platform.
 * Supports a unified color design system (default, accent, success, warning, error)
 * and optional counts.
 *
 * @param {Object} props
 * @param {string} props.label - The label text for the checkbox
 * @param {number|string} [props.count] - Optional count to display on the right
 * @param {boolean} props.checked - Whether the checkbox is checked
 * @param {Function} props.onCheckedChange - Callback when checked state changes
 * @param {'default'|'accent'|'success'|'warning'|'error'} [props.colorType='default'] - The color theme for the checked state
 */
export function FilterCheckbox({ label, count, checked, onCheckedChange, colorType = 'default' }) {
    // Safely map semantic color types to Tailwind classes to avoid dynamic interpolation breakage
    const colorStyles = {
        default: {
            checkbox:
                'data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-white',
            text: 'text-text-secondary group-hover:text-text-primary',
            ring: 'focus-visible:ring-accent',
        },
        accent: {
            checkbox:
                'data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-white',
            text: 'text-text-secondary group-hover:text-text-primary',
            ring: 'focus-visible:ring-accent',
        },
        success: {
            checkbox:
                'data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=checked]:text-white',
            text: 'text-success/80 group-hover:text-success',
            ring: 'focus-visible:ring-success',
        },
        warning: {
            checkbox:
                'data-[state=checked]:bg-warning data-[state=checked]:border-warning data-[state=checked]:text-white',
            text: 'text-warning/80 group-hover:text-warning',
            ring: 'focus-visible:ring-warning',
        },
        error: {
            checkbox:
                'data-[state=checked]:bg-error data-[state=checked]:border-error data-[state=checked]:text-white',
            text: 'text-error/80 group-hover:text-error',
            ring: 'focus-visible:ring-error',
        },
    }

    const style = colorStyles[colorType] || colorStyles.default

    return (
        <label className="group hover:bg-bg-muted/50 -ml-1.5 flex cursor-pointer items-center justify-between rounded-md p-1.5 transition-colors">
            <div className="flex items-center gap-3">
                <Checkbox
                    className={cn(
                        'border-text-muted/40 transition-all',
                        style.ring,
                        style.checkbox
                    )}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
                <span
                    className={cn(
                        'text-sm font-medium transition-colors',
                        style.text,
                        checked && colorType === 'default' && '!text-text-primary font-semibold'
                    )}
                >
                    {label}
                </span>
            </div>
            {count !== undefined && count !== null && (
                <span className="text-text-muted font-mono text-xs">{count}</span>
            )}
        </label>
    )
}
