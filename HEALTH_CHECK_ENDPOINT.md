# 📊 Health Check Endpoint Documentation

**Created:** April 10, 2026  
**Status:** ✅ Complete  
**Purpose:** Monitor application health across all critical systems

---

## Overview

The health check endpoint provides real-time visibility into application status. It supports three detail levels:

- **Quick**: Minimal payload (~50 bytes) for load balancers
- **Full**: Complete system status (~500 bytes) for monitoring dashboards
- **Deep**: Comprehensive diagnostics (~2KB) for debugging (admin only)

---

## Endpoints

### Quick Health Check

```
GET /api/health
```

**Response (200 - Healthy):**

```json
{
    "ok": true,
    "database": true,
    "workers": 7,
    "uptime": 3662.5,
    "timestamp": "2026-04-10T15:30:45.123Z"
}
```

**Response (503 - Degraded):**

```json
{
    "ok": false,
    "database": false,
    "workers": 0,
    "uptime": 3662.5,
    "timestamp": "2026-04-10T15:30:45.123Z"
}
```

**Use Case:** Load balancers, automated monitoring, health probes  
**Cache:** No-cache (fresh data every request)  
**Header:** `X-Health-Status: healthy | degraded | error`

---

### Full Health Status

```
GET /api/health?detail=full
```

**Response (200 - All Systems Healthy):**

```json
{
    "timestamp": "2026-04-10T15:30:45.123Z",
    "uptime": 3662.5,
    "status": "healthy",
    "overallStatus": "healthy",
    "services": {
        "database": {
            "status": "connected",
            "healthy": true,
            "readyState": 1,
            "connected": true,
            "description": "MongoDB connection established",
            "timestamp": "2026-04-10T15:30:45.123Z"
        },
        "redis": {
            "status": "connected",
            "healthy": true,
            "ping": "PONG",
            "timestamp": "2026-04-10T15:30:45.123Z"
        },
        "workers": {
            "status": "running",
            "healthy": true,
            "count": 7,
            "names": [
                "submission",
                "interview-ai",
                "plagiarism",
                "stats",
                "ai",
                "interview-execution",
                "interview-summarize"
            ],
            "stats": {
                "total": 7,
                "active": 7,
                "failed": 0
            },
            "timestamp": "2026-04-10T15:30:45.123Z"
        },
        "errorHandler": {
            "status": "active",
            "uncaughtExceptions": 0,
            "unhandledRejections": 0,
            "warnings": 0,
            "lastError": null,
            "timestamp": "2026-04-10T15:30:45.123Z"
        },
        "logging": {
            "healthy": true,
            "rateLimitStatus": "normal",
            "dbFallbacks": 0,
            "consoleLogs": 1250,
            "timestamp": "2026-04-10T15:30:45.123Z"
        },
        "memory": {
            "rss": 256,
            "heapUsed": 128,
            "heapTotal": 256,
            "external": 16,
            "heapPercentage": 50,
            "timestamp": "2026-04-10T15:30:45.123Z"
        }
    }
}
```

**Status Codes:**

- `200` - All systems healthy
- `503` - One or more systems degraded
- `500` - Error during health check

**Use Case:** Monitoring dashboards, detailed status pages, CI/CD pipelines  
**Header:** `X-Health-Status: healthy | degraded | error`

---

### Deep Diagnostics (Admin Only)

```
GET /api/health?detail=deep
Authorization: Bearer <HEALTH_CHECK_ADMIN_TOKEN>
```

**Response:**

```json
{
    "health": {
        "timestamp": "2026-04-10T15:30:45.123Z",
        "uptime": 3662.5,
        "status": "healthy",
        "services": {
            /* full service details */
        }
    },
    "errorContext": {
        "lastError": null,
        "errorCount": 0,
        "uncaughtExceptions": 0,
        "unhandledRejections": 0,
        "processSignalsReceived": [],
        "timestamp": "2026-04-10T15:30:45.123Z"
    },
    "environment": {
        "nodeVersion": "v20.10.0",
        "nodeEnv": "production",
        "platform": "linux"
    },
    "timestamp": "2026-04-10T15:30:45.123Z"
}
```

**Authentication:** Bearer token required  
**Use Case:** Debugging, detailed incident analysis, infrastructure logs  
**Security:** Admin token only (prevents information disclosure)

---

## Database State Codes

| Code | State         | Status  | Action                     |
| ---- | ------------- | ------- | -------------------------- |
| 0    | disconnected  | ❌ Down | Reconnecting in background |
| 1    | connected     | ✅ Good | Accepting queries          |
| 2    | connecting    | ⏳ Wait | Connection in progress     |
| 3    | disconnecting | ⏳ Wait | Shutdown in progress       |

---

## Configuration

### Environment Variables

```bash
# .env or Railway config

# Admin token for deep diagnostics (optional)
HEALTH_CHECK_ADMIN_TOKEN=your-secure-token-here

# Health check timeout (default: 5s)
HEALTH_CHECK_TIMEOUT=5000

# Worker check interval (default: 30s)
HEALTH_CHECK_INTERVAL=30000
```

