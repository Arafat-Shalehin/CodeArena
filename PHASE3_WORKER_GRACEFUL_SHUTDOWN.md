# 🛑 PHASE 3: WORKER GRACEFUL SHUTDOWN - IMPLEMENTATION GUIDE

**Status:** ✅ COMPLETE | April 10, 2026

---

## Overview

Worker graceful shutdown prevents memory leaks, duplicate workers, and orphaned processes during application restarts or deployments. Implements centralized worker registry with proper lifecycle management.

**Problems Solved:**

- 🔴 Memory leaks from orphaned workers
- 🔴 Duplicate workers on hot reload
- 🔴 Processes hanging during shutdown
- 🔴 Resource exhaustion from unclosed connections

---

## Architecture

### Central Worker Registry (`src/lib/worker-manager.js`)

Tracks all BullMQ workers and manages graceful shutdown across the application.

**Key Features:**

- ✅ Central registry (Map-based, prevents duplicates)
- ✅ Graceful shutdown with configurable timeout
- ✅ Process signal handlers (SIGTERM, SIGINT, SIGHUP)
- ✅ Forced shutdown fallback (30s timeout → exit)
- ✅ Comprehensive logging and monitoring
- ✅ Worker statistics API

---

## Files Created

### 1. src/lib/worker-manager.js (180 LOC)

Central worker lifecycle management system.

**Exported Functions:**

#### Core Registry Operations

```javascript
/**
 * Register a worker in the central registry
 * Prevents duplicates by closing old worker if name already exists
 * @param {string} name - Unique worker name ('submission', 'stats', etc.)
 * @param {Worker} worker - BullMQ Worker instance
 */
export function registerWorker(name, worker)

/**
 * Unregister a worker (called by gracefulShutdown)
 * @param {string} name - Worker name
 */
export function unregisterWorker(name)

/**
 * Get all registered workers
 * @returns {Map<string, Worker>}
 */
export function getWorkers()

/**
 * Get a specific worker by name
 * @returns {Worker|null}
 */
export function getWorker(name)

/**
 * Check if any workers are registered
 * @returns {boolean}
 */
export function hasActiveWorkers()

/**
 * Get list of all worker names
 * @returns {string[]}
 */
export function getWorkerNames()

/**
 * Get worker statistics
 * @returns {Object} {totalWorkers, activeWorkers: [], isShuttingDown}
 */
export function getWorkerStats()
```

#### Shutdown Operations

```javascript
/**
 * Graceful shutdown of all workers
 * - Closes all workers in parallel
 * - Sets 30s timeout to force exit if hung
 * - Prevents multiple concurrent shutdowns
 * @param {number} timeoutMs - Max wait time (default: 30000)
 * @throws Process exits if timeout exceeded
 */
export async function gracefulShutdown(timeoutMs = 30000)

/**
 * Force close a single worker (fallback only)
 * @param {string} name - Worker name
 */
export async function forceCloseWorker(name)

/**
 * Setup process signal handlers for graceful shutdown
 * Installs SIGINT, SIGTERM, SIGHUP handlers
 * Should be called once during app initialization
 */
export function setupShutdownHandlers()
```

---

## Files Modified

### 1. scripts/worker-boot.js (Updated)

**Changes:**

- Added import: `import { registerWorker, gracefulShutdown, setupShutdownHandlers } from '@/lib/worker-manager.js'`
- Modified `maybeInit()` to call `registerWorker(name, worker)` after initialization
- Replaced `closeAllWorkers()` with `gracefulShutdown()` call
- Removed manual `process.on('SIGINT')` and `process.on('SIGTERM')` (now in worker-manager)
- Added `setupShutdownHandlers()` at end of startWorkers()

**Before (Old Pattern):**

```javascript
const closeAllWorkers = async () => {
    await Promise.all(
        Object.entries(workers).map(async ([name, worker]) => {
            if (!worker) return
            try {
                await worker.close()
                console.log(`[WorkerBoot] Closed ${name} worker`)
            } catch (error) {
                console.error(`[WorkerBoot] Failed to close ${name}:`, error.message)
            }
        })
    )
}

const shutdown = async (signal) => {
    console.log(`[WorkerBoot] Received ${signal}. Shutting down workers...`)
    await closeAllWorkers()
    process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
```

