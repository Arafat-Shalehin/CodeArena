import { cn } from '@/lib/utils'

/**
 * Skeleton Component
 * A placeholder loading state for content
 */
function Skeleton({ className, ...props }) {
    return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />
}

export { Skeleton }
