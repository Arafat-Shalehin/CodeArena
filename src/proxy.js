import { NextResponse } from 'next/server'

/**
 * Next.js Edge Proxy — Auth Guard
 *
 * Runs before any page is rendered. Checks for the presence of the
 * httpOnly session cookie issued at login. If missing on a protected
 * route, the user is redirected to /login immediately.
 */

const PROTECTED_PREFIXES = ['/feed', '/profile']
const AUTH_ROUTES = ['/login', '/signup']
const AUTH_COOKIE = 'codearena_access_token'

function parseJwtPayload(token) {
    try {
        const payload = token.split('.')[1]
        if (!payload) return null

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
        const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4)
        const decoded = atob(padded)
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

function hasUsableAuthToken(token) {
    if (!token) return false

    const payload = parseJwtPayload(token)
    if (!payload) return false

    if (typeof payload.exp !== 'number') return false

    const nowInSeconds = Math.floor(Date.now() / 1000)
    return payload.exp > nowInSeconds
}

export function proxy(request) {
    const { pathname } = request.nextUrl

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

    const token = request.cookies.get(AUTH_COOKIE)?.value
    const hasValidToken = hasUsableAuthToken(token)

    if (isProtected && !hasValidToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)

        const response = NextResponse.redirect(loginUrl)
        if (token) {
            response.cookies.delete(AUTH_COOKIE)
        }
        return response
    }

    // Do not force-redirect /login or /signup to /feed from edge.
    // Token signature is validated server-side, and stale/invalid cookies can
    // otherwise cause unexpected redirects when users click "Sign in".
    if (isAuthRoute && !hasValidToken && token) {
        const response = NextResponse.next()
        response.cookies.delete(AUTH_COOKIE)
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/feed', '/feed/:path*', '/profile', '/profile/:path*', '/login', '/signup'],
}
