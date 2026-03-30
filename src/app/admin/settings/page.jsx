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
  Globe
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
        website: ''
    })

    // ইউজার ডাটা লোড হলে স্টেট আপডেট
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                github: user.socials?.github || '',
                linkedin: user.socials?.linkedin || '',
                website: user.socials?.website || ''
            })
        }
    }, [user])

    const handleSave = async (e) => {
        e.preventDefault()
        
        // কনফার্মেশন এলার্ট
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to save these changes?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6', // accent color
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, update it!',
            background: theme === 'dark' ? '#1e293b' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000'
        })

        if (result.isConfirmed) {
            setIsSaving(true)
            try {
                // এখানে আপনার API কল হবে
                // const res = await axios.patch('/api/user/update', formData)
                
                await new Promise(resolve => setTimeout(resolve, 1000)) // সিমুলেশন
                
                await syncUser?.() // প্রোফাইল ডাটা রিফ্রেশ

                Swal.fire({
                    title: 'Updated!',
                    text: 'Your profile has been updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000'
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
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Page Header */}
            <header className="flex items-center gap-4">
                <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase italic text-text-primary leading-none">Account Settings</h1>
                    <p className="text-sm text-text-muted mt-1">Manage your public profile and preferences</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-4 space-y-2">
                    <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold bg-accent text-white shadow-lg shadow-accent/20">
                        <User size={18} /> Public Profile
                    </button>
                    <button 
                        onClick={() => Swal.fire('Coming Soon', 'Password change feature is under development', 'info')}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold text-text-secondary hover:bg-bg-subtle transition-all"
                    >
                        <Lock size={18} /> Security
                    </button>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSave} className="bg-bg-subtle border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                        
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
                            <div className="relative group cursor-pointer">
                                <div className="h-24 w-24 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-accent text-3xl font-bold overflow-hidden">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white">
                                    <Camera size={20} />
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="font-bold text-text-primary">Profile Photo</h3>
                                <p className="text-xs text-text-muted mb-4 uppercase tracking-widest font-bold">Recommended: Square JPG or PNG</p>
                                <button type="button" className="px-4 py-2 bg-bg-page hover:border-accent rounded-lg text-xs font-bold transition-all border border-border">
                                    Change Avatar
                                </button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Display Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-bg-page border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Bio</label>
                                <textarea 
                                    rows="3"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full bg-bg-page border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-4 border-t border-border space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Social Profiles</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Github className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="GitHub Username"
                                        value={formData.github}
                                        onChange={(e) => setFormData({...formData, github: e.target.value})}
                                        className="w-full bg-bg-page border border-border rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="relative">
                                    <Linkedin className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="LinkedIn Username"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                        className="w-full bg-bg-page border border-border rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-accent hover:bg-accent/90 text-white font-black py-4 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                SAVE UPDATES
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}