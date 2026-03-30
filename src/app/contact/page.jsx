'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Mail,
    MessageSquare,
    MapPin,
    Clock,
    Send,
    Github,
    Twitter,
    Globe,
    ArrowRight,
    CheckCircle2,
    HelpCircle,
    Bug,
    Handshake,
    Sparkles,
} from 'lucide-react'

// ─── Contact Channels ────────────────────────────────────────────────────
const CHANNELS = [
    {
        icon: <Mail className="size-6" />,
        title: 'Email Us',
        description: 'For general inquiries and support requests.',
        value: 'support@codearena.com',
        href: 'mailto:support@codearena.com',
        color: 'text-accent bg-accent/10 border-accent/20',
        hoverBorder: 'hover:border-accent/50',
    },
    {
        icon: <MessageSquare className="size-6" />,
        title: 'Discord Community',
        description: 'Get real-time help and chat with the team.',
        value: 'Join our server',
        href: 'https://discord.com',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        hoverBorder: 'hover:border-blue-500/50',
    },
    {
        icon: <Github className="size-6" />,
        title: 'GitHub Issues',
        description: 'Report bugs or request features directly.',
        value: 'Open an issue',
        href: 'https://github.com/rabiulislam5334/CodeArena-TeamProject/issues',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        hoverBorder: 'hover:border-purple-500/50',
    },
    {
        icon: <Twitter className="size-6" />,
        title: 'Twitter / X',
        description: 'Follow us for updates, tips, and announcements.',
        value: '@CodeArena',
        href: 'https://twitter.com',
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        hoverBorder: 'hover:border-cyan-500/50',
    },
]

// ─── Inquiry Types ───────────────────────────────────────────────────────
const INQUIRY_TYPES = [
    { value: 'general', label: 'General Inquiry', icon: <HelpCircle className="size-4" /> },
    { value: 'bug', label: 'Bug Report', icon: <Bug className="size-4" /> },
    { value: 'partnership', label: 'Partnership', icon: <Handshake className="size-4" /> },
    { value: 'feature', label: 'Feature Request', icon: <Sparkles className="size-4" /> },
]

// ─── FAQ ─────────────────────────────────────────────────────────────────
const QUICK_FAQ = [
    {
        q: 'What is the typical response time?',
        a: 'We aim to respond to all emails within 24 hours on business days. Discord is usually faster for quick questions.',
    },
    {
        q: 'How do I report a security vulnerability?',
        a: 'Please email security@codearena.com directly. Do not file public issues for security concerns.',
    },
    {
        q: 'Can I partner with CodeArena for events?',
        a: 'Absolutely! Select "Partnership" in the contact form and describe your event. We love collaborating with the community.',
    },
]

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
}

