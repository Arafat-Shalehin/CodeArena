'use client'
import { useEffect, useRef } from 'react'

class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
        this.width = canvas.width
        this.height = canvas.height
        this.ctx = context
        this.x = x
        this.y = y
        this.color = color
        this.speed = this.getRandomValue(0.1, 0.9) * speed
        this.size = 0
        this.sizeStep = Math.random() * 0.4
        this.minSize = 0.5
        this.maxSizeInteger = 2
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger)
        this.delay = delay
        this.counter = 0
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
        this.isIdle = false
        this.isReverse = false
        this.isShimmer = false
    }

    getRandomValue(min, max) {
        return Math.random() * (max - min) + min
    }

    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size)
    }

    appear() {
        this.isIdle = false
        if (this.counter <= this.delay) {
            this.counter += this.counterStep
            return
        }
        if (this.size >= this.maxSize) {
            this.isShimmer = true
        }
        if (this.isShimmer) {
            this.shimmer()
        } else {
            this.size += this.sizeStep
        }
        this.draw()
    }

    shimmer() {
        if (this.size >= this.maxSize) {
            this.isReverse = true
        } else if (this.size <= this.minSize) {
            this.isReverse = false
        }
        if (this.isReverse) {
            this.size -= this.speed
        } else {
            this.size += this.speed
        }
    }
}

function getEffectiveSpeed(value, reducedMotion) {
    const min = 0
    const max = 100
    const throttle = 0.001
    if (value <= min || reducedMotion) {
        return min
    } else if (value >= max) {
        return max * throttle
    } else {
        return value * throttle
    }
}

export default function PixelBackground({
    gap = 6,
    speed = 80,
    colors = '#fecdd3,#fda4af,#e11d48',
    opacity = 1,
    direction = 'center',
    className = '',
    canvasClassName = '',
    children,
}) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const pixelsRef = useRef([])
    const animationRef = useRef(null)
    const timePreviousRef = useRef(0)

    useEffect(() => {
        const reducedMotionValue = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const getOriginPoint = (width, height) => {
            switch (direction) {
                case 'top':
                    return { x: width / 2, y: 0 }
                case 'bottom':
                    return { x: width / 2, y: height }
                case 'left':
                    return { x: 0, y: height / 2 }
                case 'right':
                    return { x: width, y: height / 2 }
                case 'top-left':
                    return { x: 0, y: 0 }
                case 'top-right':
                    return { x: width, y: 0 }
                case 'bottom-left':
                    return { x: 0, y: height }
                case 'bottom-right':
                    return { x: width, y: height }
                case 'center':
                default:
                    return { x: width / 2, y: height / 2 }
            }
        }

        const initPixels = () => {
            if (!containerRef.current || !canvasRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const width = Math.floor(rect.width)
            const height = Math.floor(rect.height)
            const ctx = canvasRef.current.getContext('2d')

            canvasRef.current.width = width
            canvasRef.current.height = height
            canvasRef.current.style.width = `${width}px`
            canvasRef.current.style.height = `${height}px`

            const origin = getOriginPoint(width, height)
            const colorsArray = colors.split(',')
            const pxs = []

            for (let x = 0; x < width; x += parseInt(gap.toString(), 10)) {
                for (let y = 0; y < height; y += parseInt(gap.toString(), 10)) {
                    const color = colorsArray[Math.floor(Math.random() * colorsArray.length)]
                    const dx = x - origin.x
                    const dy = y - origin.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const delay = reducedMotionValue ? 0 : distance

                    if (!ctx) return
                    pxs.push(
                        new Pixel(
                            canvasRef.current,
                            ctx,
                            x,
                            y,
                            color,
                            getEffectiveSpeed(speed, reducedMotionValue),
                            delay
                        )
                    )
                }
            }

            pixelsRef.current = pxs
        }

        const doAnimate = (fnName) => {
            animationRef.current = requestAnimationFrame(() => doAnimate(fnName))

            const timeNow = performance.now()
            if (timePreviousRef.current === 0) timePreviousRef.current = timeNow
            const timePassed = timeNow - timePreviousRef.current
            const timeInterval = 1000 / 60

            if (timePassed < timeInterval) return
            timePreviousRef.current = timeNow - (timePassed % timeInterval)

            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx || !canvasRef.current) return

            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

            let allIdle = true
            for (let i = 0; i < pixelsRef.current.length; i++) {
                const pixel = pixelsRef.current[i]
                pixel[fnName]()
                if (!pixel.isIdle) {
                    allIdle = false
                }
            }

            if (allIdle && animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current)
            }
        }

        const handleAnimation = (name) => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current)
            }
            animationRef.current = requestAnimationFrame(() => doAnimate(name))
        }

        initPixels()
        handleAnimation('appear')

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [gap, speed, colors, direction])

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            <canvas
                ref={canvasRef}
                className={`pointer-events-none absolute inset-0 z-0 ${canvasClassName}`}
                style={{ opacity }}
            />
            {children && <div className="relative z-10">{children}</div>}
        </div>
    )
}
