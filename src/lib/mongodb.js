import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
    // Skip connection during build phase or if using dummy URI
    if (
        process.env.NEXT_PHASE === 'phase-production-build' ||
        (MONGODB_URI && MONGODB_URI.includes('dummy'))
    ) {
        return { connection: { label: 'dummy' } }
    }

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
    }

    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI)
            .then((mongoose) => {
                // Import logger lazily to avoid circular dependency at module load time
                import('@/lib/logger').then(({ logger }) => {
                    logger.database.info('MongoDB connected successfully.')
                })
                return mongoose
            })
            .catch(async (err) => {
                const { logger } = await import('@/lib/logger')
                await logger.database.error('MongoDB connection failed.', {
                    message: err.message,
                })
                cached.promise = null
                throw err
            })
    }

    cached.conn = await cached.promise
    return cached.conn
}

export default dbConnect
