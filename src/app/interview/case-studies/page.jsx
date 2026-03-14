'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, ChevronRight, Star, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CASE_STUDIES = [
    {
        title: 'Landing a Role at Google',
        company: 'Google',
        candidate: 'Sarah J.',
        outcome: 'L4 Software Engineer',
        tags: ['System Design', 'Algorithms'],
        description:
            'How Sarah used CodeArena to practice complex graph problems and behavioral signals.',
    },
    {
        title: 'From Boot camp to Meta',
        company: 'Meta',
        candidate: 'Marcus K.',
        outcome: 'Production Engineer',
        tags: ['Infrastructure', 'Python'],
        description:
            'Marcus focused on high-pressure mock interviews to build technical communication skills.',
    },
]

export default function CaseStudiesPage() {
    return (
        <main className="bg-bg-page min-h-screen px-4 pt-32 pb-20">
            <div className="container mx-auto max-w-5xl">
                <Link
                    href="/interview"
                    className="text-text-secondary hover:text-accent mb-12 inline-flex items-center gap-2 font-bold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-accent/20 bg-accent/10 text-accent mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black tracking-widest uppercase"
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        Success Stories
                    </motion.div>
                    <h1 className="text-text-primary mb-4 text-5xl font-[1000] tracking-tight">
                        Alex's{' '}
                        <span className="text-accent font-serif italic">Success Matrix.</span>
                    </h1>
                    <p className="text-text-secondary text-xl font-medium">
                        See how elite engineers use our AI to land offers at top-tier tech
                        companies.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {CASE_STUDIES.map((study, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group border-border bg-bg-subtle/50 hover:bg-bg-subtle/80 relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-500"
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div className="bg-bg-page border-border flex h-12 w-12 items-center justify-center rounded-2xl border">
                                    <Briefcase className="text-accent h-6 w-6" />
                                </div>
                                <div className="flex gap-2">
                                    {study.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-accent/10 border-accent/20 text-accent rounded-full border px-3 py-1 text-[10px] font-black uppercase"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-text-primary group-hover:text-accent mb-2 text-2xl font-bold transition-colors">
                                {study.title}
                            </h3>
                            <p className="text-text-secondary mb-6 text-sm leading-relaxed font-medium">
                                {study.description}
                            </p>

                            <div className="border-border flex items-center justify-between border-t pt-6">
                                <div>
                                    <p className="text-text-muted mb-1 text-xs font-black uppercase">
                                        Candidate
                                    </p>
                                    <p className="text-text-primary text-sm font-bold">
                                        {study.candidate}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-text-muted mb-1 text-xs font-black uppercase">
                                        Outcome
                                    </p>
                                    <p className="text-accent text-sm font-bold">{study.outcome}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="border-accent/20 bg-accent/5 mt-20 rounded-[3rem] border p-12 text-center">
                    <Users className="text-accent mx-auto mb-6 h-12 w-12" />
                    <h2 className="text-text-primary mb-4 text-3xl font-black">
                        Join 5,000+ elite engineers.
                    </h2>
                    <p className="text-text-secondary mx-auto mb-8 max-w-xl font-medium">
                        Practice until implementation becomes muscle memory. Alex is waiting for
                        your next session.
                    </p>
                    <Link href="/interview/new">
                        <Button
                            size="lg"
                            className="bg-accent shadow-accent/20 hover:bg-accent-hover h-16 rounded-[1.2rem] px-12 text-lg font-black text-black shadow-2xl transition-all hover:scale-105"
                        >
                            Start Your Story
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}
