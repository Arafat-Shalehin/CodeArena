import { cn } from '@/lib/utils'

/**
 * Skeleton Component
 * A placeholder loading state for content
 */
function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                'bg-bg-muted relative overflow-hidden rounded-md',
                'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }
