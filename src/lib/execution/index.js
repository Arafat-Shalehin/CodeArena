import { DistributedExecutionAdapter } from './adapters/distributed.adapter';
import { ServerlessExecutionAdapter } from './adapters/serverless.adapter';

/**
 * Execution Port Export
 * 
 * Dynamically selects and exports the execution adapter based on the RUNTIME_MODE.
 * Defaults to DistributedExecutionAdapter to maintain full compatibility.
 */
const isServerless = process.env.RUNTIME_MODE === 'serverless';
const executionPort = isServerless ? new ServerlessExecutionAdapter() : new DistributedExecutionAdapter();

export { executionPort };

