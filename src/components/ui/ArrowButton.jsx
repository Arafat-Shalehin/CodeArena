import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * ArrowButton component
 * Redesigns the default action button with a sliding arrow interaction.
 * Inspired by the "Sign up" interactive snippet.
 */
const ArrowButton = React.forwardRef(
    ({ className, variant = 'default', children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                className={cn(
                    'group relative flex items-center justify-between gap-3 overflow-hidden rounded-full font-medium transition-all duration-300',
                    variant === 'default' && 'bg-accent hover:bg-accent-hover pr-2 text-white',
                    variant === 'secondary' &&
                        'bg-bg-subtle/50 text-text-primary hover:bg-accent border-border border pr-2 hover:text-black',
                    className
                )}
                {...props}
            >
                <span className="pl-2 transition-transform duration-300 group-hover:-translate-x-1">
                    {children}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/30 group-hover:pl-1">
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </div>
            </Button>
        )
    }
)

ArrowButton.displayName = 'ArrowButton'

export { ArrowButton }
