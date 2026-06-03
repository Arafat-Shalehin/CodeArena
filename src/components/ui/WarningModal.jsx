'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'codearena-infra-warning-dismissed'

export function WarningModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [dontShowAgain, setDontShowAgain] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const dismissed = localStorage.getItem(STORAGE_KEY)
        if (dismissed !== 'true') {
            setIsOpen(true)
        }
    }, [])

    const handleDismiss = () => {
        if (dontShowAgain) {
            localStorage.setItem(STORAGE_KEY, 'true')
        }
        setIsOpen(false)
    }

    if (!mounted) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="max-w-md w-[92vw] border-border/80 bg-bg-page/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl animate-fade-up overflow-hidden"
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Visual Accent Glow Top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-warning via-accent to-warning/50 opacity-90" />

                <DialogHeader className="flex flex-col items-center text-center gap-4 pt-2">
                    {/* Icon Container with Soft Pulse Ring */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-warning-light/20 dark:bg-warning-light/10 text-warning border border-warning/20 animate-soft-pulse relative">
                        <AlertTriangle className="w-8 h-8" strokeWidth={2} />
                    </div>

                    <DialogTitle className="text-xl font-bold font-display text-text-primary tracking-tight md:text-2xl mt-1">
                        Infrastructure Notice
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-center text-text-secondary text-sm leading-relaxed mt-2 px-1">
                    CodeArena is currently running on <span className="font-semibold text-warning-text bg-warning-light/30 dark:bg-warning-light/20 px-1.5 py-0.5 rounded">limited infrastructure resources</span>. 
                    Core coding challenges, profiles, and submissions remain fully operational. 
                    However, some advanced features like real-time collaboration, heavy container testing, and code execution suites might experience temporary latency or intermittent failures.
                </DialogDescription>

                <div className="mt-6 flex flex-col gap-4">
                    {/* Primary Button */}
                    <Button 
                        onClick={handleDismiss} 
                        className="w-full h-11 bg-accent text-white hover:bg-accent-hover font-semibold rounded-xl transition-all duration-300 shadow-md group"
                        rightIcon={<ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    >
                        Continue to Platform
                    </Button>

                    {/* Don't show again toggle */}
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <Checkbox 
                            id="dont-show-infra-warning" 
                            checked={dontShowAgain}
                            onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                            className="w-4 h-4 rounded border-border-strong text-accent focus:ring-accent"
                        />
                        <label 
                            htmlFor="dont-show-infra-warning"
                            className="text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none font-medium transition-colors duration-200"
                        >
                            Don't show this message again
                        </label>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
