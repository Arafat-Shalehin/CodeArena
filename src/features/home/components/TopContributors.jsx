'use client'

import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Award } from 'lucide-react'

export default function TopContributors({ contributors }) {
    if (!contributors?.length) {
        return <p className="text-text-muted text-xs">No top contributors found.</p>
    }

    return (
        <div className="flex flex-col gap-4">
            {contributors.map((topUser) => (
                <div key={topUser._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${topUser._id}`}>
                            <Avatar className="h-7 w-7 transition-opacity hover:opacity-80">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${topUser.avatarSeed || topUser.name}`}
                                />
                                <AvatarFallback className="bg-bg-muted text-[10px]">
                                    {(topUser.name || 'U').substring(0, 1)}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <Link href={`/profile/${topUser._id}`}>
                            <span className="text-text-primary line-clamp-1 text-xs font-semibold hover:underline">
                                {topUser.name}
                            </span>
                        </Link>
                    </div>
                    <span className="text-accent ml-2 text-[10px] font-bold whitespace-nowrap">
                        {topUser.stats?.score?.toLocaleString() || 0} pts
                    </span>
                </div>
            ))}
        </div>
    )
}
