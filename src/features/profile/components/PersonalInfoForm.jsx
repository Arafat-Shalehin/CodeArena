import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, MapPin, Globe, AtSign, Edit2, X, Loader2 } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries.data'

const InlineEditField = ({
    id,
    label,
    icon: Icon,
    register,
    error,
    placeholder,
    isTextArea = false,
    charLimit,
    watchValue = '',
    disabled = false,
    options = null,
}) => {
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label
                    htmlFor={id}
                    className="text-text-muted text-xs font-bold tracking-wider uppercase"
                >
                    {label}
                </Label>
                <div className="flex items-center gap-2">
                    {isTextArea && charLimit && (
                        <span
                            className={`text-xs font-medium ${watchValue.length > charLimit ? 'text-warning' : 'text-text-muted'}`}
                        >
                            {watchValue.length || 0}/{charLimit}
                        </span>
                    )}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-text-muted hover:text-accent transition-colors"
                        >
                            {isEditing ? (
                                <X className="h-3.5 w-3.5" />
                            ) : (
                                <Edit2 className="h-3.5 w-3.5" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    {Icon && (
                        <Icon
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                    )}
                    {isTextArea ? (
                        <textarea
                            id={id}
                            {...register(id)}
                            disabled={!isEditing}
                            rows={4}
                            className="bg-bg-page border-border text-text-primary focus:ring-accent placeholder:text-text-muted disabled:bg-bg-subtle w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none disabled:opacity-70"
                            placeholder={placeholder}
                        />
                    ) : options ? (
                        <select
                            id={id}
                            {...register(id)}
                            disabled={!isEditing}
                            className={`bg-bg-page border-border text-text-primary focus:ring-accent placeholder:text-text-muted disabled:bg-bg-subtle w-full rounded-md border py-2 pr-3 text-sm transition-colors focus:ring-2 focus:outline-none disabled:opacity-70 ${Icon ? 'pl-10' : 'pl-3'}`}
                        >
                            <option value="">Global (No Country)</option>
                            {options.map((opt) => (
                                <option key={opt.code} value={opt.code}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            id={id}
                            {...register(id)}
                            disabled={!isEditing}
                            className={`${Icon ? 'pl-10' : ''} disabled:bg-bg-subtle disabled:opacity-70`}
                            placeholder={placeholder}
                        />
                    )}
                </div>
            </div>
            {error && <p className="text-error text-xs font-medium">{error.message}</p>}
        </div>
    )
}

const UsernameField = ({ register, error, watch, setValue, user }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [checkStatus, setCheckStatus] = useState('idle')
    const [statusMessage, setStatusMessage] = useState('')

    const currentInputValue = watch('name')

    useEffect(() => {
        if (!isEditing) {
            setCheckStatus('idle')
            setStatusMessage('')
            return
        }

        const checkUsername = async () => {
            if (!currentInputValue || currentInputValue.length < 3) {
                setCheckStatus('idle')
                setStatusMessage('Username must be 3-25 characters')
                return
            }

            if (currentInputValue === user?.name) {
                setCheckStatus('available')
                setStatusMessage('This is your current username')
                return
            }

            setCheckStatus('checking')
            try {
                const res = await fetch(`/api/users/check-username?username=${currentInputValue}`)
                const data = await res.json()

                if (data.canChange === false) {
                    setCheckStatus('cooldown')
                } else if (data.available) {
                    setCheckStatus('available')
                } else {
                    setCheckStatus('taken')
                }
                setStatusMessage(data.message || '')
            } catch (err) {
                setCheckStatus('error')
                setStatusMessage('Error checking username')
            }
        }

        const timer = setTimeout(checkUsername, 500)
        return () => clearTimeout(timer)
    }, [currentInputValue, isEditing, user?.name])

    return (
        <div className="border-border bg-bg-subtle/50 mb-4 space-y-3 rounded-lg border p-5 md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <Label
                        htmlFor="name"
                        className="text-text-primary text-sm font-bold tracking-wider uppercase"
                    >
                        Username
                    </Label>
                    <p className="text-text-muted mt-0.5 text-xs">
                        Your unique identifier. You can only change it once every 15 days.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                        if (isEditing) {
                            setIsEditing(false)
                            setValue('name', user?.name || '') // revert
                        } else {
                            setIsEditing(true)
                        }
                    }}
                >
                    {isEditing ? 'Cancel Edit' : 'Change'}
                </Button>
            </div>

            <div className="relative">
                <AtSign
                    className={`absolute top-1/2 left-3 -translate-y-1/2 transition-colors ${isEditing ? 'text-accent' : 'text-text-muted'}`}
                    size={16}
                />
                <Input
                    id="name"
                    {...register('name')}
                    disabled={!isEditing}
                    className={`pl-10 font-medium ${
                        !isEditing
                            ? 'bg-bg-page/50 border-input opacity-100'
                            : checkStatus === 'taken' || checkStatus === 'cooldown' || error
                              ? 'border-error ring-error focus-visible:ring-error ring-1'
                              : checkStatus === 'available'
                                ? 'border-success ring-success focus-visible:ring-success ring-1'
                                : 'border-accent ring-accent focus-visible:ring-accent ring-1'
                    }`}
                    placeholder="e.g. alex_rivera"
                />
                {isEditing && checkStatus === 'checking' && (
                    <Loader2 className="text-text-muted absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                )}
            </div>

            {isEditing && statusMessage && (
                <p
                    className={`ml-1 text-xs font-semibold ${
                        checkStatus === 'available'
                            ? 'text-success'
                            : checkStatus === 'checking'
                              ? 'text-text-muted'
                              : 'text-error'
                    }`}
                >
                    {statusMessage}
                </p>
            )}
            {error && !statusMessage && (
                <p className="text-error ml-1 text-xs font-semibold">{error.message}</p>
            )}
        </div>
    )
}

export default function PersonalInfoForm({
    register,
    errors,
    watch,
    setValue,
    user,
    bioValue = '',
}) {
    return (
        <Card className="p-6">
            <UsernameField
                register={register}
                error={errors.name}
                watch={watch}
                setValue={setValue}
                user={user}
            />

            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                    <InlineEditField
                        id="bio"
                        label="Bio"
                        isTextArea
                        register={register}
                        error={errors.bio}
                        placeholder="Tell us about your coding journey..."
                        charLimit={160}
                        watchValue={bioValue}
                    />
                </div>

                <InlineEditField
                    id="country"
                    label="Country"
                    icon={Globe}
                    register={register}
                    error={errors.country}
                    options={COUNTRIES}
                />

                <InlineEditField
                    id="location"
                    label="City / State"
                    icon={MapPin}
                    register={register}
                    error={errors.location}
                    placeholder="e.g. San Francisco, CA"
                />

                <InlineEditField
                    id="website"
                    label="Website"
                    icon={Globe}
                    register={register}
                    error={errors.website}
                    placeholder="https://arivera.dev"
                />
            </div>
        </Card>
    )
}
