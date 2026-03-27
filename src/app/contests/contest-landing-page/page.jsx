'use client'
import ContestDetail from '@/features/contests/components/ContestDetail'
import React from 'react'

/**
 * ContestPage component serves as the entry point for the Weekly Algorithm Sprint #45 page.
 * It utilizes the ContestDetail feature component to render the full page layout.
 *
 * @returns {JSX.Element}
 */
export default function ContestPage() {
    return (
        <>
            <title>Weekly Algorithm Sprint #45 | CodeArena</title>
            <meta
                name="description"
                content="Join the Weekly Algorithm Sprint #45 on CodeArena. Prove your logic, optimize your code, and climb the rankings."
            />
            <ContestDetail />
        </>
    )
}
