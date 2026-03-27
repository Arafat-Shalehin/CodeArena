'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check, X, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * UsernameInput Component
 *
 * Input field with real-time username availability checking.
 * Features:
 * - 800ms debounced API call
 * - Visual feedback (checking, available, taken, invalid)
 * - Color-coded borders and messages
 *
 * @param {Object} props
 * @param {string} props.value - Current username value
 * @param {Function} props.onChange - Change handler
 * @param {Object} props.register - react-hook-form register
 * @param {Object} props.errors - react-hook-form errors
 * @param {boolean} props.disabled - Disabled state
 */
export default function UsernameInput({ value, register, errors, disabled = false }) {
    const [availability, setAvailability] = useState({
        status: 'idle', // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
        message: '',
    })

    // Debounced username availability check
    useEffect(() => {
        if (!value || value.length < 3) {
            setAvailability({ status: 'idle', message: '' })
            return
        }

        const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/
        if (!usernameRegex.test(value)) {
            setAvailability({
                status: 'invalid',
                message: 'Only letters, numbers, and underscores allowed (3-25 chars)',
            })
            return
        }

        const timeoutId = setTimeout(async () => {
            setAvailability({ status: 'checking', message: 'Checking availability...' })

            try {
                const res = await fetch(
                    `/api/users/check-username?username=${encodeURIComponent(value)}`
                )
                const data = await res.json()

                if (data.success) {
                    setAvailability({
                        status: data.available ? 'available' : 'taken',
                        message: data.message,
                    })
                } else {
                    setAvailability({
                        status: 'invalid',
                        message: data.message || 'Unable to check availability',
                    })
                }
            } catch (error) {
                console.error('Username check failed:', error)
                setAvailability({
                    status: 'idle',
                    message: 'Unable to check. Please try again.',
                })
            }
        }, 800)

        return () => clearTimeout(timeoutId)
    }, [value])

    const getAvailabilityIcon = () => {
        switch (availability.status) {
            case 'checking':
                return <Loader2 className="text-text-muted h-4 w-4 animate-spin" />
            case 'available':
                return <Check className="text-success h-4 w-4" />
            case 'taken':
                return <X className="text-error h-4 w-4" />
            case 'invalid':
                return <AlertCircle className="text-warning h-4 w-4" />
            default:
                return null
        }
    }

    const getAvailabilityColor = () => {
        switch (availability.status) {
            case 'available':
                return 'text-success'
            case 'taken':
            case 'invalid':
                return 'text-error'
            case 'checking':
                return 'text-text-muted'
            default:
                return ''
        }
    }

    const getBorderColor = () => {
        if (availability.status === 'available')
            return 'border-success focus:border-success focus:ring-success/20'
        if (availability.status === 'taken')
            return 'border-error focus:border-error focus:ring-error/20'
        if (availability.status === 'invalid')
            return 'border-warning focus:border-warning focus:ring-warning/20'
        return ''
    }

    return (
        <div className="space-y-1.5">
            <Label htmlFor="name" className="text-text-primary text-sm font-medium">
                Username / Handle
            </Label>
            <div className="relative">
                <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <AtSign size={16} />
                </div>
                <Input
                    id="name"
                    className={cn('h-11 pr-10 pl-10', getBorderColor())}
                    placeholder="your_unique_handle"
                    disabled={disabled}
                    {...register('name')}
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    {getAvailabilityIcon()}
                </div>
            </div>
            {availability.message && (
                <p className={cn('text-xs font-medium', getAvailabilityColor())}>
                    {availability.message}
                </p>
            )}
            {errors.name && <p className="text-error text-xs font-medium">{errors.name.message}</p>}
            <p className="text-text-muted text-xs">
                Unique name used to identify you and for your profile URL. Only letters, numbers,
                and underscores.
            </p>
        </div>
    )
}

UsernameInput.displayName = 'UsernameInput'
