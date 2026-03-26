'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, MapPin, Globe, AtSign, Check, X as XIcon, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,25}$/

export default function PersonalInfoForm({
    register,
    errors,
    bioValue = '',
    watch,
    setValue,
    countries = [],
}) {
    const locationValue = watch ? watch('location') || '' : ''
    const websiteValue = watch ? watch('website') || '' : ''
    const countryValue = watch ? watch('country') || '' : ''

    const handleClear = (field) => {
        if (setValue) {
            setValue(field, '', { shouldValidate: true })
        }
    }
    const [usernameAvailability, setUsernameAvailability] = useState({
        status: 'idle', // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
        message: '',
    })

    const usernameValue = watch ? watch('name') : ''

    // Debounced username availability check
    useEffect(() => {
        if (!usernameValue || usernameValue.length < 3) {
            setUsernameAvailability({ status: 'idle', message: '' })
            return
        }

        if (!USERNAME_REGEX.test(usernameValue)) {
            setUsernameAvailability({
                status: 'invalid',
                message: 'Only letters, numbers, and underscores allowed (3-25 chars)',
            })
            return
        }

        const timeoutId = setTimeout(async () => {
            setUsernameAvailability({ status: 'checking', message: 'Checking availability...' })

            try {
                const res = await fetch(
                    `/api/users/check-username?username=${encodeURIComponent(usernameValue)}`
                )
                const data = await res.json()

                if (data.success) {
                    setUsernameAvailability({
                        status: data.available ? 'available' : 'taken',
                        message: data.message,
                    })
                } else {
                    setUsernameAvailability({
                        status: 'invalid',
                        message: data.message || 'Unable to check availability',
                    })
                }
            } catch (error) {
                console.error('Username check failed:', error)
                setUsernameAvailability({
                    status: 'idle',
                    message: 'Unable to check. Please try again.',
                })
            }
        }, 800) // 800ms debounce

        return () => clearTimeout(timeoutId)
    }, [usernameValue])

    const getAvailabilityIcon = () => {
        switch (usernameAvailability.status) {
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
        switch (usernameAvailability.status) {
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

    return (
        <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Username / Handle */}
                <div className="space-y-2 md:col-span-2">
                    <Label
                        htmlFor="name"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Username / Handle
                    </Label>
                    <div className="relative">
                        <AtSign
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="name"
                            {...register('name')}
                            className={cn(
                                'pr-10 pl-10',
                                usernameAvailability.status === 'available' &&
                                    'border-success focus:border-success focus:ring-success/20',
                                usernameAvailability.status === 'taken' &&
                                    'border-error focus:border-error focus:ring-error/20',
                                usernameAvailability.status === 'invalid' &&
                                    'border-warning focus:border-warning focus:ring-warning/20'
                            )}
                            placeholder="your_unique_handle"
                        />
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            {getAvailabilityIcon()}
                        </div>
                    </div>
                    {usernameAvailability.message && (
                        <p className={cn('text-xs font-medium', getAvailabilityColor())}>
                            {usernameAvailability.message}
                        </p>
                    )}
                    {errors.name && (
                        <p className="text-error text-xs font-medium">{errors.name.message}</p>
                    )}
                    <p className="text-text-muted text-xs">
                        Unique name used to identify you and for your profile URL. Only letters,
                        numbers, and underscores.
                    </p>
                </div>

                {/* Bio TextArea with Character Counter */}
                <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="bio"
                            className="text-text-muted text-xs font-bold tracking-wider uppercase"
                        >
                            Bio
                        </Label>
                        <span
                            className={`text-xs font-medium ${
                                bioValue.length > 160
                                    ? 'text-error'
                                    : bioValue.length > 150
                                      ? 'text-warning'
                                      : 'text-text-muted'
                            }`}
                        >
                            {bioValue.length || 0}/160
                        </span>
                    </div>
                    <textarea
                        id="bio"
                        {...register('bio')}
                        rows={4}
                        className="bg-bg-page border-border text-text-primary focus:ring-accent placeholder:text-text-muted w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                        placeholder="Tell us about your coding journey..."
                    />
                    {errors.bio && (
                        <p className="text-error text-xs font-medium">{errors.bio.message}</p>
                    )}
                </div>

                {/* Location Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="location"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        City
                    </Label>
                    <div className="relative">
                        <MapPin
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="location"
                            {...register('location')}
                            className="pr-10 pl-10"
                            placeholder="San Francisco"
                        />
                        {locationValue && (
                            <button
                                type="button"
                                onClick={() => handleClear('location')}
                                className="text-text-muted hover:text-error absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                title="Clear city"
                            >
                                <XIcon size={14} />
                            </button>
                        )}
                    </div>
                    {errors.location && (
                        <p className="text-error text-xs font-medium">{errors.location.message}</p>
                    )}
                </div>

                {/* Country Select */}
                <div className="space-y-2">
                    <Label
                        htmlFor="country"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Country
                    </Label>
                    <div className="relative">
                        <select
                            id="country"
                            {...register('country')}
                            className="bg-bg-page border-border text-text-primary focus:ring-accent w-full rounded-md border px-3 py-2 pr-8 text-sm transition-colors focus:ring-2 focus:outline-none"
                        >
                            <option value="">Select a country</option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                        {countryValue && (
                            <button
                                type="button"
                                onClick={() => handleClear('country')}
                                className="text-text-muted hover:text-error absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                title="Clear country"
                            >
                                <XIcon size={14} />
                            </button>
                        )}
                    </div>
                    {errors.country && (
                        <p className="text-error text-xs font-medium">{errors.country.message}</p>
                    )}
                </div>

                {/* Website URL Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="website"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Website
                    </Label>
                    <div className="relative">
                        <Globe
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="website"
                            {...register('website')}
                            className="pr-10 pl-10"
                            placeholder="https://yourportfolio.com"
                        />
                        {websiteValue && (
                            <button
                                type="button"
                                onClick={() => handleClear('website')}
                                className="text-text-muted hover:text-error absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                title="Clear website"
                            >
                                <XIcon size={14} />
                            </button>
                        )}
                    </div>
                    {errors.website && (
                        <p className="text-error text-xs font-medium">{errors.website.message}</p>
                    )}
                </div>
            </div>
        </Card>
    )
}
