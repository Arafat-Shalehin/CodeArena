import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, MapPin, Globe, CheckCircle } from 'lucide-react'

export default function PersonalInfoForm({ register, errors, bioValue = '' }) {
    return (
        <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Full Name Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="name"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Display Name
                    </Label>
                    <div className="relative">
                        <User
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="name"
                            {...register('name')}
                            className="pl-10"
                            placeholder="Alex Rivera"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-error text-xs font-medium">{errors.name.message}</p>
                    )}
                </div>

                {/* Username Input with Availability Indicator */}
                <div className="space-y-2">
                    <Label
                        htmlFor="username"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Username
                    </Label>
                    <div className="relative">
                        <Mail
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="username"
                            {...register('username')}
                            className="pr-24 pl-10"
                            placeholder="arivera_codes"
                        />
                        {/* Dummy Indicator temporarily */}
                        {!errors.username && (
                            <div className="bg-success-light text-success absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold">
                                <CheckCircle size={10} />
                                Available
                            </div>
                        )}
                    </div>
                    {errors.username && (
                        <p className="text-error text-xs font-medium">{errors.username.message}</p>
                    )}
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
                            className={`text-xs font-medium ${bioValue.length > 140 ? 'text-warning' : 'text-text-muted'}`}
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
                        Location
                    </Label>
                    <div className="relative">
                        <MapPin
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="location"
                            {...register('location')}
                            className="pl-10"
                            placeholder="San Francisco, CA"
                        />
                    </div>
                    {errors.location && (
                        <p className="text-error text-xs font-medium">{errors.location.message}</p>
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
                            type="url"
                            {...register('website')}
                            className="pl-10"
                            placeholder="https://arivera.dev"
                        />
                    </div>
                    {errors.website && (
                        <p className="text-error text-xs font-medium">{errors.website.message}</p>
                    )}
                </div>
            </div>
        </Card>
    )
}
