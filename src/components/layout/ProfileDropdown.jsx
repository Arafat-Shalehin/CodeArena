'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, ChevronDown } from 'lucide-react'

/**
 * @component ProfileDropdown
 * @description Desktop user profile dropdown with avatar, user info, and navigation links.
 * Manages its own open/close state and click-outside dismissal.
 *
 * @param {Object} props
 * @param {Object} props.user - The authenticated user object.
 * @param {Function} props.onLogout - Callback invoked when the user clicks "Sign Out".
 * @returns {JSX.Element} The rendered profile dropdown.
 */
export default function ProfileDropdown({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogoutClick = () => {
        setIsOpen(false)
        onLogout()
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-bg-subtle group flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition-colors"
                aria-label="User menu"
                aria-expanded={isOpen}
            >
                <Avatar className="border-accent/30 size-9 border-2 shadow-sm">
                    <AvatarImage
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name || user.email}`}
                        alt={user.name || 'User'}
                    />
                    <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold">
                        {(user.name || user.email || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <ChevronDown
                    size={12}
                    className={`text-text-muted group-hover:text-text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="bg-bg-page border-border animate-fade-up absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-xl">
                    {/* User Info Header */}
                    <div className="border-border bg-bg-subtle/50 border-b px-4 py-3">
                        <p className="text-text-primary truncate text-sm font-bold">{user.name}</p>
                        <p className="text-text-muted truncate text-xs">{user.email}</p>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="text-text-primary hover:bg-bg-subtle flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        >
                            <User size={16} className="text-text-muted" />
                            My Profile
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-border border-t py-1">
                        <button
                            onClick={handleLogoutClick}
                            className="text-error hover:bg-error-light flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
