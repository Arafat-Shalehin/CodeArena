import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

function checkSecret() {
    if (!JWT_SECRET && process.env.NEXT_PHASE !== 'phase-production-build') {
        throw new Error('Please define JWT_SECRET in .env.local')
    }
}

export function signToken(payload) {
    checkSecret()
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
    checkSecret()
    return jwt.verify(token, JWT_SECRET)
}
