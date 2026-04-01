'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from 'next-themes'
import {
    Loader2,
    User,
    Lock,
    Settings as SettingsIcon,
    Save,
    Camera,
    Github,
    Linkedin,
    Globe,
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function AdminSettingsPage() {
    const { user, isLoading, syncUser } = useAuth()
    const { theme, setTheme } = useTheme()
    const [isSaving, setIsSaving] = useState(false)

    // ফর্ম স্টেট
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        github: '',
        linkedin: '',
        website: '',
    })

    // ইউজার ডাটা লোড হলে স্টেট আপডেট
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                github: user.socials?.github || '',
                linkedin: user.socials?.linkedin || '',
                website: user.socials?.website || '',
            })
        }
    }, [user])

    const handleSave = async (e) => {
        e.preventDefault()

        // কনফার্মেশন এলার্ট
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save these changes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6', // accent color
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, update it!',
            background: theme === 'dark' ? '#1e293b' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
        })

        if (result.isConfirmed) {
            setIsSaving(true)
            try {
                // এখানে আপনার API কল হবে
                // const res = await axios.patch('/api/user/update', formData)

                await new Promise((resolve) => setTimeout(resolve, 1000)) // সিমুলেশন

                await syncUser?.() // প্রোফাইল ডাটা রিফ্রেশ

                Swal.fire({
                    title: 'Updated!',
                    text: 'Your profile has been updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                })
            } catch (error) {
                Swal.fire('Error!', 'Failed to update profile.', 'error')
            } finally {
                setIsSaving(false)
            }
        }
    }

    if (isLoading || !user) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="text-accent h-10 w-10 animate-spin" />
            </div>
        )
    }

    return (
        <div className="animate-in fade-in mx-auto max-w-5xl space-y-8 p-4 duration-500 md:p-8">
            {/* Page Header */}
            <header className="flex items-center gap-4">
                <div className="bg-accent/10 text-accent flex h-12 w-12 items-center justify-center rounded-2xl">
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h1 className="text-text-primary text-2xl leading-none font-black uppercase italic">
                        Account Settings
                    </h1>
                    <p className="text-text-muted mt-1 text-sm">
                        Manage your public profile and preferences
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Sidebar Navigation */}
                <div className="space-y-2 lg:col-span-4">
                    <button className="bg-accent shadow-accent/20 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold text-white shadow-lg">
                        <User size={18} /> Public Profile
                    </button>
                    <button
                        onClick={() =>
                            Swal.fire(
                                'Coming Soon',
                                'Password change feature is under development',
                                'info'
                            )
                        }
                        className="text-text-secondary hover:bg-bg-subtle flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all"
                    >
                        <Lock size={18} /> Security
                    </button>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-8">
                    <form
                        onSubmit={handleSave}
                        className="bg-bg-subtle border-border space-y-6 rounded-2xl border p-6 shadow-sm md:p-8"
                    >
                        {/* Avatar Section */}
                        <div className="border-border flex flex-col items-center gap-6 border-b pb-6 sm:flex-row">
                            <div className="group relative cursor-pointer">
                                <div className="bg-accent/10 border-accent text-accent flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 text-3xl font-bold">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <Camera size={20} />
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-text-primary font-bold">Profile Photo</h3>
                                <p className="text-text-muted mb-4 text-xs font-bold tracking-widest uppercase">
                                    Recommended: Square JPG or PNG
                                </p>
                                <button
                                    type="button"
                                    className="bg-bg-page hover:border-accent border-border rounded-lg border px-4 py-2 text-xs font-bold transition-all"
                                >
                                    Change Avatar
                                </button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-text-muted mb-2 block text-[10px] font-black tracking-[0.2em] uppercase">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="bg-bg-page border-border focus:ring-accent/20 w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="text-text-muted mb-2 block text-[10px] font-black tracking-[0.2em] uppercase">
                                    Bio
                                </label>
                                <textarea
                                    rows="3"
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bio: e.target.value })
                                    }
                                    className="bg-bg-page border-border focus:ring-accent/20 w-full resize-none rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="border-border space-y-4 border-t pt-4">
                            <h4 className="text-text-primary text-xs font-black tracking-widest uppercase">
                                Social Profiles
                            </h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="relative">
                                    <Github
                                        className="text-text-muted absolute top-3.5 left-4"
                                        size={18}
                                    />
                                    <input
                                        type="text"
                                        placeholder="GitHub Username"
                                        value={formData.github}
                                        onChange={(e) =>
                                            setFormData({ ...formData, github: e.target.value })
                                        }
                                        className="bg-bg-page border-border focus:border-accent w-full rounded-xl border py-3 pr-4 pl-12 text-sm outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <Linkedin
                                        className="text-text-muted absolute top-3.5 left-4"
                                        size={18}
                                    />
                                    <input
                                        type="text"
                                        placeholder="LinkedIn Username"
                                        value={formData.linkedin}
                                        onChange={(e) =>
                                            setFormData({ ...formData, linkedin: e.target.value })
                                        }
                                        className="bg-bg-page border-border focus:border-accent w-full rounded-xl border py-3 pr-4 pl-12 text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-accent hover:bg-accent/90 shadow-accent/20 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                SAVE UPDATES
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