// ─── Page Component ──────────────────────────────────────────────────────
export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'general',
        message: '',
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // UI-only — no backend logic
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 4000)
        setFormData({ name: '', email: '', type: 'general', message: '' })
    }

    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-28 pb-24">
                <div className="mx-auto max-w-6xl px-4">
                    {/* ── Hero ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-20 text-center"
                    >
                        <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                            Get in <span className="text-accent italic">Touch</span>
                        </h1>
                        <p className="text-text-muted mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
                            Have a question, found a bug, or want to partner with us? We would love
                            to hear from you. Choose the best way to reach our team below.
                        </p>
                    </motion.div>

                    {/* ── Contact Channels ── */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="mb-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {CHANNELS.map((channel, idx) => (
                            <motion.a
                                key={idx}
                                href={channel.href}
                                target={channel.href.startsWith('http') ? '_blank' : undefined}
                                rel={
                                    channel.href.startsWith('http')
                                        ? 'noopener noreferrer'
                                        : undefined
                                }
                                variants={itemVariants}
                                whileHover={{
                                    y: -6,
                                    scale: 1.02,
                                    transition: { duration: 0.25 },
                                }}
                                className={`glass-card group cursor-pointer rounded-2xl border border-transparent p-6 text-center transition-all duration-300 hover:shadow-xl ${channel.hoverBorder}`}
                            >
                                <motion.div
                                    whileHover={{
                                        rotate: [0, -8, 8, 0],
                                        transition: { duration: 0.5 },
                                    }}
                                    className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border ${channel.color}`}
                                >
                                    {channel.icon}
                                </motion.div>
                                <h3 className="text-text-primary mb-1 font-bold">
                                    {channel.title}
                                </h3>
                                <p className="text-text-muted mb-3 text-xs leading-relaxed">
                                    {channel.description}
                                </p>
                                <span className="text-accent inline-flex items-center gap-1 text-sm font-semibold">
                                    {channel.value}
                                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                                </span>
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* ── Form + Sidebar ── */}
                    <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-3"
                        >
                            <h2 className="text-text-primary mb-2 flex items-center gap-3 text-2xl font-bold">
                                <Send className="text-accent" /> Send a Message
                            </h2>
                            <div className="bg-accent mb-8 h-1 w-20 rounded-full" />

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="text-text-secondary mb-2 block text-sm font-semibold">
                                            Your Name
                                        </label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="bg-bg-subtle border-border focus:border-accent/30 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-xl border px-4 py-3 text-sm transition-all focus:ring-4 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-text-secondary mb-2 block text-sm font-semibold">
                                            Email Address
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                            className="bg-bg-subtle border-border focus:border-accent/30 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-xl border px-4 py-3 text-sm transition-all focus:ring-4 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-text-secondary mb-2 block text-sm font-semibold">
                                        Inquiry Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {INQUIRY_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        type: t.value,
                                                    })
                                                }
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                                    formData.type === t.value
                                                        ? 'bg-accent shadow-accent/20 text-white shadow-md'
                                                        : 'bg-bg-subtle text-text-muted hover:bg-bg-muted hover:text-text-primary'
                                                }`}
                                            >
                                                {t.icon}
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-text-secondary mb-2 block text-sm font-semibold">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Tell us how we can help…"
                                        className="bg-bg-subtle border-border focus:border-accent/30 focus:ring-accent/5 placeholder:text-text-muted w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all focus:ring-4 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-accent hover:bg-accent-hover shadow-accent/20 hover:shadow-accent/30 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    <Send className="size-4" />
                                    Send Message
                                </button>

                                {/* Success toast */}
                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-accent/10 text-accent border-accent/20 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Message sent successfully! We will get back to you soon.
                                    </motion.div>
                                )}
                            </form>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="space-y-6 lg:col-span-2"
                        >
                            {/* Office Info */}
                            <div className="glass-card hover:border-accent/30 rounded-2xl border border-transparent p-6 transition-all duration-300">
                                <h3 className="text-text-primary mb-4 font-bold">Quick Info</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <MapPin className="text-accent mt-0.5 size-4 shrink-0" />
                                        <div>
                                            <div className="text-text-primary text-sm font-semibold">
                                                Headquarters
                                            </div>
                                            <div className="text-text-muted text-xs">
                                                Remote-first · Global team
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Clock className="text-accent mt-0.5 size-4 shrink-0" />
                                        <div>
                                            <div className="text-text-primary text-sm font-semibold">
                                                Response Time
                                            </div>
                                            <div className="text-text-muted text-xs">
                                                Within 24 hours (business days)
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Globe className="text-accent mt-0.5 size-4 shrink-0" />
                                        <div>
                                            <div className="text-text-primary text-sm font-semibold">
                                                Timezone Coverage
                                            </div>
                                            <div className="text-text-muted text-xs">
                                                UTC+0 to UTC+9, Mon – Fri
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Quick FAQ */}
                            <div className="glass-card hover:border-accent/30 rounded-2xl border border-transparent p-6 transition-all duration-300">
                                <h3 className="text-text-primary mb-4 flex items-center gap-2 font-bold">
                                    <HelpCircle className="text-accent size-5" />
                                    Quick FAQ
                                </h3>
                                <div className="space-y-4">
                                    {QUICK_FAQ.map((faq, idx) => (
                                        <div key={idx}>
                                            <h4 className="text-text-primary mb-1 text-sm font-semibold">
                                                {faq.q}
                                            </h4>
                                            <p className="text-text-muted text-xs leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
