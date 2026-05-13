import { DistributedRealtimeAdapter } from './adapters/distributed.realtime.adapter';

/**
 * Realtime Port Export
 * 
 * Exports the active realtime adapter.
 * Currently hardcoded to DistributedRealtimeAdapter to preserve existing behavior.
 */
const realtimePort = new DistributedRealtimeAdapter();

export { realtimePort };
