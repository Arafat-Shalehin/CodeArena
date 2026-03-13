import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Linkedin, Twitter } from 'lucide-react'

export default function SocialProfilesForm({ register, errors }) {
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
                            className="pl-10"
                            placeholder="username"
                        />
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
                            className="pl-10"
                            placeholder="profile-id"
                        />
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
                            className="pl-10"
                            placeholder="@handle"
                        />
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
