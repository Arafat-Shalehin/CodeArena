import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @component SearchInput
 * @description Shared search input component that acts as a wrapper for shadcn's <Input>.
 * Automatically includes a leading search icon and standardizes padding.
 *
 * @param {Object} props
 * @param {string} props.value - Current value of the input
 * @param {Function} props.onChange - Handler called on input change (receives event, not value string)
 * @param {string} [props.placeholder='Search...'] - Placeholder text
 * @param {string} [props.className] - Additional classes for the structural wrapper div
 * @param {string} [props.inputClassName] - Additional classes directly on the `<Input />`
 * @param {string} [props.iconClassName] - Additional classes directly on the `<Search />` icon
 * @returns {JSX.Element} The rendered Search Input wrapped in a relative container.
 */
export function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    className,
    inputClassName,
    iconClassName,
    ...props
}) {
    return (
        <div className={cn('relative w-full', className)}>
            <Search
                className={cn(
                    'text-text-muted absolute top-1/2 left-3 size-[18px] -translate-y-1/2',
                    iconClassName
                )}
            />
            <Input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    'bg-bg-page border-border focus-visible:border-accent/50 focus-visible:ring-accent/20 h-10 w-full rounded-xl pl-[38px] transition-all',
                    inputClassName
                )}
                {...props}
            />
        </div>
    )
}
