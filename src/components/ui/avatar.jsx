import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'

/**
 * Avatar Component
 * Displays an image or a fallback initial
 */
const Avatar = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
    />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * AvatarImage Component
 * The image to be displayed
 */
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        {...props}
    />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * AvatarFallback Component
 * The fallback element when the image is not available
 */
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            'bg-muted flex h-full w-full items-center justify-center rounded-full',
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
