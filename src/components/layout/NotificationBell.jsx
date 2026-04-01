'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, MessageSquare, Trophy, Code2, Sparkles, Loader2 } from 'lucide-react'
import { useNotification } from '@/hooks/useNotification'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS = {
    social: <MessageSquare className="h-4 w-4 text-blue-500" />,
    contest: <Trophy className="h-4 w-4 text-yellow-500" />,
    judging: <Code2 className="h-4 w-4 text-green-500" />,
    ai_insight: <Sparkles className="h-4 w-4 text-purple-500" />,
}

export default function NotificationBell() {
    const router = useRouter()
    const {
        notifications,
        unreadCount,
        hasMore,
        loading,
        loadingMore,
        loadMore,
        markAllAsRead,
        markNotificationAsRead,
    } = useNotification()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const normalizeMessage = (message = '') => {
        if (!message) return ''
        return message.replace(/^undefined\s+/i, 'Someone ')
    }

    const handleNotificationClick = async (notif) => {
        await markNotificationAsRead(notif._id)
        setIsOpen(false)
        if (notif.link) {
            router.push(notif.link)
        }
    }

    const handleNotificationKeyDown = (event, notif) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleNotificationClick(notif)
        }
    }

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
                aria-label="View notifications"
                aria-expanded={isOpen}
            >
                <Bell className="text-text-secondary h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="bg-error ring-bg-page absolute top-2.5 right-2.5 flex size-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 select-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    data-lenis-prevent
                    className="bg-bg-page border-border animate-fade-up absolute right-0 z-100 mt-2 w-104 overflow-hidden rounded-2xl border shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
                >
                    <div className="border-border flex items-center justify-between border-b px-4 py-3">
                        <h3 className="text-text-primary text-[1.85rem] leading-none font-bold">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-accent hover:text-accent-hover text-sm font-semibold"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div
                        data-lenis-prevent
                        onWheelCapture={(e) => e.stopPropagation()}
                        className="custom-scrollbar max-h-[78vh] space-y-1 overflow-y-auto p-2"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center px-6 py-10">
                                <Loader2 className="text-text-muted h-5 w-5 animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="flex flex-col">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        onKeyDown={(event) =>
                                            handleNotificationKeyDown(event, notif)
                                        }
                                        role="button"
                                        tabIndex={0}
                                        className={`group focus:ring-accent/40 relative mb-1 flex w-full cursor-pointer gap-3 rounded-xl px-3 py-3 text-left transition-colors focus:ring-2 focus:outline-none ${
                                            !notif.isRead
                                                ? 'bg-accent/5 hover:bg-accent/10'
                                                : 'hover:bg-bg-subtle'
                                        }`}
                                    >
                                        <div className="bg-bg-subtle border-border mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-transform group-hover:scale-105">
                                            {TYPE_ICONS[notif.type] || (
                                                <Bell className="text-text-muted h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <p
                                                className={`leading-snug ${
                                                    notif.isRead
                                                        ? 'text-text-secondary text-[14px] font-medium'
                                                        : 'text-text-primary text-[14px] font-semibold'
                                                }`}
                                            >
                                                {normalizeMessage(notif.message)}
                                            </p>
                                            <span className="text-text-muted mt-1 block text-[11px] font-medium">
                                                {formatDistanceToNow(new Date(notif.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        markNotificationAsRead(notif._id)
                                                    }}
                                                    className="text-accent hover:text-accent-hover mt-1 text-[11px] font-semibold"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                        {!notif.isRead && (
                                            <div className="bg-accent absolute top-1/2 right-3 h-2.5 w-2.5 -translate-y-1/2 rounded-full" />
                                        )}
                                    </div>
                                ))}
                                {hasMore && (
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="text-accent hover:bg-bg-subtle mx-2 mt-2 mb-2 flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load more'
                                        )}
                                    </button>
                                )}
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
                </div>
            )}
        </div>
    )
}
