import { createClient } from 'redis'

const globalForRedis = globalThis

const REDIS_HOST =
    process.env.REDIS_HOST || (process.env.NODE_ENV === 'development' ? 'localhost' : 'redis')
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')

export const redisClient =
    globalForRedis.redis ||
    createClient({
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT,
        },
        password: process.env.REDIS_PASSWORD,
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
