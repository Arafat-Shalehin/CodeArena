'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'

/**
 * @typedef {Object} ContestHeroProps
 * @property {string} title - The title of the contest
 * @property {string} description - The description of the contest
 * @property {string} status - The current status of the contest (e.g. "Live in 24 Hours")
 * @property {string} startTime - ISO string of the contest start time
 * @property {Function} [onRegister] - Callback function for when the register button is clicked
 */

/**
 * ContestHero component displays the main contest information, a countdown timer,
 * and a registration button for the algorithm sprint.
 *
 * @param {ContestHeroProps} props
 * @returns {JSX.Element}
 */
export const ContestHero = ({ title, description, status, startTime, onRegister }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
    })

    useEffect(() => {
        const calcTimeLeft = () => {
            if (!startTime) return

            const diff = new Date(startTime).getTime() - Date.now()

            if (diff <= 0) {
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
                return
            }

            const totalSeconds = Math.floor(diff / 1000)
            const days = Math.floor(totalSeconds / 86400)
            const hours = Math.floor((totalSeconds % 86400) / 3600)
            const minutes = Math.floor((totalSeconds % 3600) / 60)
            const seconds = totalSeconds % 60

            const pad = (n) => String(n).padStart(2, '0')
            setTimeLeft({
                days: pad(days),
                hours: pad(hours),
                minutes: pad(minutes),
                seconds: pad(seconds),
            })
        }

        calcTimeLeft()
        const timer = setInterval(calcTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [startTime])

    return (
        <section className="border-border bg-bg-subtle relative mb-12 overflow-hidden rounded-2xl border p-8 shadow-sm md:p-12">
            {/* Background Accent Ornament */}
            <div className="bg-accent/5 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl" />

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
                <span className="bg-accent-light text-accent-text mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
                    {status}
                </span>

                <h1 className="text-text-primary mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                    {title}
                </h1>

                <p className="text-text-secondary mb-10 text-lg leading-relaxed">{description}</p>

                {/* Countdown Grid */}
                <div className="mb-10 flex gap-4 md:gap-8">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                        <div key={unit} className="flex flex-col items-center">
                            <div className="border-border bg-bg-page flex h-16 w-16 items-center justify-center rounded-xl border shadow-sm md:h-20 md:w-20 lg:rounded-2xl">
                                <span className="text-accent text-2xl font-black md:text-3xl">
                                    {value}
                                </span>
                            </div>
                            <span className="text-text-muted mt-2 text-xs font-bold tracking-tighter uppercase">
                                {unit}
                            </span>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={onRegister}
                    size="lg"
                    className="group shadow-accent/20 relative h-auto gap-3 rounded-2xl px-12 py-4 text-lg font-bold shadow-xl transition-all hover:scale-105"
                >
                    Register for Contest
                    <Rocket className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
            </div>
        </section>
    )
}
