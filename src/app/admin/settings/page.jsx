'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from 'next-themes'
import {
    Settings as SettingsIcon,
    User,
    Lock,
    Camera,
    Github,
    Linkedin,
    Globe,
    Save,
    Loader2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminSettingsPage() {
    const { user, isLoading, syncUser } = useAuth()
    const { theme } = useTheme()
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        github: '',
        linkedin: '',
        website: '',
    })

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

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save these changes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--ca-accent)',
            cancelButtonColor: 'var(--ca-border)',
            confirmButtonText: 'Yes, update it!',
            background: 'var(--ca-bg-page)',
            color: 'var(--ca-text-primary)',
        })

        if (result.isConfirmed) {
            setIsSaving(true)
            try {
                const userId = user?.id || user?._id
                const res = await fetch(`/api/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: formData.name,
                        bio: formData.bio,
                        socials: {
                            github: formData.github,
                            linkedin: formData.linkedin,
                            website: formData.website,
                        },
                    }),
                })
                const data = await res.json()
                if (!data.success) throw new Error(data.message || 'Update failed')

                await syncUser?.()

                Swal.fire({
                    title: 'Updated!',
                    text: 'Your profile has been updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: 'var(--ca-bg-page)',
                    color: 'var(--ca-text-primary)',
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
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-accent/10 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <Loader2 className="text-accent h-10 w-10 animate-spin" />
                </div>
                <p className="text-text-muted text-xs font-medium tracking-wide opacity-70">
                    Syncing Terminal...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col gap-1 px-4 md:px-0">
                <h1 className="text-text-primary text-3xl leading-none font-semibold tracking-tight">
                    Security <span className="text-accent">& Settings</span>
                </h1>
                <p className="text-text-muted text-sm font-medium opacity-75">
                    Administrative Core Configuration
                </p>
            </header>

            <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-12 md:px-0">
                {/* Left: Navigation */}
                <div className="space-y-4 md:col-span-4">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-5 py-4 text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                            activeTab === 'profile'
                                ? 'bg-accent shadow-accent/20 translate-x-2 text-white shadow-lg'
                                : 'text-text-muted hover:bg-bg-subtle/50 hover:text-text-primary border-border/50 border'
                        }`}
                    >
                        <User
                            size={16}
                            className={activeTab === 'profile' ? 'animate-pulse' : 'opacity-40'}
                        />
                        Identity Profile
                        {activeTab === 'profile' && (
                            <div className="absolute top-1/2 -left-1 h-6 w-1 -translate-y-1/2 rounded-full bg-white/40" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('security')}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-5 py-4 text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                            activeTab === 'security'
                                ? 'bg-accent shadow-accent/20 translate-x-2 text-white shadow-lg'
                                : 'text-text-muted hover:bg-bg-subtle/50 hover:text-text-primary border-border/50 border'
                        }`}
                    >
                        <Lock
                            size={16}
                            className={activeTab === 'security' ? 'animate-pulse' : 'opacity-40'}
                        />
                        Vault Security
                        {activeTab === 'security' && (
                            <div className="absolute top-1/2 -left-1 h-6 w-1 -translate-y-1/2 rounded-full bg-white/40" />
                        )}
                    </button>

                    <div className="matte-surface border-border bg-bg-subtle/20 mt-8 rounded-2xl border p-5 opacity-60">
                        <div className="flex items-center justify-between">
                            <span className="text-text-muted text-[10px] font-semibold tracking-wide uppercase">
                                Terminal Mode
                            </span>
                            <span className="text-accent text-[10px] font-semibold tracking-wide uppercase">
                                {theme?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="md:col-span-8">
                    <form onSubmit={handleSave} className="space-y-8">
                        <Card className="matte-surface border-border bg-bg-subtle/40 hover:border-accent/20 overflow-hidden rounded-3xl border shadow-2xl transition-all">
                            <CardContent className="space-y-10 p-8 md:p-10">
                                {activeTab === 'profile' ? (
                                    <>
                                        <div className="border-border/50 flex flex-col items-center gap-8 border-b pb-10 sm:flex-row">
                                            <div className="group relative">
                                                <div className="from-accent to-accent/20 relative h-24 w-24 rounded-2xl bg-linear-to-tr p-1">
                                                    <div className="bg-bg-page border-bg-page text-accent flex h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 text-3xl font-black italic shadow-inner">
                                                        {user?.name?.charAt(0) || 'A'}
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                                                    <Camera size={20} className="animate-bounce" />
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <h3 className="text-text-primary text-sm font-semibold tracking-tight">
                                                    Identity Avatar
                                                </h3>
                                                <p className="text-text-muted mt-1 text-xs font-medium opacity-70">
                                                    Your administrative presence
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="border-border hover:bg-accent/10 hover:text-accent mt-4 h-8 rounded-lg px-5 text-xs font-medium transition-all"
                                                >
                                                    Upload New
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75">
                                                    Administrative Entity Name
                                                </label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            name: e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. Administrator"
                                                    className="matte-surface border-border/50 bg-bg-muted/20 focus-visible:ring-accent h-12 rounded-xl px-4 text-sm font-medium transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75">
                                                    Core Objective & Biography
                                                </label>
                                                <Textarea
                                                    value={formData.bio}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            bio: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Detail your administrative focus..."
                                                    className="matte-surface border-border/50 bg-bg-muted/20 focus-visible:ring-accent min-h-30 rounded-xl p-4 text-sm font-medium transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="text-text-muted ml-1 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-75">
                                                        <Github size={12} /> GitHub Profile
                                                    </label>
                                                    <Input
                                                        value={formData.github}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                github: e.target.value,
                                                            })
                                                        }
                                                        placeholder="username"
                                                        className="matte-surface border-border/50 bg-bg-muted/20 focus-visible:ring-accent h-12 rounded-xl px-4 text-sm font-medium transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-text-muted ml-1 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-75">
                                                        <Linkedin size={12} /> LinkedIn Profile
                                                    </label>
                                                    <Input
                                                        value={formData.linkedin}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                linkedin: e.target.value,
                                                            })
                                                        }
                                                        placeholder="username"
                                                        className="matte-surface border-border/50 bg-bg-muted/20 focus-visible:ring-accent h-12 rounded-xl px-4 text-sm font-medium transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex min-h-75 flex-col items-center justify-center space-y-4 text-center">
                                        <div className="bg-accent/10 border-accent/20 flex size-16 items-center justify-center rounded-3xl border">
                                            <Lock size={32} className="text-accent opacity-60" />
                                        </div>
                                        <div>
                                            <h3 className="text-text-primary text-base font-semibold tracking-tight">
                                                Security Protocol Locked
                                            </h3>
                                            <p className="text-text-muted mx-auto max-w-xs text-xs font-medium opacity-70">
                                                Advanced security configuration is currently handled
                                                via the main terminal vault.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="border-border hover:bg-accent/10 hover:text-accent mt-4 h-10 rounded-xl px-8 text-sm font-medium"
                                        >
                                            Request Access
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4">
                            <Button
                                disabled={isSaving}
                                type="submit"
                                className="bg-accent hover:bg-accent/90 focus:ring-accent/40 w-full rounded-2xl py-7 text-sm font-semibold text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 sm:w-auto sm:px-16"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-3 size-5 animate-spin" />
                                ) : (
                                    <Save size={18} className="mr-3" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
