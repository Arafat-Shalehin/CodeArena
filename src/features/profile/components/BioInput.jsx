'use client'

import { FileText } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * BioInput Component
 *
 * Textarea for user bio with character counter.
 * Features:
 * - 160 character limit
 * - Color-coded counter (warning at 150, error at 160+)
 * - Auto-resizing textarea
 *
 * @param {Object} props
 * @param {string} props.value - Current bio value
 * @param {Object} props.register - react-hook-form register
 * @param {Object} props.errors - react-hook-form errors
 * @param {boolean} props.disabled - Disabled state
 */
export default function BioInput({ value = '', register, errors, disabled = false }) {
    const getCounterColor = (length) => {
        if (length > 160) return 'text-error'
        if (length > 150) return 'text-warning'
        return 'text-text-muted'
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-text-primary text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-text-muted" />
                        Bio
                    </span>
                </Label>
                <span className={cn('text-xs font-medium', getCounterColor(value.length))}>
                    {value.length}/160
                </span>
            </div>
            <textarea
                id="bio"
                rows={3}
                placeholder="A short description about yourself..."
                disabled={disabled}
                className="border-border bg-bg-page text-text-primary placeholder:text-text-muted focus:ring-accent/10 focus:border-accent/30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all focus:ring-4 focus:outline-none disabled:opacity-50"
                {...register('bio')}
            />
            {errors.bio && <p className="text-error text-xs font-medium">{errors.bio.message}</p>}
        </div>
    )
}

BioInput.displayName = 'BioInput'
