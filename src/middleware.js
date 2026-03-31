import { NextResponse } from 'next/server'

/**
 * Next.js Edge Middleware — Auth Guard
 *
 * Runs before any page is rendered. Checks for the presence of the
 * httpOnly session cookie issued at login. If missing on a protected
 * route, the user is redirected to /login immediately — no React render,
 * no spinner flicker, no client-side bypass.
 *
 * Protected routes:
 *   - /feed
 *   - /profile (own profile and /profile/settings)
 *
 * Public routes that are always allowed:
 *   - /login, /signup, /api/*, static files
 */

const PROTECTED_PREFIXES = ['/feed', '/profile']
const AUTH_COOKIE = 'codearena_access_token'

export function middleware(request) {
    const { pathname } = request.nextUrl

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    if (!isProtected) return NextResponse.next()

    const token = request.cookies.get(AUTH_COOKIE)?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    // Only run middleware on these path patterns — skip static assets and api routes
    matcher: ['/feed', '/feed/:path*', '/profile', '/profile/:path*'],
}
