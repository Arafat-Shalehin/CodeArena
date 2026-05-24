# WebSocket Integration Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Single, correct WebSocket integration — one token utility, one client hook, all consumers using it.

**Architecture:** Consolidate `src/lib/auth/wsToken.js` into `src/lib/ws-token.js`, make `useSecureSocket` the sole client-side entry point (with serverless bypass, SSL detection, token refresh), migrate all 4 direct `io()` callers, and fix the Redis crash bug in `socket-server.js`.

**Tech Stack:** socket.io 4.x, socket.io-client 4.x, Next.js App Router, JWT

---

### Task 1: Consolidate token utilities into `src/lib/ws-token.js`

**Files:**
- Delete: `src/lib/auth/wsToken.js`
- Modify: `src/lib/ws-token.js` — add `signWsToken` convenience (with `type: 'websocket'` baked in) to replace the deleted file
- Modify: `src/socket/namespaces/voice.js:2` — switch import from `@/lib/auth/wsToken` to `@/lib/ws-token`
- Modify: `src/app/api/interview/sessions/route.js:7` — switch import from `@/lib/auth/wsToken` to `@/lib/ws-token`
- Modify: `src/app/api/interview/sessions/[id]/rehydrate/route.js:15` — switch import from `@/lib/auth/wsToken` to `@/lib/ws-token`

**Step 1: Add `signWsToken` to `src/lib/ws-token.js`**

Add after the existing `generateWsToken` function:

```js
/**
 * Generates a short-lived token for WebSocket authentication.
 * @param {Object} payload — e.g. { userId, sessionId }
 * @returns {string} Signed JWT valid for 15 minutes with type: 'websocket'
 */
export function signWsToken(payload) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required')
    }
    return jwt.sign(
        { ...payload, type: 'websocket' },
        JWT_SECRET,
        { expiresIn: '15m' }
    )
}
```

This ensures all tokens carry `type: 'websocket'` so the main auth middleware's type check passes.

**Step 2: Update voice.js import**

```js
// src/socket/namespaces/voice.js line 2
// Before:
import { verifyWsToken } from '@/lib/auth/wsToken'
// After:
import { verifyWsToken } from '@/lib/ws-token'
```

**Step 3: Update interview session route**

```js
// src/app/api/interview/sessions/route.js line 7
// Before:
import { signWsToken } from '@/lib/auth/wsToken'
// After:
import { signWsToken } from '@/lib/ws-token'
```

**Step 4: Update interview rehydrate route**

```js
// src/app/api/interview/sessions/[id]/rehydrate/route.js
// Before:
import { signWsToken } from '@/lib/auth/wsToken'
// After:
import { signWsToken } from '@/lib/ws-token'
```

**Step 5: Delete `src/lib/auth/wsToken.js`**

```bash
rm src/lib/auth/wsToken.js
```

**Step 6: Run tests/lint**

```bash
npx prettier --write src/lib/ws-token.js src/socket/namespaces/voice.js src/app/api/interview/sessions/route.js src/app/api/interview/sessions/\[id\]/rehydrate/route.js
npx eslint --fix src/lib/ws-token.js src/socket/namespaces/voice.js src/app/api/interview/sessions/route.js src/app/api/interview/sessions/\[id\]/rehydrate/route.js
```

---

### Task 2: Fix Redis crash in socket-server.js

**Files:**
- Modify: `src/lib/socket-server.js:111-113`

**Problem:** `redisClient.duplicate()` is called before the try/catch block. If `redisClient` was never connected or initialized, this throws and kills the entire Socket.IO server.

**Step 1: Move `duplicate()` calls inside try/catch with null checks**

```js
// Replace lines 111-135:
let adapterEnabled = false
let pubClient = null
let subClient = null
try {
    pubClient = redisClient?.duplicate()
    subClient = redisClient?.duplicate()
    if (!pubClient || !subClient) {
        console.warn('[Socket.IO] Redis client unavailable, running without adapter')
    } else {
        const [pubReady, subReady] = await Promise.all([
            safeConnectRedisClient(pubClient, 'Redis adapter pubClient'),
            safeConnectRedisClient(subClient, 'Redis adapter subClient'),
        ])
        if (pubReady && subReady) {
            serverIo.adapter(createAdapter(pubClient, subClient))
            adapterEnabled = true
        } else {
            await Promise.all([
                safeQuitRedisClient(pubClient),
                safeQuitRedisClient(subClient),
            ])
            console.warn('[Socket.IO] Redis adapter disabled, running in single-node mode')
        }
    }
} catch (adapterError) {
    if (pubClient) safeQuitRedisClient(pubClient)
    if (subClient) safeQuitRedisClient(subClient)
    console.warn(
        `[Socket.IO] Redis adapter setup failed, continuing without adapter: ${adapterError.message}`
    )
}
```

---

### Task 3: Fix `useSecureSocket` token refresh race

