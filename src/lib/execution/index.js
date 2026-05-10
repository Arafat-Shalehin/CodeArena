import { DistributedExecutionAdapter } from './adapters/distributed.adapter';

/**
 * Execution Factory / Index
 * 
 * Returns the active execution adapter based on the runtime environment.
 * Default is 'distributed' to match existing production setup.
 */

const mode = process.env.RUNTIME_MODE || 'distributed';

let executionPort;

if (mode === 'distributed') {
    executionPort = new DistributedExecutionAdapter();
} else {
    // Fallback or handle other modes (e.g. 'serverless' when implemented)
    console.warn(`[EXECUTION] Runtime mode '${mode}' not fully implemented, falling back to distributed.`);
    executionPort = new DistributedExecutionAdapter();
}

export { executionPort };
