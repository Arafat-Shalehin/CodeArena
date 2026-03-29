'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Shared resizable panel hook with drag-to-collapse support.
 *
 * @param {number}  initialRatio   – starting split ratio (0-1)
 * @param {'horizontal'|'vertical'} direction
 * @param {object}  opts
 * @param {number}  opts.collapseThreshold – ratio below which the "start" panel auto-collapses (default 0.04)
 * @param {number}  opts.expandThreshold   – ratio above which a collapsed "start" panel re-expands (default 0.08)
 * @param {function} opts.onCollapseStart  – called when the "start" panel is dragged past collapse threshold
 * @param {function} opts.onCollapseEnd    – called when the "end" panel is dragged past collapse threshold
 * @param {function} opts.onExpand         – called when re-expanded from either end
 */
export default function useResizable(
    initialRatio = 0.5,
    direction = 'horizontal',
    {
        collapseThreshold = 0.04,
        expandThreshold = 0.08,
        onCollapseStart,
        onCollapseEnd,
        onExpand,
    } = {}
) {
    const [ratio, setRatio] = useState(initialRatio)
    const containerRef = useRef(null)
    const isDragging = useRef(false)
    const prevRatio = useRef(initialRatio) // remember ratio before collapse

    const onMouseDown = useCallback(
        (e) => {
            e.preventDefault()
            isDragging.current = true
            document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
            document.body.style.userSelect = 'none'
        },
        [direction]
    )

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            let newRatio
            if (direction === 'horizontal') {
                newRatio = (e.clientX - rect.left) / rect.width
            } else {
                newRatio = (e.clientY - rect.top) / rect.height
            }
            newRatio = Math.max(0, Math.min(1, newRatio))

            // Auto-collapse detection
            if (newRatio < collapseThreshold) {
                onCollapseStart?.()
                return
            }
            if (newRatio > 1 - collapseThreshold) {
                onCollapseEnd?.()
                return
            }

            // Auto-expand detection (from collapsed state)
            if (ratio < expandThreshold && newRatio >= expandThreshold) {
                onExpand?.()
            }
            if (ratio > 1 - expandThreshold && newRatio <= 1 - expandThreshold) {
                onExpand?.()
            }

            setRatio(Math.max(0.05, Math.min(0.95, newRatio)))
        }

        const onMouseUp = () => {
            if (isDragging.current) {
                isDragging.current = false
                document.body.style.cursor = ''
                document.body.style.userSelect = ''
            }
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [
        direction,
        ratio,
        collapseThreshold,
        expandThreshold,
        onCollapseStart,
        onCollapseEnd,
        onExpand,
    ])

    /** Save current ratio and jump to a specific value (for programmatic collapse/restore) */
    const saveAndSet = useCallback(
        (newRatio) => {
            prevRatio.current = ratio
            setRatio(newRatio)
        },
        [ratio]
    )

    /** Restore the previously-saved ratio */
    const restore = useCallback(() => {
        setRatio(prevRatio.current || initialRatio)
    }, [initialRatio])

    return { ratio, setRatio, containerRef, onMouseDown, saveAndSet, restore }
}
