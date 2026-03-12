import { createClient } from 'redis'

const globalForRedis = globalThis

// Support Railway's REDIS_URL format (primary) or individual env vars (fallback)
let redisConfig

if (process.env.REDIS_URL) {
    // Railway or other platforms provide complete REDIS_URL
    redisConfig = process.env.REDIS_URL
} else {
    // Fallback to individual host/port/password config
    const REDIS_HOST =
        process.env.REDIS_HOST || (process.env.NODE_ENV === 'development' ? 'localhost' : 'redis')
    const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')
    const REDIS_PASSWORD = process.env.REDIS_PASSWORD

    // Build connection URL
    const auth = REDIS_PASSWORD ? `${REDIS_PASSWORD}@` : ''
    redisConfig = `redis://${auth}${REDIS_HOST}:${REDIS_PORT}`
}

export const redisClient =
    globalForRedis.redis ||
    createClient({
        url: redisConfig,
    })

if (!globalForRedis.redis) {
    globalForRedis.redis = redisClient
}

redisClient.on('connect', () => {
    console.log('Redis connected')
})

redisClient.on('reconnecting', () => {
    console.log('Redis reconnecting...')
})

redisClient.on('error', (err) => {
    console.error('Redis Error', err)
})

// Connect once
if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error)
}
