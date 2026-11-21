import { DistributedRealtimeAdapter } from './adapters/distributed.realtime.adapter';
import { ServerlessRealtimeAdapter } from './adapters/serverless.realtime.adapter';

/**
 * Realtime Port Export
 * 
 * Dynamically selects and exports the realtime adapter based on the RUNTIME_MODE.
 * Defaults to DistributedRealtimeAdapter to maintain full compatibility.
 */
const isServerless = process.env.RUNTIME_MODE === 'serverless';
const realtimePort = isServerless ? new ServerlessRealtimeAdapter() : new DistributedRealtimeAdapter();

export { realtimePort };

