'use client'

import React from 'react'
import { MagnifyingGlass } from 'react-loader-spinner'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'

export default function WorkspaceLoader() {
    return (
        <div className="bg-bg-page relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
            {/* Subtle background grid */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(rgba(var(--text-primary-rgb), 1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--text-primary-rgb), 1) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at center, black 10%, transparent 80%)',
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                {/* The Requested Magnifying Glass Loader */}
                <div className="relative flex items-center justify-center">
                    {/* Soft background glow for the loader */}
                    <div className="absolute h-[80px] w-[80px] rounded-full bg-[#e15b64]/10 blur-[30px]" />

                    <MagnifyingGlass
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="magnifying-glass-loading"
                        wrapperStyle={{}}
                        wrapperClass="magnifying-glass-wrapper relative z-10"
                        glassColor="#c0efff"
                        color="#e15b64"
                    />
                </div>

                {/* Elegant Brand Text below the loader */}
                <div className="flex flex-col items-center gap-3">
                    <div className="border-border/50 bg-bg-muted/30 flex items-center gap-3 rounded-full border px-6 py-2.5 opacity-90 shadow-sm backdrop-blur-sm">
                        <AreanaLogo className="scale-75 drop-shadow-sm" />
                        <span className="text-text-primary text-[14px] font-bold tracking-[0.2em] uppercase">
                            CodeArena
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
