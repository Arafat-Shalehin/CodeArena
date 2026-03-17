'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CareersHero from '@/features/careers/components/CareersHero'
import MissionSection from '@/features/careers/components/MissionSection'
import LifeSection from '@/features/careers/components/LifeSection'
import RolesSection from '@/features/careers/components/RolesSection'
import PerksSection from '@/features/careers/components/PerksSection'

/**
 * @page CareersPage
 * @description The main Careers Page for CodeArena.
 */
export default function CareersPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-grow">
                <CareersHero />
                <MissionSection />
                <LifeSection />
                <RolesSection />
                <PerksSection />
            </main>

            <Footer />
        </div>
    )
}
