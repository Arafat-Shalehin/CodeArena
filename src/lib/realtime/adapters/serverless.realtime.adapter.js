import { RealtimePort } from '../realtime.port'

/**
 * ServerlessRealtimeAdapter
 * 
 * Implements RealtimePort as a safe no-op / logger fallback.
 * Since serverless mode runs without Redis Pub/Sub or WebSocket connections,
 * this adapter ensures event dispatching calls in services never fail or throw.
 */
export class ServerlessRealtimeAdapter extends RealtimePort {
    async publish(channel, payload) {
        // Logging for visibility during debugging/local serverless mode runs
        const content = typeof payload === 'string' ? payload : JSON.stringify(payload)
        console.log(`[SERVERLESS REALTIME] Channel: ${channel} | Event Published: ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}`)
        return
    }
}
