import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-accent-light text-accent-text hover:bg-accent/80",
                secondary:
                    "border-transparent bg-bg-muted text-text-secondary hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-error-light text-error hover:bg-error/80",
                warning:
                    "border-transparent bg-warning-light text-warning hover:bg-warning/80",
                success:
                    "border-transparent bg-success-light text-success hover:bg-success/80",
                outline: "text-text-primary",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

/**
 * Badge Component
 * A small label or tag used to display status or count
 */
function Badge({
    className,
    variant,
    ...props
}) {
    return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
