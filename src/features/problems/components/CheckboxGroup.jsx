import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export default function CheckboxGroup({
    label,
    count,
    checkboxColorClass, // e.g., "success"
    textColorClass,
    ringColorClass,
    checked,
    onCheckedChange,
}) {
    // We expect checkboxColorClass to be a base color name like 'success', 'warning', 'error', or 'accent'
    // This allows us to construct the correct data-[state=checked] classes robustly.
    const color = checkboxColorClass || 'accent'

    return (
        <label className="group flex cursor-pointer items-center justify-between">
            <div className="flex items-center gap-3">
                <Checkbox
                    className={cn(
                        ringColorClass,
                        `data-[state=checked]:bg-${color} data-[state=checked]:border-${color} data-[state=checked]:text-white`
                    )}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
                <span
                    className={cn(
                        'text-sm font-medium transition-colors',
                        textColorClass || 'text-text-primary'
                    )}
                >
                    {label}
                </span>
            </div>
            <span className="text-text-muted font-mono text-xs">{count}</span>
        </label>
    )
}
