import { DistributedExecutionAdapter } from './adapters/distributed.adapter';

/**
 * Execution Port Export
 * 
 * Exports the active execution adapter.
 * Currently hardcoded to DistributedExecutionAdapter to preserve existing behavior.
 */
const executionPort = new DistributedExecutionAdapter();

export { executionPort };
