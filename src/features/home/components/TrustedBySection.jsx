'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { SiGoogle, SiMeta, SiApple, SiNetflix, SiGithub } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'

export default function TrustedBySection() {
    const shouldReduceMotion = useSafeReducedMotion()

    const companies = [
        { name: 'Google', icon: SiGoogle, color: 'group-hover:text-[#4285F4]' },
        { name: 'Amazon', icon: FaAmazon, color: 'group-hover:text-[#FF9900]' },
        { name: 'Meta', icon: SiMeta, color: 'group-hover:text-[#0668E1]' },
        {
            name: 'Apple',
            icon: SiApple,
            color: 'group-hover:text-black dark:group-hover:text-white',
        },
        { name: 'Netflix', icon: SiNetflix, color: 'group-hover:text-[#E50914]' },
        {
            name: 'GitHub',
            icon: SiGithub,
            color: 'group-hover:text-[#181717] dark:group-hover:text-white',
        },
    ]

    return (
        <section className="border-border bg-bg-subtle/50 overflow-hidden border-y py-2">
            <div className="mx-auto max-w-7xl px-4 text-center">
                <motion.p
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-text-muted mb-8 text-sm font-bold tracking-widest uppercase"
                >
                    Trusted by developers from top tech companies
                </motion.p>

                <div className="relative flex w-full flex-col items-center justify-center">
                    {/* Seamless scrolling row */}
                    <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                        <motion.div
                            animate={{ x: shouldReduceMotion ? 0 : ['0%', '-50%'] }}
                            transition={{
                                duration: 30,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="flex flex-none items-center gap-16 pr-16 lg:gap-32 lg:pr-32"
                        >
                            {[...companies, ...companies].map((company, index) => (
                                <div
                                    key={index}
                                    className={`group flex cursor-pointer items-center justify-center gap-3 opacity-50 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0`}
                                    title={company.name}
                                >
                                    <company.icon
                                        className={`text-4xl ${company.color} transition-colors duration-300`}
                                        aria-hidden="true"
                                    />
                                    <span className="font-display hidden text-xl font-bold sm:block">
                                        {company.name}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