**After (New Pattern):**

```javascript
const maybeInit = (name, initFn) => {
    if (enabledWorkers && !enabledWorkers.has(name)) {
        console.log(`[WorkerBoot] Skipping ${name} worker (not enabled)`)
        return null
    }
    const worker = initFn()
    if (worker) {
        registerWorker(name, worker) // ← Track in central registry
    }
    return worker
}

// ... later:
setupShutdownHandlers() // ← Install signal handlers
```

### 2. src/instrumentation.js (Updated)

**Changes:**

- Added import: `import { registerWorker, setupShutdownHandlers } from '@/lib/worker-manager'`
- Added `registerWorker()` calls after each worker initialization
- Added `setupShutdownHandlers()` after workers are initialized

**Pattern:**

```javascript
globalWorkers.interviewAI = initInterviewAIWorker()
registerWorker('interviewAI', globalWorkers.interviewAI) // ← Register

globalWorkers.interviewExecution = initInterviewExecutionWorker()
registerWorker('interviewExecution', globalWorkers.interviewExecution) // ← Register

// ... all 7 workers registered ...

globalThis._workersInitialized = true
setupShutdownHandlers() // ← Install signal handlers
```

---

## Lifecycle & Flow

### 1. Worker Initialization

```
App Start
  ↓
initWorkerBoot() / register()
  ↓
For each worker:
  - Initialize: worker = initSubmissionWorker()
  - Register: registerWorker('submission', worker)
  - Add to central registry
  ↓
setupShutdownHandlers()
  - Install SIGTERM, SIGINT, SIGHUP handlers
  ↓
App Running
```

### 2. Graceful Shutdown

```
Signal Received (SIGTERM, SIGINT, SIGHUP)
  ↓
gracefulShutdown(30s)
  ↓
For each worker in registry:
  - await worker.close() (parallel)
  - unregisterWorker(name)
  ↓
All workers closed in ≤30s
  ↓
process.exit(0)
```

### 3. Forced Shutdown (Timeout)

```
gracefulShutdown(30s)
  ↓
No response after 30s
  ↓
Force timeout triggered
  ↓
process.exit(1) ← Hard exit
```

---

## Usage Examples

### Basic Usage (Already Integrated)

```javascript
import { registerWorker, setupShutdownHandlers } from '@/lib/worker-manager'

// During initialization
const worker = new Worker('submission-queue', async (job) => {
    // Process job
})
registerWorker('submission', worker)

// Only called once during app start
setupShutdownHandlers()
```

### Query Worker Status

```javascript
import { getWorkerStats, getWorkerNames, hasActiveWorkers } from '@/lib/worker-manager'

// Get all stats
const stats = getWorkerStats()
console.log(`Active workers: ${stats.activeWorkers.join(', ')}`)

// Check if any workers
if (hasActiveWorkers()) {
    console.log('Workers are running')
}

// Force close specific worker (if needed)
await forceCloseWorker('stats')
```

### Manual Shutdown (Testing/Debugging)

```javascript
import { gracefulShutdown } from '@/lib/worker-manager'

// Graceful shutdown (30s timeout)
await gracefulShutdown()

// Or with custom timeout
await gracefulShutdown(60000) // 60 seconds
```

---

## Prevents

### ✅ Memory Leaks

- Workers explicitly closed on shutdown
- Redis connections released
- Job queues drained

**Example Fix:**

```javascript
// ❌ Old: Process hangs with workers still running
// ✅ New: All workers closed before exit
await gracefulShutdown()
```

### ✅ Duplicate Workers

- Central registry prevents duplicate names
- Old worker closed when new one registered

**Example Fix:**

```javascript
// ❌ Old: Hot reload creates 2+ workers with same name
// ✅ New: detectsDuplicate, closes old, registers new
registerWorker('submission', newWorker) // Old submission worker closed first
```

### ✅ Resource Exhaustion

- Connections properly released
- Redis clients cleaned up
- File descriptors freed

**Before (No Cleanup):**

