import { createClient } from 'redis'

const globalForRedis = globalThis
const isBuildPhase =
    process.env.SKIP_REDIS === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'

// Support Railway's REDIS_URL format (primary) or individual env vars (fallback)
const redisUrl = process.env.REDIS_URL || ''

const redisConfig = redisUrl
    ? { url: redisUrl }
    : {
          socket: {
              host:
                  process.env.REDIS_HOST ||
                  (process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'),
              port: parseInt(process.env.REDIS_PORT || '6379'),
          },
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
    if (!isBuildPhase) {
        console.error('Redis Error', err)
    }
})

const isServerless = process.env.RUNTIME_MODE === 'serverless'

// Build-time static rendering and serverless mode should not require live Redis.
if (!isBuildPhase && !isServerless && !redisClient.isOpen) {
    redisClient.connect().catch(console.error)
}
