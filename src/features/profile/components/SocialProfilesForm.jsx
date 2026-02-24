import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Linkedin, Twitter } from 'lucide-react'

/**
 * SocialProfilesForm Component
 * * A form section dedicated to managing a user's social media handles.
 * This component handles nested state updates for social media fields
 * (GitHub, LinkedIn, Twitter) and renders them in a responsive grid.
 * * @component
 * @param {Object} props - The component props.
 * @param {Object} props.socials - An object containing the current social media handles.
 * @param {string} [props.socials.github] - The user's GitHub username.
 * @param {string} [props.socials.linkedin] - The user's LinkedIn profile ID.
 * @param {string} [props.socials.twitter] - The user's Twitter/X handle.
 * @param {Function} props.onChange - A callback function to update the parent state.
 * Expected to handle an event-like object containing the updated 'socials' object.
 * * @returns {React.JSX.Element} The rendered social profiles form card.
 */
export default function SocialProfilesForm({ socials, onChange }) {
    /**
     * Intercepts local input changes and packages them into a format
     * compatible with the parent's centralized `handleChange` logic.
     * * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
     * @returns {void}
     */
    const handleChange = (e) => {
        const { name, value } = e.target
        onChange({
            target: {
                name: 'socials',
                value: {
                    ...socials,
                    [name]: value,
                },
            },
        })
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
                            name="github"
                            value={socials.github}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="username"
                        />
                    </div>
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
                            name="linkedin"
                            value={socials.linkedin}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="profile-id"
                        />
                    </div>
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
                            name="twitter"
                            value={socials.twitter}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="@handle"
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
