'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }) => {
    const { theme = 'system' } = useTheme()

    return (
        <Sonner
            theme={theme}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-bg-surface group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-text-muted',
                    actionButton: 'group-[.toast]:bg-text-primary group-[.toast]:text-bg-page',
                    cancelButton: 'group-[.toast]:bg-bg-muted group-[.toast]:text-text-secondary',
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
