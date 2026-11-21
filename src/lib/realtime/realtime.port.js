/**
 * RealtimePort
 * 
 * Abstract base class for realtime adapters.
 * Defines the contract for publishing events.
 */
export class RealtimePort {
    /**
     * Publish an event to a channel.
     * @param {string} channel - The channel name.
     * @param {object|string} payload - The event payload.
     * @returns {Promise<void>}
     */
    async publish(channel, payload) {
        throw new Error('Method RealtimePort.publish() must be implemented');
    }
}
