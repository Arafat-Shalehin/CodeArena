'use client'

import React from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { Settings, History, RotateCcw, Maximize } from 'lucide-react'

export default function WorkspaceToolbar() {
    return (
        <div className="border-border bg-bg-subtle flex h-10 shrink-0 items-center justify-between border-b px-3">
            {/* Left Actions (Language, Settings) */}
            <div className="flex items-center gap-2">
                {/* Custom Styled Select Trigger using Design Tokens */}
                <div className="w-[140px]">
                    <Select defaultValue="python">
                        <SelectTrigger className="bg-bg-page hover:bg-bg-muted h-7 border-none px-2 text-xs shadow-none transition-colors focus:ring-0">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="python">
                                <span className="text-success mr-1 font-bold">Py</span> Python 3
                            </SelectItem>
                            <SelectItem value="cpp">
                                <span className="text-primary mr-1 font-bold">C++</span> C++
                            </SelectItem>
                            <SelectItem value="javascript">
                                <span className="text-warning mr-1 font-bold">Js</span> JavaScript
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-border mx-1 h-4 w-px" />

                <button className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors">
                    <Settings size={16} />
                </button>
                <button className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors">
                    <History size={16} />
                </button>
            </div>

            {/* Right Actions (Reset, Fullscreen) */}
            <div className="flex items-center gap-2">
                <button className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors">
                    <RotateCcw size={16} />
                </button>
                <button className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors">
                    <Maximize size={16} />
                </button>
            </div>
        </div>
    )
}
