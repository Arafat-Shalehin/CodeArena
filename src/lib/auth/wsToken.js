import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

function checkSecret() {
    if (!JWT_SECRET && process.env.NEXT_PHASE !== 'phase-production-build') {
        throw new Error('Please define JWT_SECRET in .env.local')
    }
}

/**
 * Generates a short-lived token for WebSocket authentication.
 * @param {Object} payload - Data to encode in the token (e.g., userId, sessionId)
 * @returns {string} - Signed JWT valid for 15 minutes
 */
export function signWsToken(payload) {
    checkSecret()
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

/**
 * Verifies a WebSocket token.
 * @param {string} token
 * @returns {Object} - Decoded payload
 */
export function verifyWsToken(token) {
    checkSecret()
    return jwt.verify(token, JWT_SECRET)
}
