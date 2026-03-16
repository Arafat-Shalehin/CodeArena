'use client'

import { Tiles } from '@/components/ui/tiles'

/**
 * @component TilesDemo
 * @description A demo showcasing the Tiles component in a fixed-height container.
 */
export function TilesDemo() {
    return (
        <div className="border-border bg-bg-page relative h-[500px] w-full overflow-hidden rounded-xl border">
            <Tiles rows={50} cols={8} tileSize="md" />
        </div>
    )
}
