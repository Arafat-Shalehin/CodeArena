import { DistributedAIAdapter } from './adapters/distributed.ai.adapter'
import { ServerlessAIAdapter } from './adapters/serverless.ai.adapter'

/**
 * AI Engine Port Export
 * 
 * Dynamically selects and exports the AI Engine adapter based on the RUNTIME_MODE.
 * Defaults to DistributedAIAdapter to maintain full compatibility.
 */
const isServerless = process.env.RUNTIME_MODE === 'serverless';
const aiEnginePort = isServerless ? new ServerlessAIAdapter() : new DistributedAIAdapter();

export { aiEnginePort }

