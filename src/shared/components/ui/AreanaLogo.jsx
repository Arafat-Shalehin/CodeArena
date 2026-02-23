import Link from 'next/link'
import React from 'react'

const AreanaLogo = () => {
    return (
        <Link href="/" className="group flex shrink-0 items-center gap-2">
            <div className="size-8 transition-transform group-hover:scale-110">
                <img src="/logo.svg" alt="CodeArena Logo" className="h-full w-full" />
            </div>
            <span className="text-text-primary group-hover:text-accent font-sans text-xl font-bold tracking-tight transition-colors">
                CodeArena
            </span>
        </Link>
    )
}

export default AreanaLogo
