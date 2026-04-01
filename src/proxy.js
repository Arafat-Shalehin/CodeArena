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

export function proxy(request) {
    const { pathname } = request.nextUrl

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

    const token = request.cookies.get(AUTH_COOKIE)?.value

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/feed', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/feed', '/feed/:path*', '/profile', '/profile/:path*', '/login', '/signup'],
}