### Redis Client Registration

Health check service needs Redis client to monitor connectivity. Register it during app initialization:

```javascript
// In instrumentation.js or app startup
import { setRedisClient } from '@/services/healthCheck.js'
import redis from '@/lib/redis.js' // Your Redis client

setRedisClient(redis)
```

---

## Integration Examples

### Load Balancer Integration

```javascript
// Use quick endpoint for minimal latency
// https://api.yourdomain.com/api/health
// Expected: HTTP 200 (healthy) or 503 (degraded)
// Check every 10-30 seconds
```

### Kubernetes Liveness Probe

```yaml
livenessProbe:
    httpGet:
        path: /api/health
        port: 3000
    initialDelaySeconds: 10
    periodSeconds: 30
```

### Monitoring Dashboard

```javascript
// Fetch full status every 60s
const response = await fetch('/api/health?detail=full')
const health = await response.json()

// Color-code dashboard based on overallStatus
if (health.overallStatus === 'healthy') {
    // Green
} else if (health.overallStatus === 'degraded') {
    // Yellow
} else {
    // Red
}
```

### Automated Alerts

```javascript
// Check for specific failures
if (!health.services.database.healthy) {
    alert('Database connection lost')
}
if (!health.services.redis.healthy) {
    alert('Redis connection lost')
}
if (health.services.memory.heapPercentage > 90) {
    alert('Memory usage critical (90%+)')
}
```

---

## Monitoring Metrics

### Key Metrics to Track

1. **Database Connectivity**
    - readyState changes
    - Connection failures
    - Reconnection duration

2. **Memory Usage**
    - Heap percentage trend
    - RSS growth over time
    - Potential memory leaks (> 80% sustained)

3. **Worker Status**
    - Worker count consistency (should always be 7)
    - Failed worker restarts
    - Worker processing speed

4. **Error Rate**
    - Uncaught exceptions
    - Unhandled rejections
    - Error handler status

5. **Logging Health**
    - Rate limit triggers
    - Console fallback count
    - DB write success rate

---

## Troubleshooting

### Health Check Returns 503

**Database unhealthy:**

- Check MongoDB Atlas cluster status
- Verify network access list includes current IP
- Check connection string in `MONGODB_URI`

**Redis unhealthy:**

- Verify Redis service is running
- Check Redis connection string
- Verify network connectivity to Redis host

**Workers offline:**

- Check `worker-boot.js` logs
- Verify Redis pub/sub working (use redis-cli)
- Restart worker process

### All Systems Degraded

Most likely causes:

1. Database authentication failure
2. Network connectivity issue
3. Deployment of incompatible version

### Memory Percentage High (> 80%)

Possible causes:

1. Memory leak in long-running operations
2. Large dataset cached in memory
3. Inefficient query results

Investigation:

```bash
# Get detailed memory snapshot
curl /api/health?detail=full
# Check heapPercentage trend over time
```

---

## Performance Impact

| Operation        | Latency | DB Queries | Redis Calls |
| ---------------- | ------- | ---------- | ----------- |
| Quick check      | 1-2ms   | 0          | 1           |
| Full status      | 10-20ms | 0          | 1           |
| Deep diagnostics | 20-30ms | 0          | 1           |

No persistent data written by health checks. All operations read-only.

---

## Security Considerations

1. **Rate Limiting:** Health endpoint exempt from general rate limiting (use external checks)
2. **Information Disclosure:** Deep diagnostics require admin token
3. **DDoS Protection:** Consider implementing additional protection for health endpoint
4. **Logging:** Health check results logged via safe-logger system

---

## Testing

### Quick Test

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health?detail=full
```

### Full Test

```bash
# Test quick endpoint response time
time curl -s http://localhost:3000/api/health

# Verify all services healthy
curl -s http://localhost:3000/api/health?detail=full | jq '.overallStatus'

# Test admin token authentication
curl -H "Authorization: Bearer wrong-token" \
  http://localhost:3000/api/health?detail=deep
# Should return: 401 Unauthorized

curl -H "Authorization: Bearer $HEALTH_CHECK_ADMIN_TOKEN" \
  http://localhost:3000/api/health?detail=deep
# Should return: 200 with full context
```

---

## Future Enhancements

Planned improvements:

- [ ] Trend analysis (memory growth rate)
- [ ] Anomaly detection alerts
- [ ] Custom health check plugins
- [ ] Metrics export (Prometheus format)
- [ ] SLA tracking
- [ ] Historical data retention

---

## Files Modified

1. `src/app/api/health/route.js` - Enhanced with 3-level detail system
2. `src/services/healthCheck.js` - New comprehensive health check service (314 LOC)

**Total LOC:** ~450 LOC  
**New Dependencies:** None (uses existing packages)  
**Breaking Changes:** None (backward compatible with `/api/health`)
