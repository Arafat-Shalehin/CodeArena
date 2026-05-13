import { RealtimePort } from '../realtime.port';
import { redisClient } from '@/lib/redis';

/**
 * DistributedRealtimeAdapter
 * 
 * Implements RealtimePort using Redis Pub/Sub for event distribution.
 */
export class DistributedRealtimeAdapter extends RealtimePort {
    async publish(channel, payload) {
        if (!redisClient.isOpen) {
            console.warn(`[REALTIME ADAPTER] Redis client is not open. Skipping publish to ${channel}`);
            return;
        }

        try {
            const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
            await redisClient.publish(channel, message);
        } catch (error) {
            console.error(`[REALTIME ADAPTER] Failed to publish message to ${channel}:`, error);
            // We don't throw here to avoid breaking the caller's flow for a non-critical event
        }
    }
}
