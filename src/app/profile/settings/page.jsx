'use client'

import React, { useState } from 'react'
import SettingsSidebar from '@/features/profile/components/SettingsSidebar'
import PersonalInfoForm from '@/features/profile/components/PersonalInfoForm'
import SocialProfilesForm from '@/features/profile/components/SocialProfilesForm'
import { INITIAL_USER_DATA } from '@/features/profile/data/settings.data'
import { Button } from '@/components/ui/button'
import ProfilePictureCard from '@/features/profile/components/ProfilePictureCard'

/**
 * SettingsPage Component
 * * The primary view for users to manage their account settings on CodeArena.
 * Features a dynamic sidebar to switch between different settings sections
 * (Profile, Security, Notifications, etc.) and a centralized state for
 * form data management.
 * * @returns {React.JSX.Element} The rendered Settings page.
 */
export default function SettingsPage() {
    /** * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
     * Tracks the currently visible settings tab.
     */
    const [activeSection, setActiveSection] = useState('profile')

    /** * @type {[Object, React.Dispatch<React.SetStateAction<Object>>]}
     * Holds the master state for all user profile fields.
     */
    const [formData, setFormData] = useState(INITIAL_USER_DATA)

    /**
     * Handles input changes for standard text fields and updates the centralized formData state.
     * * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event from the input field.
     * @returns {void}
     */
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    /**
     * Submits the current formData to the backend or API service.
     * Currently performs a console log and success alert as a placeholder.
     * * @async
     * @returns {void}
     */
    const handleSave = () => {
        // Placeholder for save logic
        console.log('Saving changes:', formData)
        alert('Changes saved successfully!')
    }

    return (
        <div className="bg-bg-page min-h-screen">
            <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                <div className="mb-10">
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight">
                        Profile Information
                    </h1>
                    <p className="text-text-secondary mt-2">
                        Update your personal details and how you appear to others on CodeArena.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Sidebar */}
                    <SettingsSidebar
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        className="lg:col-span-3"
                    />

                    {/* Content Section */}
                    <div className="space-y-8 lg:col-span-9">
                        {activeSection === 'profile' && (
                            <>
                                <ProfilePictureCard
                                    avatarUrl={formData.avatar}
                                    onUpload={() => {}}
                                    onRemove={() =>
                                        setFormData((prev) => ({ ...prev, avatar: '' }))
                                    }
                                />
                                <PersonalInfoForm formData={formData} onChange={handleChange} />
                                <SocialProfilesForm
                                    socials={formData.socials}
                                    onChange={handleChange}
                                />

                                <div className="border-border flex items-center justify-end gap-4 border-t pt-4">
                                    <Button
                                        variant="ghost"
                                        className="text-text-secondary font-semibold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="shadow-accent-glow px-8"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Coming Soon Placeholder */}
                        {activeSection !== 'profile' && (
                            <div className="bg-bg-subtle border-border text-text-muted rounded-lg border p-12 text-center">
                                <p className="text-sm font-medium">
                                    This settings section is coming soon.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
