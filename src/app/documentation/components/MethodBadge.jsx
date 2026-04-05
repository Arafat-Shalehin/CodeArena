'use client'

import { Badge } from '@/components/ui/badge'

const METHOD_MAP = {
    GET: 'badge-success',
    POST: 'badge-info',
    PUT: 'badge-warning',
    DELETE: 'badge-error',
}

export default function MethodBadge({ method }) {
    return (
        <Badge
            variant={METHOD_MAP[method] || 'default'}
            className="font-mono text-[10px] font-bold uppercase"
        >
            {method}
        </Badge>
    )
}
