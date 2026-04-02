import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Twitter, Edit2, X } from 'lucide-react'

const SOCIAL_FIELDS = [
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'username' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'profile-id' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: '@handle' },
]

export default function SocialProfilesForm({ register, errors, watch, setValue, user }) {
    const [isEditing, setIsEditing] = useState(false)

    const handleCancel = () => {
        setIsEditing(false)
        setValue(
            'socials',
            {
                github: user?.socials?.github || '',
                linkedin: user?.socials?.linkedin || '',
                twitter: user?.socials?.twitter || '',
            },
            { shouldDirty: false, shouldTouch: false }
        )
    }

    useEffect(() => {
        if (user?.socials) {
            setValue(
                'socials',
                {
                    github: user.socials.github || '',
                    linkedin: user.socials.linkedin || '',
                    twitter: user.socials.twitter || '',
                },
                { shouldDirty: false, shouldTouch: false }
            )
        }
    }, [user?.socials, setValue])

    return (
        <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-semibold">Social Profiles</h3>
                {!isEditing ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                ) : (
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Cancel
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key} className="space-y-2">
                        <Label
                            htmlFor={key}
                            className="text-text-muted text-xs font-bold tracking-wider uppercase"
                        >
                            {label}
                        </Label>
                        <div className="relative">
                            <Icon
                                className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                                size={16}
                            />
                            <Input
                                id={key}
                                {...register(`socials.${key}`)}
                                readOnly={!isEditing}
                                className={`pl-10 ${!isEditing ? 'bg-bg-subtle cursor-not-allowed opacity-70' : ''}`}
                                placeholder={placeholder}
                            />
                        </div>
                        {errors.socials?.[key] && (
                            <p className="text-error text-xs font-medium">
                                {errors.socials[key].message}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    )
}
