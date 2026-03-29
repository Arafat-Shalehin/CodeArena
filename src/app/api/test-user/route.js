import { redisClient } from '@/lib/redis'

export async function GET(req) {
    await redisClient.set('test-key', 'hello', { EX: 60 })
    const value = await redisClient.get('test-key')
    return new Response(value)
}
