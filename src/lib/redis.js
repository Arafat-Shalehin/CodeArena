import { createClient } from 'redis'

const globalForRedis = globalThis

// Railway injects REDIS_URL. Locally we leave it blank so the HOST/PORT fallback kicks in.
// An empty string is intentionally treated the same as "not set".
const redisUrl = process.env.REDIS_URL || ''

const connectionConfig = redisUrl
    ? { url: redisUrl }
    : {
          socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD || undefined,
      }

if (process.env.NODE_ENV !== 'test') {
    console.log(
        `[Redis] Connecting via ${redisUrl ? 'REDIS_URL' : `host ${connectionConfig.socket?.host}:${connectionConfig.socket?.port}`}`
    )
}

export const redisClient = globalForRedis.redis || createClient(connectionConfig)

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
