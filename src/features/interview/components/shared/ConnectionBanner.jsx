import React from 'react'
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react'

export default function ConnectionBanner({ status }) {
    if (status === 'connected') return null

    const config = {
        disconnected: {
            icon: <WifiOff size={14} />,
            text: 'Disconnected from server. Attempting to reconnect...',
            bg: 'bg-red-500/10 text-red-500',
        },
        reconnecting: {
            icon: <RefreshCw size={14} className="animate-spin" />,
            text: 'Reconnecting to interview session...',
            bg: 'bg-yellow-500/10 text-yellow-500',
        },
        failed: {
            icon: <AlertCircle size={14} />,
            text: 'Connection failed. Please check your network.',
            bg: 'bg-red-600 text-white',
        },
    }

    const { icon, text, bg } = config[status] || config.disconnected

    return (
        <div
            className={`flex items-center justify-center gap-2 px-4 py-1.5 text-[11px] font-bold tracking-tight transition-all duration-300 ${bg}`}
        >
            {icon}
            {text}
        </div>
    )
}
