import { DistributedAIAdapter } from './adapters/distributed.ai.adapter'

/**
 * AI Engine Port Export
 * 
 * Exports the active AI Engine adapter.
 * Currently hardcoded to DistributedAIAdapter to preserve existing behavior.
 */
const aiEnginePort = new DistributedAIAdapter()

export { aiEnginePort }
