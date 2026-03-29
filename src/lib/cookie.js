/**
 * Cookie utility for JWT authentication
 *
 * Cookie name: codearena_access_token
 * Strategy: 7-day stateless access token (no refresh token)
 */

const COOKIE_NAME = 'codearena_access_token'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Build the cookie option string
 */
function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'Lax',
        path: '/',
        maxAge: MAX_AGE,
    }
}

/**
 * Serialize a single cookie into a Set-Cookie header value
 */
function serializeCookie(name, value, options = {}) {
    let cookie = `${name}=${value}`

    if (options.httpOnly) cookie += '; HttpOnly'
    if (options.secure) cookie += '; Secure'
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
    if (options.path) cookie += `; Path=${options.path}`
    if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`

    return cookie
}

/**
 * Create a Response with the auth cookie set
 *
 * @param {Object} body   - JSON response body
 * @param {string} token  - JWT string
 * @param {number} status - HTTP status code (default 200)
 * @returns {Response}
 */
export function createResponseWithCookie(body, token, status = 200) {
    const options = getCookieOptions()
    const cookieHeader = serializeCookie(COOKIE_NAME, token, options)

    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookieHeader,
        },
    })
}

/**
 * Create a Response with the auth cookie cleared (logout)
 *
 * @param {Object} body   - JSON response body
 * @param {number} status - HTTP status code (default 200)
 * @returns {Response}
 */
export function createResponseClearCookie(body, status = 200) {
    // Expire immediately by setting Max-Age to 0
    const cookieHeader = serializeCookie(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 0,
    })

    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookieHeader,
        },
    })
}

/**
 * Extract the JWT from the incoming request's Cookie header
 *
 * @param {Request} req - Incoming request object
 * @returns {string|null} - The token string, or null if not found
 */
export function getTokenFromCookies(req) {
    const cookieHeader = req.headers.get('cookie')
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, ...rest] = cookie.trim().split('=')
        acc[key] = rest.join('=')
        return acc
    }, {})

    return cookies[COOKIE_NAME] || null
}

export { COOKIE_NAME }
