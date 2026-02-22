'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, ChevronDown } from 'lucide-react';

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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setIsOpen(false);
        onLogout();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-bg-subtle transition-colors group"
                aria-label="User menu"
            >
                <Avatar className="size-9 border-2 border-accent/30 shadow-sm">
                    <AvatarImage
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.username}`}
                        alt={user.username}
                    />
                    <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-text-primary max-w-[120px] truncate">
                    {user.username}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-bg-page border border-border rounded-xl shadow-xl overflow-hidden animate-fade-up z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border bg-bg-subtle/50">
                        <p className="text-sm font-bold text-text-primary truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                            {user.email}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-subtle transition-colors"
                        >
                            <User size={16} className="text-text-muted" />
                            My Profile
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border py-1">
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-light transition-colors w-full text-left"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
