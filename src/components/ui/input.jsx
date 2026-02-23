import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Input Component
 * An input field for user text entry
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'border-border bg-bg-page ring-offset-background placeholder:text-text-muted focus-visible:ring-accent flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = 'Input'

export { Input }
