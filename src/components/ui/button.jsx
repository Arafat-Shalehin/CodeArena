import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-accent text-white hover:bg-accent-hover shadow-accent-glow rounded-xl font-medium ring-offset-background transition-all duration-300',
                destructive: 'bg-error text-white hover:bg-red-700 rounded-xl font-medium',
                outline:
                    'bg-transparent border border-border text-text-primary font-medium rounded-xl ring-offset-background hover:bg-accent hover:text-black hover:border-transparent transition-all duration-300',
                secondary:
                    'bg-bg-subtle/50 border border-border text-text-primary font-medium rounded-xl ring-offset-background hover:bg-accent hover:text-black hover:border-transparent transition-all duration-300 shadow-sm',
                ghost: 'text-text-secondary hover:bg-accent-light/30 hover:text-accent-text font-medium rounded-xl transition-all duration-300',
                link: 'text-accent underline-offset-4 hover:underline font-medium',
            },
            size: {
                default: 'h-11 px-5 py-2.5',
                sm: 'h-9 px-3 text-xs',
                lg: 'h-14 px-8 text-base',
                icon: 'h-10 w-10',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            fullWidth: false,
        },
    }
)

/**
 * Button Component
 * A clickable button element with various styles and sizes.
 * Supports loading state, icons, and full width.
 *
 * @typedef {Object} ButtonProps
 * @property {string} [variant] - Visual style variant
 * @property {string} [size] - Button size
 * @property {boolean} [fullWidth] - Whether the button should take full width
 * @property {boolean} [isLoading] - Whether to show a loading spinner
 * @property {string} [loadingText] - Text to show while loading
 * @property {React.ReactNode} [leftIcon] - Icon to show on the left
 * @property {React.ReactNode} [rightIcon] - Icon to show on the right
 * @property {boolean} [asChild] - Whether to render as a child component
 */

const Button = React.forwardRef(
    (
        {
            className,
            variant,
            size,
            fullWidth,
            isLoading = false,
            loadingText,
            leftIcon,
            rightIcon,
            children,
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, fullWidth }), className)}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {isLoading && loadingText ? loadingText : children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </Comp>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
