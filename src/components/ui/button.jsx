import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

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
                    "border border-border bg-background hover:bg-accent hover:text-white hover:border-accent/50 transition-colors",
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
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

/**
 * Button Component
 * A clickable button element with various styles and sizes
 */
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        (<Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props} />)
    );
})
Button.displayName = "Button"

export { Button, buttonVariants }
