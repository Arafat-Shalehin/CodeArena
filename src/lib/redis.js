import { createClient } from 'redis'

const globalForRedis = globalThis

// Support Railway's REDIS_URL format (primary) or individual env vars (fallback)
const redisUrl = process.env.REDIS_URL || ''
const isRedisTls = redisUrl.startsWith('rediss://')
const allowInsecureTls = process.env.REDIS_TLS_INSECURE === 'true'

const redisConfig = redisUrl
    ? {
          url: redisUrl,
          ...(isRedisTls
              ? {
                    socket: {
                        tls: true,
                        ...(allowInsecureTls ? { rejectUnauthorized: false } : {}),
                    },
                }
              : {}),
      }
    : {
          host:
              process.env.REDIS_HOST ||
              (process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'),
          port: parseInt(process.env.REDIS_PORT || '6379'),
          ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
      }

export const redisClient = globalForRedis.redis || createClient(redisConfig)

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
