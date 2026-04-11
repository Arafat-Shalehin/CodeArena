# 🛡️ PHASE 5: GLOBAL ERROR HANDLING & RECOVERY

**Status:** ✅ COMPLETE | April 10, 2026

---

## Overview

Global error handling prevents uncaught exceptions and unhandled rejections from crashing the application. All errors are logged safely using the safe-logger system with automatic fallback to console.

**Problems Solved:**

- 🔴 Uncaught exceptions crash the app
- 🔴 Unhandled promise rejections go unnoticed
- 🔴 Memory leaks from failed error logging
- 🔴 Loss of critical error context during debuggingProcess Warnings, Memory Usage, DB Status

---

## Architecture

### Three-Layer Error Handling

```
Layer 1: Route Handlers
  └─ asyncHandler() catches sync/async errors
     └─ Logs via safe-logger (DB with console fallback)

Layer 2: Process Events
  └─ process.on('uncaughtException')
  └─ process.on('unhandledRejection')
  └─ process.on('warning')
     └─ All log via safe-logger with context

Layer 3: Graceful Shutdown
  └─ SIGTERM/SIGINT handlers
  └─ Coordinate with worker-manager
  └─ Normal process exit after cleanup
```

---

## Files Created

### 1. src/lib/global-error-handler.js (220 LOC)

Comprehensive global error handling system with context collection.

**Exported Functions:**

```javascript
/**
 * Manually log an error
 * @param {string} message - Error message
 * @param {Error|string} error - Error object or string
 * @param {string} category - Error category
 */
export async function logError(message, error, category = 'manual')

/**
 * Get error handler status and current context
 * @returns {Object} - Handler status + environment context
 */
export function getErrorHandlerStatus()

/**
 * Get current error context (DB, memory, uptime)
 * @returns {Object}
 */
export function getErrorContext()
```

**Registered Handlers:**

1. **uncaughtException** - Catches thrown errors not caught by try-catch
2. **unhandledRejection** - Catches Promise rejections without .catch()
3. **warning** - Captures process warnings (MaxListeners, etc.)
4. **SIGTERM/SIGINT/SIGHUP** - Graceful shutdown coordination

---

## Files Modified

### 1. src/lib/asyncHandler.js (Updated)

Enhanced with safe-logger integration.

**Before:**

```javascript
await logger.system.error('Unhandled API error', { message, url, method })
```

**After:**

```javascript
const errorLogger = getSafeLogger('system')
await errorLogger.error('Unhandled API error', {
    status,
    message,
    url,
    method,
    stack, // ← Added
    code, // ← Added
})
```

### 2. src/instrumentation.js (Updated)

Added global error handler initialization.

**Added:**

```javascript
// Initialize global error handlers (must be early)
import '@/lib/global-error-handler'
```

---

## Error Context Collected

### For Every Error:

```javascript
{
    timestamp: '2026-04-10T14:50:00Z',
    dbConnected: true,                    // From safe-logger
    dbState: 1,                           // 0-3 connection states
    nodeEnv: 'production',
    uptime: 3600.5,                       // Seconds app running
    memory: {
        rss: 150,                         // Resident set (MB)
        heapUsed: 75,                     // JS heap used (MB)
        heapTotal: 120,                   // JS heap total (MB)
    },
}
```

This context helps diagnose whether errors are related to:

- Database connection issues
- Memory exhaustion
- Long-running processes

---

## Error Handling Flow

### Route Error (asyncHandler)

```
Route fires
  ↓
asyncHandler wrapper
  ↓
await fn(req, context)
  ↓
Error thrown
  ↓
catch block
  ↓
status >= 500?
  ├─ YES → getSafeLogger('system').error(...) with full context
  └─ NO  → Silent (client error)
  ↓
Return 5xx error response
```

### Uncaught Exception

```
Thrown error escapes all try-catch
  ↓
process.on('uncaughtException') fires
  ↓
Log via safe-logger:
  - message, stack, name, code
  - Context: DB state, memory, uptime
  ↓
In production:
  - Sleep 1000ms (allow log flush)
  - process.exit(1)
  ↓
Container restart (Kubernetes/Docker)
```

### Unhandled Promise Rejection

```
Promise.reject() without .catch()
  ↓
process.on('unhandledRejection') fires
  ↓
Log via safe-logger:
  - Reason (Error or non-Error)
  - Promise reference
  - Full context
  ↓
Check: EXIT_ON_UNHANDLED_REJECTION env var
  ├─ true  → process.exit(1)
  └─ false → Continue (default, logs but doesn't crash)
```

---

## Benefits by Scenario

### Scenario 1: Database Connection Fails During Logging

**Before:**

```
Error occurs
  ↓
Try to log error
  ↓
DB connection lost
  ↓
createLog() hangs
  ↓
Error logging blocks app
  ↓
Other requests slow down
```

**After:**

```
Error occurs
  ↓
getSafeLogger().error() checks DB state
  ↓
DB not ready
  ↓
Falls back to console
  ↓
Error logged to console <1ms
  ↓
App continues normally
```

### Scenario 2: Memory Leak Detection

**Before:**

```
Heap usage grows
  ↓
Process runs slow
  ↓
No visibility into memory state
  ↓
Task monitor eventually kills process
```

**After:**

