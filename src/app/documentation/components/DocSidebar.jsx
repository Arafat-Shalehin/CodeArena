'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { NAV_SECTIONS } from '@/app/documentation/data/docData'

export default function DocSidebar() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('intro')

    const scrollTo = (id) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setMobileNavOpen(false)
        }
    }

    const NavContent = ({ mobile = false }) => (
        <nav className={`flex flex-col gap-6 ${mobile ? '' : 'px-4 lg:px-6'}`}>
            {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                    <p className="text-text-muted mb-2 pl-3 font-mono text-[10px] font-medium tracking-widest uppercase">
                        {section.title}
                    </p>
                    <ul className="flex flex-col gap-0.5">
                        {section.links.map((link) => (
                            <li key={link.id}>
                                <button
                                    onClick={() => {
                                        setActiveSection(link.id)
                                        scrollTo(link.id)
                                    }}
                                    className={`block w-full rounded-md text-left transition-colors ${
                                        mobile ? 'px-3 py-2 text-sm' : 'px-3 py-1.5 text-[13px]'
                                    } ${
                                        activeSection === link.id
                                            ? 'bg-accent-light text-accent-text font-medium'
                                            : 'text-text-muted hover:bg-bg-subtle hover:text-text-primary'
                                    }`}
                                >
                                    {link.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    )

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className="fixed top-0 left-0 hidden h-screen w-64 shrink-0 overflow-y-auto pt-32 pb-8 lg:block"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--ca-border) transparent',
                }}
            >
                <NavContent />
            </aside>

            {/* Spacer for fixed sidebar */}
            <div className="hidden w-64 shrink-0 lg:block" />

            {/* Mobile nav toggle */}
            <div className="fixed right-4 bottom-6 z-50 lg:hidden">
                <Button
                    size="icon"
                    variant="default"
                    className="size-12 rounded-full shadow-lg"
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                >
                    {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </Button>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileNavOpen && (
                <div className="bg-bg-page/95 fixed inset-0 z-40 backdrop-blur-md lg:hidden">
                    <div className="flex h-full flex-col p-6 pt-20">
                        <div className="overflow-y-auto">
                            <NavContent mobile />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