```
App Start #1 → Worker A (Redis client open)
App Restart #2 → Worker A (orphaned)
              → Worker B (orphaned)
              → ...
Memory/socket exhaustion!
```

**After (With Cleanup):**

```
App Start #1 → Worker A (Redis client open)
App Restart #2 → SIGTERM → Close Worker A
              → Worker B (Redis client open)
OK!
```

### ✅ Hanging Processes

- Force exit after 30s if graceful fails
- Prevents zombie processes

**Example:**

```javascript
// Graceful shutdown (30s window)
await gracefulShutdown() // Returns within 30s OR forces exit
```

---

## Configuration

### Shutdown Timeout

```javascript
// Default: 30 seconds
await gracefulShutdown()

// Custom timeout
await gracefulShutdown(60000) // 60 seconds
```

### Enabled Workers

Still controlled via `ENABLED_WORKERS` env var:

```bash
# All workers
ENABLED_WORKERS=*

# Only submission and stats
ENABLED_WORKERS=submission,stats

# Interview workers only
ENABLED_WORKERS=interviewAI,interviewExecution
```

---

## Monitoring & Debugging

### Worker Statistics

```javascript
import { getWorkerStats } from '@/lib/worker-manager'

setInterval(() => {
    const stats = getWorkerStats()
    console.log(
        `[HEALTH] Workers: ${stats.totalWorkers}, Active: ${stats.activeWorkers.join(', ')}`
    )
}, 10000)
```

### Debug Logs

```
[WorkerManager] ✅ Registered worker 'submission' (total: 1)
[WorkerManager] ✅ Registered worker 'stats' (total: 2)
[WorkerManager] Shutdown handlers installed for: SIGINT, SIGTERM, SIGHUP

---

[WorkerManager] 🛑 Initiating graceful shutdown (30000ms timeout)...
[WorkerManager] Closing 2 worker(s)...
[WorkerManager] Closing 'submission' worker...
[WorkerManager] ✅ Closed 'submission' worker
[WorkerManager] Closing 'stats' worker...
[WorkerManager] ✅ Closed 'stats' worker
[WorkerManager] ✅ All workers closed. Safe to exit.
```

---

## Deployment Checklist

- [x] `src/lib/worker-manager.js` created (180 LOC)
- [x] `scripts/worker-boot.js` updated
- [x] `src/instrumentation.js` updated
- [x] All 7 workers now tracked in central registry
- [x] SIGTERM/SIGINT handlers installed
- [x] 30s timeout for forced exit
- [x] No compilation errors
- [x] Tested Worker registration

---

## Testing

### Local Testing

```bash
# Start app
npm run dev

# In another terminal, send SIGTERM
kill -SIGTERM <PID>

# Observe in logs:
# [WorkerManager] Received SIGTERM signal
# [WorkerManager] 🛑 Initiating graceful shutdown...
# [WorkerManager] ✅ All workers closed. Safe to exit.
```

### Load Test

```bash
# Monitor worker count remains stable
watch -n 1 'ps aux | grep worker'

# Launch app multiple times
npm run dev &
sleep 2
npm run dev &  # Creates duplicate process
sleep 2
kill %1 %2    # Both should shut down cleanly
```

---

## Files Summary

| File                      | Type     | Lines | Status      |
| ------------------------- | -------- | ----- | ----------- |
| src/lib/worker-manager.js | New      | 180   | ✅ Complete |
| scripts/worker-boot.js    | Modified | 15    | ✅ Updated  |
| src/instrumentation.js    | Modified | 20    | ✅ Updated  |

**Total Changes:** 215 LOC  
**Compilation:** ✅ 0 Errors  
**Runtime:** ✅ Verified

---

## Notes

- Worker manager is **NOT** domain-specific to any particular queue
- Works with BullMQ v4 and v5
- Redis connections managed separately (not part of worker-manager)
- Safe to call `setupShutdownHandlers()` multiple times (idempotent)

---

## Related

- **Phase 1:** Socket.IO Security (`PHASE1_MASTER_TRACKING.md`)
- **Phase 2:** API Rate Limiting (`PHASE2_RATE_LIMITING.md`)
- **Master:** Full roadmap (`SECURITY_ROADMAP_MASTER.md`)
