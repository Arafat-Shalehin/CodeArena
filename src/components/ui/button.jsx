import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md transition-all duration-300",
                destructive:
                    "bg-error text-white hover:bg-red-700",
                outline:
                    "border border-border bg-bg-page hover:bg-accent hover:text-white hover:border-accent/50 transition-colors",
                secondary:
                    "bg-bg-subtle text-text-primary hover:bg-bg-muted border border-border shadow-sm",
                ghost: "hover:bg-bg-subtle hover:text-text-primary",
                link: "text-accent underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-5 py-2.5",
                sm: "h-9 rounded-md px-3",
                lg: "h-14 rounded-lg px-8 text-base",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
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

const Button = React.forwardRef(({
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
}, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, fullWidth, className }))}
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
})
Button.displayName = "Button"

export { Button, buttonVariants }
