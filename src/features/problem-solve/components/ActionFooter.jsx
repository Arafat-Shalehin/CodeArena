'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'

export default function ActionFooter() {
    return (
        <div className="border-border bg-bg-subtle flex h-14 shrink-0 items-center justify-between border-t px-6">
            {/* Console Toggler Mockup */}
            <button className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm font-medium transition-colors">
                <ChevronUp size={20} />
                Console
            </button>

            {/* Form Actions */}
            <div className="flex items-center gap-3">
                <Button variant="outline" className="h-9 px-5 text-sm font-semibold">
                    Run Code
                </Button>
                <Button variant="default" className="shadow-accent-glow h-9 px-6 text-sm font-bold">
                    Submit
                </Button>
            </div>
        </div>
    )
}
