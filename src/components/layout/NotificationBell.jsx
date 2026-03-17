'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, MessageSquare, Trophy, Code2, Sparkles, X } from 'lucide-react'
import { useNotification } from '@/hooks/useNotification'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const TYPE_ICONS = {
    social: <MessageSquare className="h-4 w-4 text-blue-500" />,
    contest: <Trophy className="h-4 w-4 text-yellow-500" />,
    judging: <Code2 className="h-4 w-4 text-green-500" />,
    ai_insight: <Sparkles className="h-4 w-4 text-purple-500" />,
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAllAsRead } = useNotification()
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
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-bg-subtle relative flex size-10 items-center justify-center rounded-full transition-all active:scale-95"
            >
                <Bell className="text-text-secondary h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="bg-error ring-bg-page absolute top-2.5 right-2.5 flex size-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 select-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="bg-bg-page border-border animate-fade-up absolute right-0 z-[100] mt-2 w-80 overflow-hidden rounded-xl border shadow-2xl">
                    <div className="flex items-center justify-between border-b p-4">
                        <h3 className="text-sm font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-accent text-xs font-semibold hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="no-scrollbar max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="flex flex-col">
                                {notifications.map((notif) => (
                                    <Link
                                        key={notif._id}
                                        href={notif.link || '#'}
                                        onClick={() => setIsOpen(false)}
                                        className={`group border-border/50 hover:bg-bg-subtle flex gap-3 border-b p-4 transition-colors ${!notif.isRead ? 'bg-accent/5' : ''}`}
                                    >
                                        <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                                            {TYPE_ICONS[notif.type] || (
                                                <Bell className="text-text-muted h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <p className="text-text-primary text-xs leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <span className="text-text-muted text-[10px] font-medium">
                                                {formatDistanceToNow(new Date(notif.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="bg-accent mt-1 ml-auto size-2 shrink-0 rounded-full" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="bg-bg-subtle mb-3 flex size-12 items-center justify-center rounded-full">
                                    <Bell className="text-text-muted h-6 w-6 opacity-20" />
                                </div>
                                <p className="text-text-primary text-sm font-medium">
                                    No new notifications
                                </p>
                                <p className="text-text-muted mt-1 text-xs">
                                    We'll notify you when something important happens.
                                </p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="border-border bg-bg-subtle/50 border-t p-2 text-center">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-accent hover:text-accent-hover block py-1.5 text-xs font-bold transition-colors"
                            >
                                View All Activity
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
