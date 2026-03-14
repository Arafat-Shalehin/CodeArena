'use client'

import React, { use } from 'react'
import ScorecardView from '@/features/interview/ScorecardView'

export default function InterviewResultPage({ params: paramsPromise }) {
    const params = use(paramsPromise)
    const { id } = params

    return <ScorecardView sessionId={id} />
}
