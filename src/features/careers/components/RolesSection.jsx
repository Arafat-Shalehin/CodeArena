'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, Briefcase, Clock, CheckCircle2 } from 'lucide-react'
import { JOB_ROLES } from '../data/jobs.data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * @component RolesSection
 * @description Displays open job roles with expandable details.
 */
export default function RolesSection() {
    const [expandedRole, setExpandedRole] = useState(null)

    const toggleRole = (roleId) => {
        setExpandedRole(expandedRole === roleId ? null : roleId)
    }

    return (
        <section className="py-20 md:py-28" id="roles">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <h2 className="text-text-primary mb-2 text-3xl font-bold md:text-4xl">
                            Open roles
                        </h2>
                        <p className="text-text-secondary text-lg">
                            Join us in our mission to evolve the judge engine.
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="text-accent border-accent/20 bg-accent/5 h-auto px-4 py-1 text-sm"
                    >
                        {JOB_ROLES.length} Openings
                    </Badge>
                </div>

                <div className="space-y-4">
                    {JOB_ROLES.map((role) => (
                        <div
                            key={role.id}
                            className={`bg-bg-subtle border-border rounded-xl border transition-all duration-300 ${
                                expandedRole === role.id
                                    ? 'ring-accent border-transparent ring-2'
                                    : 'hover:border-accent/40'
                            }`}
                        >
                            <button
                                onClick={() => toggleRole(role.id)}
                                className="flex w-full items-center justify-between gap-4 p-6 text-left"
                            >
                                <div className="flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                        <h3 className="text-text-primary text-xl font-bold">
                                            {role.title}
                                        </h3>
                                        <Badge
                                            variant="secondary"
                                            className="bg-bg-muted text-text-secondary"
                                        >
                                            {role.department}
                                        </Badge>
                                    </div>
                                    <div className="text-text-muted flex flex-wrap gap-4 text-sm">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" /> {role.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="h-4 w-4" /> {role.type}
                                        </span>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: expandedRole === role.id ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-bg-page border-border rounded-full border p-2"
                                >
                                    <ChevronDown className="text-text-secondary h-5 w-5" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {expandedRole === role.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-border border-t px-6 pt-6 pb-8">
                                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                                <div className="lg:col-span-2">
                                                    <h4 className="text-text-primary mb-3 text-lg font-semibold">
                                                        About the role
                                                    </h4>
                                                    <p className="text-text-secondary mb-6 leading-relaxed">
                                                        {role.description}
                                                    </p>

                                                    <h4 className="text-text-primary mb-3 text-lg font-semibold">
                                                        Key Requirements
                                                    </h4>
                                                    <ul className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        {role.requirements.map((req, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="text-text-secondary flex items-start gap-2 text-sm"
                                                            >
                                                                <CheckCircle2 className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-bg-page border-border h-fit rounded-xl border p-6">
                                                    <h4 className="text-md text-text-primary mb-4 font-semibold">
                                                        Perks & Benefits
                                                    </h4>
                                                    <ul className="mb-6 space-y-3">
                                                        {role.perks.map((perk, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="text-text-secondary flex items-center gap-2 text-sm"
                                                            >
                                                                <span className="bg-accent size-1.5 rounded-full" />
                                                                {perk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Button className="bg-accent hover:bg-accent-hover w-full text-white">
                                                        Apply Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
