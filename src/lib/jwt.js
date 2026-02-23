import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('Please define JWT_SECRET in .env.local')
}

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET)
}
