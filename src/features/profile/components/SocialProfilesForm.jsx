import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Linkedin, Twitter, X } from 'lucide-react'

export default function SocialProfilesForm({ register, errors, watch, setValue }) {
    const githubValue = watch ? watch('socials.github') || '' : ''
    const linkedinValue = watch ? watch('socials.linkedin') || '' : ''
    const twitterValue = watch ? watch('socials.twitter') || '' : ''

    const handleClear = (field) => {
        if (setValue) {
            setValue(`socials.${field}`, '', { shouldValidate: true })
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">Social Profiles</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* GitHub Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="github"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        GitHub
                    </Label>
                    <div className="relative">
                        <Github
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="github"
                            {...register('socials.github')}
                            className="pr-10 pl-10"
                            placeholder="username"
                        />
                        {githubValue && (
                            <button
                                type="button"
                                onClick={() => handleClear('github')}
                                className="text-text-muted hover:text-error absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                title="Remove GitHub"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {errors.socials?.github && (
                        <p className="text-error text-xs font-medium">
                            {errors.socials.github.message}
                        </p>
                    )}
                </div>

                {/* LinkedIn Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="linkedin"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        LinkedIn
                    </Label>
                    <div className="relative">
                        <Linkedin
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="linkedin"
                            {...register('socials.linkedin')}
                            className="pr-10 pl-10"
                            placeholder="profile-id"
                        />
                        {linkedinValue && (
                            <button
                                type="button"
                                onClick={() => handleClear('linkedin')}
                                className="text-text-muted hover:text-error absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                title="Remove LinkedIn"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {errors.socials?.linkedin && (
                        <p className="text-error text-xs font-medium">
                            {errors.socials.linkedin.message}
                        </p>
                    )}
                </div>

                {/* Twitter Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="twitter"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Twitter
                    </Label>
                    <div className="relative">
                        <Twitter
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="twitter"
                            {...register('socials.twitter')}
                            className="pr-10 pl-10"
                            placeholder="@handle"
                        />
                        {twitterValue && (
                            <button
                                type="button"
                                onClick={() => handleClear('twitter')}
                                className="text-text-muted hover:text-error absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                title="Remove Twitter"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {errors.socials?.twitter && (
                        <p className="text-error text-xs font-medium">
                            {errors.socials.twitter.message}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    )
}
