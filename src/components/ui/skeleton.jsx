import { cn } from '@/lib/utils'

/**
 * Skeleton Component
 * A placeholder loading state for content
 */
function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('animate-pulse bg-bg-muted rounded-md', className)}
            {...props}
        />
    )
}

export { Skeleton }