```
Error handler collects memory context
  ↓
heapUsed: 356 MB (out of 512 MB limit)
  ↓
Logged with all errors
  ↓
Developers see pattern in logs
  ↓
Can identify memory leak early
```

### Scenario 3: Worker Startup Failure

**Before:**

```
Worker fails to initialize
  ↓
Uncaught exception in event handler
  ↓
Process crashes
  ↓
Container dies, no logs of root cause
```

**After:**

```
Worker fails
  ↓
uncaughtException handler fires
  ↓
Logs full stack + context
  ↓
DB state, memory, uptime, etc.
  ↓
Graceful 1s sleep (allow log flush)
  ↓
process.exit(1)
  ↓
Logs available for debugging
```

---

## Configuration

### Environment Variables

```bash
# Exit on unhandled promise rejection (default: false)
EXIT_ON_UNHANDLED_REJECTION=true

# Node environment (affects error logging verbosity)
NODE_ENV=production
```

### Behavior by Environment

**Development:**

```javascript
// Includes full error stack in response
Response: { success: false, message: '...', stack: '...' }

// Verbose console warnings
console.error with full context
```

**Production:**

```javascript
// No stack trace in response
Response: { success: false, message: '...' }

// Minimal console output
Only errors logged via safe-logger (DB or console fallback)
```

---

## Deployment Checklist

- [x] `src/lib/global-error-handler.js` created (220 LOC)
- [x] `src/lib/asyncHandler.js` enhanced with safe-logger
- [x] `src/instrumentation.js` updated with handler initialization
- [x] Error context collector implemented
- [x] All process event handlers registered
    - [x] uncaughtException
    - [x] unhandledRejection
    - [x] warning
    - [x] Signal handlers (SIGTERM/SIGINT/SIGHUP)
- [x] No compilation errors
- [x] Safe logging integration verified
- [x] Documentation created

---

## Monitoring & Debugging

### Check Handler Status

```javascript
import { getErrorHandlerStatus } from '@/lib/global-error-handler'

// In health endpoint
const status = getErrorHandlerStatus()
console.log(status)
// Output:
// {
//   registered: true,
//   handlers: ['uncaughtException', 'unhandledRejection', 'warning', 'signals'],
//   context: { ... }
// }
```

### Manual Error Logging

```javascript
import { logError } from '@/lib/global-error-handler'

// In custom code
try {
    await riskyOperation()
} catch (err) {
    await logError('Custom operation failed', err, 'custom-category')
}
```

### Console Log Examples

**Uncaught Exception:**

```
🔴 UNCAUGHT EXCEPTION: Cannot read property 'name' of undefined
⚠️  FATAL: Uncaught exception - shutting down gracefully
```

**Unhandled Rejection:**

```
🔴 UNHANDLED REJECTION: Promise rejected with invalid state
```

**Process Warning:**

```
⚠️  PROCESS WARNING: MaxListenersExceededWarning 11 listeners added
```

---

## Console Output During Error

### High-Level Summary

```
🔴 UNCAUGHT EXCEPTION: Database connection lost
[CONSOLE FALLBACK] DB unavailable (disconnected): Uncaught exception detected
[CONSOLE FALLBACK] { category: 'uncaughtException', error: {...}, context: {...} }
⚠️  FATAL: Uncaught exception - shutting down gracefully
```

### What Gets Logged

1. **Error Details**
    - name, message, stack, code

2. **Request Context** (for route errors)
    - URL, method, status code

3. **System Context**
    - DB connection state
    - Memory usage (RsSS, heap used, heap total)
    - Process uptime
    - Node environment

4. **Error Category**
    - 'uncaughtException' | 'unhandledRejection' | 'warning' | 'system' | 'custom'

---

## Integration with Other Phases

| Phase                    | Integration                     | Benefit                         |
| ------------------------ | ------------------------------- | ------------------------------- |
| Phase 1: Socket.IO       | asyncHandler logs socket errors | Real-time error visibility      |
| Phase 2: Rate Limiting   | asyncHandler logs 429 errors    | Understand limit hits           |
| Phase 3: Worker Shutdown | Global handler coordinates exit | Clean shutdown on errors        |
| Phase 4: Safe Logging    | All errors use safe-logger      | DB fallback for critical errors |

---

## Related Documentation

- [SECURITY_ROADMAP_MASTER.md](SECURITY_ROADMAP_MASTER.md) - Full security roadmap
- [PHASE4_SAFE_LOGGING.md](PHASE4_SAFE_LOGGING.md) - Safe logging system
- [PHASE3_WORKER_GRACEFUL_SHUTDOWN.md](PHASE3_WORKER_GRACEFUL_SHUTDOWN.md) - Worker lifecycle

---

## Key Metrics

| Metric             | Value         | Status                   |
| ------------------ | ------------- | ------------------------ |
| **Error Handlers** | 4 registered  | ✅ Complete              |
| **Context Fields** | 10+ collected | ✅ Comprehensive         |
| **LOC Written**    | 220           | ✅ Clean                 |
| **Compilation**    | 0 errors      | ✅ Verified              |
| **Safe Logging**   | Integrated    | ✅ DB + console fallback |

---

**Status:** ✅ Production-Ready  
**Deployment:** Ready for Staging (Apr 10-13)  
**Next Phase:** Database Security (Apr 14-16)
