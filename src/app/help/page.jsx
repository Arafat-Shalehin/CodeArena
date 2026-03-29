'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Search,
    ChevronDown,
    HelpCircle,
    Book,
    Trophy,
    Code2,
    ShieldAlert,
    Mail,
    MessageSquare,
} from 'lucide-react'

const FAQ_CATEGORIES = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Book className="size-5" />,
        questions: [
            {
                q: 'How do I create an account on CodeArena?',
                a: 'Click the "Sign Up" button in the top right corner. You can use your email or sync with Firebase for a seamless experience.',
            },
            {
                q: 'Is CodeArena free to use?',
                a: 'Yes, our core features including problem solving and participating in public contests are completely free.',
            },
        ],
    },
    {
        id: 'contests',
        title: 'Contests & Rankings',
        icon: <Trophy className="size-5" />,
        questions: [
            {
                q: 'How are contest points calculated?',
                a: 'Points are awarded based on the difficulty of the problem and the time taken to solve it. Faster correct submissions earn more points.',
            },
            {
                q: 'What is the Elo rating system?',
                a: 'The Elo rating system measures your relative skill level. Your rating increases or decreases based on your performance in rated contests against other users.',
            },
        ],
    },
    {
        id: 'judge',
        title: 'Judge & Submissions',
        icon: <Code2 className="size-5" />,
        questions: [
            {
                q: 'What programming languages are supported?',
                a: 'We currently support C++, Python, Java, and JavaScript. More languages are being added regularly.',
            },
            {
                q: 'What does "Time Limit Exceeded" mean?',
                a: "It means your solution took longer to execute than the allowed limit for that specific problem. Try optimizing your algorithm's complexity.",
            },
        ],
    },
    {
        id: 'security',
        title: 'Account & Security',
        icon: <ShieldAlert className="size-5" />,
        questions: [
            {
                q: 'How do I change my password?',
                a: 'Go to your Profile Settings page to update your security credentials and personal information.',
            },
            {
                q: 'Is my code safe on CodeArena?',
                a: 'Absolutely. We use isolated Docker sandboxes to execute all code, ensuring both our platform and your account remain secure.',
            },
        ],
    },
]

export default function HelpCenterPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeQuestion, setActiveQuestion] = useState(null)

    const filteredFaqs = FAQ_CATEGORIES.map((category) => ({
        ...category,
        questions: category.questions.filter(
            (faq) =>
                faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.a.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter((category) => category.questions.length > 0)

    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-24 pb-20">
                {/* Search Hero */}
                <section className="relative mb-20 overflow-hidden py-20 text-center">
                    <div className="bg-accent/5 absolute inset-0 -z-10 blur-3xl" />
                    <div className="mx-auto max-w-4xl px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                                How can we <span className="text-accent italic">help you?</span>
                            </h1>
                            <p className="text-text-muted mb-10 text-lg md:text-xl">
                                Search our knowledge base or browse frequently asked questions
                                below.
                            </p>

                            <div className="group relative mx-auto max-w-2xl">
                                <Search className="text-text-muted group-focus-within:text-accent absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search for questions (e.g. 'contests', 'verdicts')..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-bg-subtle border-border focus:bg-bg-page focus:border-accent/20 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-2xl border py-4 pr-6 pl-14 text-lg shadow-2xl transition-all focus:ring-8 focus:outline-none"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-4">
                    {/* FAQ Categories */}
                    <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
                        {/* Left: Category Nav (Desktop) */}
                        <div className="hidden space-y-2 lg:block">
                            <h2 className="text-text-primary mb-6 text-sm font-bold tracking-widest uppercase">
                                Quick Links
                            </h2>
                            {FAQ_CATEGORIES.map((cat) => (
                                <a
                                    key={cat.id}
                                    href={`#${cat.id}`}
                                    className="hover:bg-bg-subtle text-text-muted hover:text-text-primary flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
                                >
                                    {cat.icon}
                                    {cat.title}
                                </a>
                            ))}
                        </div>

                        {/* Right: FAQs */}
                        <div className="space-y-16 lg:col-span-2">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((category) => (
                                    <div
                                        key={category.id}
                                        id={category.id}
                                        className="scroll-mt-24"
                                    >
                                        <div className="mb-8 flex items-center gap-4">
                                            <div className="bg-accent/10 border-accent/20 text-accent flex size-12 items-center justify-center rounded-2xl border">
                                                {category.icon}
                                            </div>
                                            <h2 className="text-text-primary text-2xl font-bold">
                                                {category.title}
                                            </h2>
                                        </div>

                                        <div className="space-y-4">
                                            {category.questions.map((faq, idx) => {
                                                const isOpen =
                                                    activeQuestion === `${category.id}-${idx}`
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`glass-card overflow-hidden rounded-2xl transition-all duration-300 ${isOpen ? 'ring-accent/20 ring-2' : ''}`}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                setActiveQuestion(
                                                                    isOpen
                                                                        ? null
                                                                        : `${category.id}-${idx}`
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-between p-6 text-left"
                                                        >
                                                            <span className="text-text-primary font-bold md:text-lg">
                                                                {faq.q}
                                                            </span>
                                                            <ChevronDown
                                                                className={`text-text-muted transition-transform duration-300 ${isOpen ? 'text-accent rotate-180' : ''}`}
                                                                size={20}
                                                            />
                                                        </button>
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{
                                                                        height: 0,
                                                                        opacity: 0,
                                                                    }}
                                                                    animate={{
                                                                        height: 'auto',
                                                                        opacity: 1,
                                                                    }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <div className="border-border/50 border-t p-6 pt-0">
                                                                        <p className="text-text-muted mt-4 leading-relaxed">
                                                                            {faq.a}
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="bg-bg-subtle mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-white/5 shadow-inner">
                                        <HelpCircle className="text-text-muted h-10 w-10" />
                                    </div>
                                    <h3 className="text-text-primary text-xl font-bold">
                                        No results found
                                    </h3>
                                    <p className="text-text-muted mt-2">
                                        Try searching for broader terms or categories.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support Channels */}
                    <section className="border-border/50 mt-32 border-t pt-20">
                        <div className="text-center">
                            <h2 className="text-text-primary mb-4 text-3xl font-bold">
                                Still need help?
                            </h2>
                            <p className="text-text-muted mb-12">
                                Can't find what you're looking for? Our team is ready to assist you.
                            </p>

                            <div className="grid gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
                                <a
                                    href="mailto:support@codearena.com"
                                    className="glass-card hover:border-accent/40 group flex items-center gap-6 rounded-[2.5rem] p-8 text-left transition-all"
                                >
                                    <div className="bg-accent/10 border-accent/20 text-accent group-hover:bg-accent flex size-14 items-center justify-center rounded-2xl border transition-colors group-hover:text-white">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-text-primary font-bold">
                                            Email Support
                                        </h4>
                                        <p className="text-text-muted mt-1 text-sm">
                                            Receive a response within 24 hours.
                                        </p>
                                    </div>
                                </a>
                                <div className="glass-card group flex cursor-pointer items-center gap-6 rounded-[2.5rem] p-8 text-left transition-all hover:border-blue-500/40">
                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-text-primary font-bold">
                                            Discord Community
                                        </h4>
                                        <p className="text-text-muted mt-1 text-sm">
                                            Get real-time help from the community.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