**Files:**
- Modify: `src/hooks/useSecureSocket.js:225`

**Problem:** When token refresh fires but the socket is still connected, the new token is stored but never applied until disconnect. Should force a reconnect with the fresh token.

**Step 1: Replace the reconnect-if-disconnected logic with always-reconnect**

Replace lines 218-232:

```js
refreshTimerRef.current = setTimeout(async () => {
    try {
        console.log('[useSecureSocket] Refreshing authentication token')
        const { wsToken } = await fetchWsToken()
        tokenRef.current = wsToken

        // Always reconnect to apply the new token
        if (socketRef.current) {
            socketRef.current.disconnect()
        }
        await connect()
    } catch (err) {
        console.error('[useSecureSocket] Token refresh failed:', err.message)
    }
}, delay)
```

---

### Task 4: Migrate `ScorecardView.jsx` to `useSecureSocket`

**Files:**
- Modify: `src/features/interview/ScorecardView.jsx`

**Step 1: Replace direct `io()` with `useSecureSocket`**

Remove the socket setup code in the useEffect (lines 70-108). Add the hook:

```js
import { useSecureSocket } from '@/hooks/useSecureSocket'

// Inside component:
const { socket, isConnected } = useSecureSocket('/interview', {
    sessionId,
    scope: 'interview',
    onConnect: useCallback(async () => {
        setIsSocketConnected(true)
        socketRef.current = socket
        socket?.emit('interview:join')
        if (!resultFoundRef.current) {
            await fetchResult()
        }
    }, [sessionId]),
    onDisconnect: useCallback(() => setIsSocketConnected(false), []),
})
```

Replace `socketRef.current` usage with the `socket` from the hook.

Remove the `/rehydrate` fetch call since `useSecureSocket` already handles token fetching via `/api/auth/ws-token`.

---

### Task 5: Migrate `ContestDetailPage.jsx` to `useSecureSocket`

**Files:**
- Modify: `src/features/contests/components/ContestDetailPage.jsx`

**Step 1: Remove direct `io` import, add `useSecureSocket`**

```js
// Remove:
import { io } from 'socket.io-client'
// Add:
import { useSecureSocket } from '@/hooks/useSecureSocket'
```

**Step 2: Replace direct socket with hook**

```js
const { socket, isConnected } = useSecureSocket('', {
    scope: 'general',
})
```

Remove the raw `io()` call. Move socket event listeners into a `useEffect` that watches `socket`.

---

### Task 6: Migrate contest `result/page.jsx` to `useSecureSocket`

**Files:**
- Modify: `src/app/contests/[id]/result/page.jsx`

**Step 1: Replace `require('socket.io-client')` with `useSecureSocket`**

This component is likely a client component already. Add:

```js
import { useSecureSocket } from '@/hooks/useSecureSocket'
```

**Step 2: Use the hook**

```js
const { socket } = useSecureSocket('', {
    scope: 'general',
    onConnect: useCallback(() => {
        console.log('[ResultPage] Socket connected')
    }, []),
})
```

Add a `useEffect` that watches `socket` and attaches the `contest:result_finalized` listener, cleaning up on unmount.

---

### Task 7: Migrate `InterviewShell.jsx` to `useSecureSocket`

**Files:**
- Modify: `src/features/interview/InterviewShell.jsx`

**Step 1: Replace direct `io` import**

```js
// Remove:
import { io } from 'socket.io-client'
// Add:
import { useSecureSocket } from '@/hooks/useSecureSocket'
```

**Step 2: Replace socket creation with hook**

The InterviewShell likely connects to `/interview` namespace. The interview flow gets its sessionId and token from the session creation response, so use:

```js
const { socket, isConnected } = useSecureSocket('/interview', {
    sessionId: sessionIdFromProps,
    scope: 'interview',
})
```

Remove `useRef` and `useEffect` that create the raw socket. Clean up any manual token handling.

---

### Task 8: Remove hardcoded localhost URLs

**Files:**
- Remove from: `ScorecardView.jsx:76`, `result/page.jsx:66`

All hardcoded `http://localhost:...` fallbacks become dead code after migration since `useSecureSocket` derives the URL dynamically from `/api/auth/ws-token`.

After Tasks 4-7 are complete, verify no `localhost` socket URLs remain:

```bash
rg 'localhost.*socket' src/ --include='*.{jsx,js}'
# Expected: 0 matches (false positives possible, inspect each)
```

---

### Verification

**Step 1: Check no remaining references to `@/lib/auth/wsToken`**

```bash
rg 'from.*auth/wsToken' src/
# Expected: 0 matches
```

**Step 2: Check no direct `io()` calls remain**

```bash
rg "from 'socket.io-client'" src/ --include='*.{jsx,js}'
# Expected: 0 matches (useSecureSocket replaces all)
```

**Step 3: Build check**

```bash
npx next build --no-lint 2>&1 | head -30
```
