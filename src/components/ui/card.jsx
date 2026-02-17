import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component
 * A container for content with a consistent style
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("rounded-lg border border-border bg-bg-subtle text-text-primary shadow-sm", className)}
        {...props} />
))
Card.displayName = "Card"

/**
 * CardHeader Component
 * The header section of the card
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props} />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle Component
 * The title of the card
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
        {...props} />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription Component
 * A description for the card
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-text-secondary", className)}
        {...props} />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent Component
 * The main content of the card
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter Component
 * The footer section of the card
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
