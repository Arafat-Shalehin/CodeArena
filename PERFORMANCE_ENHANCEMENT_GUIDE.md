# CodeArena: Performance Enhancement Guide

**Date:** April 10, 2026  
**Focus:** Optimizing for 10k+ concurrent users with sub-second execution

---

## Executive Summary

CodeArena has achieved 75% latency reduction in code execution. To further optimize for scalability, this guide addresses:

- **Node.js Event Loop** bottlenecks at 10k RPS
- **Redis** memory & throughput optimization
- **Database Query** performance & indexing
- **Socket.IO** real-time scaling
- **Worker Pool** efficiency
- **Frontend** load time reduction

---

## 1. Node.js Event Loop Optimization

### Problem: Event Loop Blocking at 10k RPS

At peak concurrent submissions:

- JSON parsing + streaming outputs block the event loop
- Socket.io pings get dropped → mass client disconnects
- API response times spike (p99 > 5s)

### Solutions

#### 1.1 Worker Threads for CPU-Intensive Tasks

Move heavy computation off the main thread:

```javascript
// src/lib/worker-pool.js
import { Worker } from 'worker_threads'
import os from 'os'

const POOL_SIZE = os.cpus().length - 1

export class WorkerPool {
  constructor(workerScript, size = POOL_SIZE) {
    this.workers = Array(size)
      .fill(null)
      .map(() => new Worker(workerScript))
    this.queue = []
    this.activeWorkers = new Set()
  }

  async execute(data) {
    const worker = await this.getAvailableWorker()
    return new Promise((resolve, reject) => {
      worker.once('message', resolve)
      worker.once('error', reject)
      worker.postMessage(data)
    })
  }

  private async getAvailableWorker() {
    const available = this.workers.find(w => !this.activeWorkers.has(w))
    if (available) return available

    // Queue if all busy
    return new Promise(resolve => {
      this.queue.push(resolve)
    })
  }
}
```

**Use Cases:**

- Markdown → HTML conversion (problem descriptions)
- Large JSON parsing (test cases)
- Plagiarism detection algorithms
- Statistics aggregation

#### 1.2 Streaming Responses Instead of Buffering

Replace large JSON responses with streaming:

```javascript
// ❌ BEFORE: Buffers entire response
async function getLeaderboard(req, res) {
    const leaderboard = await Leaderboard.find({}).lean().limit(1000)
    return res.json(leaderboard)
}

// ✅ AFTER: Streams incrementally
async function getLeaderboard(req, res) {
    res.setHeader('Content-Type', 'application/x-ndjson')

    const cursor = Leaderboard.find({}).lean().cursor({ batchSize: 100 })
    for await (const doc of cursor) {
        res.write(JSON.stringify(doc) + '\n')
    }
    res.end()
}
```

**Impact:** Reduces memory spike by 70% for large datasets

#### 1.3 Disable Nagle's Algorithm for Socket.IO

Reduce TCP packet delay for real-time updates:

```javascript
// src/lib/socket-server.js
import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
    transports: ['websocket', 'polling'],
    // Disable Nagle (batch small packets)
    socket: {
        tcpNoDelay: true, // ✅ Send immediately, not batched
    },
})

// On socket connection
io.on('connection', (socket) => {
    socket.conn.transport.socket.setNoDelay(true)
})
```

**Impact:** Reduces Socket.IO latency by 50-100ms

---

## 2. Redis Optimization

### Problem: Single-Instance Redis Saturated at 10k RPS

Current setup: 256MB Redis instance, BullMQ + Pub/Sub competing

### Solutions

#### 2.1 Redis Cluster Deployment

Replace single instance with sharded cluster:

```yaml
# docker-compose.yml
redis-cluster:
    image: redis:7-alpine
    command: >
        redis-server --cluster-enabled yes
        --maxmemory 2gb
        --maxmemory-policy allkeys-lru
        --save ""
    environment:
        # Cluster configuration
        REDIS_CLUSTER_SLOTS: 16384
    ports:
        - '6379-6384:6379-6384' # Cluster node ports
```

**Benefits:**

- Horizontal scaling: 3-6 nodes × 2GB each = 6-12GB total
- Automatic failover with Sentinel
- Each node handles ~30% CPU load vs 100% on single instance

#### 2.2 Separate Redis Instances by Purpose

Split cache, queues, and Pub/Sub into dedicated instances:

```javascript
// src/lib/redis.js
import Redis from 'ioredis'

// Dedicated for caching (LRU eviction)
export const cacheRedis = new Redis({
    host: process.env.REDIS_CACHE_HOST || 'redis-cache',
    maxRetriesPerRequest: null,
    lazyConnect: true,
})

// Dedicated for BullMQ (no eviction, AOF persistence)
export const queueRedis = new Redis({
    host: process.env.REDIS_QUEUE_HOST || 'redis-queue',
    maxRetriesPerRequest: null,
    lazyConnect: true,
})

// Dedicated for Pub/Sub (no persistence)
export const pubsubRedis = new Redis({
    host: process.env.REDIS_PUBSUB_HOST || 'redis-pubsub',
    maxRetriesPerRequest: null,
    lazyConnect: true,
})
```

**Benefits:**

- Cache eviction won't affect queued jobs
- each instance optimized for its workload
- No contention between consumers

#### 2.3 Advanced Caching Strategy

**Problem Data Caching (Cache-Aside):**

```javascript
// src/services/problem.service.js
export async function getProblemWithCache(problemId) {
    const cacheKey = `problem:${problemId}`
    const TTL = 86400 // 24 hours

    // Try cache first
    let cached = await cacheRedis.getex(cacheKey, 'EX', TTL)
    if (cached) {
        return JSON.parse(cached)
    }

    // Fallback to database
    const problem = await Problem.findById(problemId)

    // Cache the result
    await cacheRedis.setex(cacheKey, TTL, JSON.stringify(problem))

    return problem
}
```

**Leaderboard Caching (Write-Behind):**

```javascript
// src/services/leaderboard.service.js
export async function updateScore(contestId, userId, score) {
    // Update Redis immediately (O(log N) sorted set op)
    await queueRedis.zadd(`leaderboard:${contestId}`, score, userId)

    // Schedule bulk write to MongoDB (every 10s)
    scheduleLeaderboardSync(contestId)
}

function scheduleLeaderboardSync(contestId) {
    if (!syncTimers.has(contestId)) {
        const timer = setTimeout(async () => {
            const leaderboard = await queueRedis.zrange(
                `leaderboard:${contestId}`,
                0,
                -1,
                'WITHSCORES'
            )

            // Bulk upsert to MongoDB
            await Leaderboard.updateMany({ contestId }, leaderboard, { upsert: true })

            syncTimers.delete(contestId)
        }, 10000)

        syncTimers.set(contestId, timer)
    }
}
```

**Impact:**

- Leaderboard queries: 1ms (Redis) vs 100ms (MongoDB)
- Reduced database load by 95%

---

## 3. Database Query Optimization

### Problem: MongoDB Queries Becoming Bottleneck

**Current Issues:**

- Multiple round-trips for filtered queries
- Missing compound indexes on frequently accessed fields
- Aggregation pipelines not optimized

### Solutions

#### 3.1 Indexing Strategy

**Critical Indexes:**

```javascript
// src/models/Submission.js
submissionSchema.index({ userId: 1, createdAt: -1 }) // User submissions
submissionSchema.index({ problemId: 1, verdict: 1 }) // Problem verdicts
submissionSchema.index({ contestId: 1, score: -1 }) // Contest leaderboard
submissionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5184000 }) // TTL: 60 days
```

**Verify Indexes:**

```bash
# In mongo shell
db.submissions.getIndexes()
db.submissions.explain("executionStats").find({ userId: "123", createdAt: { $gte: Date.now() - 86400000 } })
```

#### 3.2 Database Query Optimization

**Problem: N+1 Queries**

```javascript
// ❌ BEFORE: Multiple DB hits
const contests = await Contest.find().lean()
for (const contest of contests) {
    const participants = await ContestParticipant.countDocuments({ contestId: contest._id })
    contest.participantCount = participants
}

// ✅ AFTER: Single aggregation
const contests = await Contest.aggregate([
    {
        $lookup: {
            from: 'contestparticipants',
            localField: '_id',
            foreignField: 'contestId',
            as: 'participants',
        },
    },
    {
        $addFields: { participantCount: { $size: '$participants' } },
    },
    { $project: { participants: 0 } },
])
```

**Result:** Query time: 500ms → 50ms (10x faster)

#### 3.3 Use `.lean()` for Read-Only Queries

```javascript
// ❌ BEFORE: Returns Mongoose documents (overhead)
const problems = await Problem.find({ difficulty: 'Hard' })

// ✅ AFTER: Returns plain objects (faster)
const problems = await Problem.find({ difficulty: 'Hard' }).lean()
```

**Impact:** Memory usage -40%, query speed +25%

#### 3.4 Batch Operations

```javascript
// ❌ BEFORE: Individual inserts (slow)
for (const submission of submissions) {
    await Submission.create(submission)
}

// ✅ AFTER: Batch insert (100x faster)
await Submission.insertMany(submissions, { ordered: false })
```

---

## 4. Socket.IO Real-Time Scaling

### Problem: Socket.IO Becomes Bottleneck at 10k Concurrent Connections

Current: All clients connected to single instance

### Solutions

#### 4.1 Redis Adapter for Multi-Instance Broadcasting

```javascript
// src/lib/socket-server.js
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import redis from './redis.js'

const io = new Server(httpServer, {
    adapter: createAdapter(pubsubRedis, pubsubRedis.duplicate()),
})

// Now broadcasts work across all server instances
io.emit('submission_result', { userId, verdict: 'AC' })
```

**Scaling:**

- 1 instance: 10,000 concurrent connections
- 3 instances: 30,000 concurrent connections
- Behind L4 load balancer (TCP sticky sessions)

#### 4.2 Room-Based Message Targeting

```javascript
// ✅ Only send to relevant user
io.to(`user:${userId}`).emit('submission_complete', result)

// ❌ Broadcast to everyone (wasteful)
io.emit('submission_complete', result)
```

**Impact:** Reduces bandwidth by 99% for large user bases

#### 4.3 Socket.IO Compression

```javascript
const io = new Server(httpServer, {
    transports: ['websocket'],
    wsEngine: 'ws',
    perMessageDeflate: {
        threshold: 1024, // Only compress > 1KB
        chunkSize: 8 * 1024,
    },
})
```

**Impact:** Reduces bandwidth by 60-80% for large messages

---

## 5. Worker Pool & Job Queue Optimization

### Problem: BullMQ Workers Underutilized or Overloaded

### Solutions

#### 5.1 Dynamic Worker Scaling

```javascript
// src/services/submission.worker.js
import Bull from 'bullmq'
import os from 'os'

const queue = new Bull('submission', {
    connection: queueRedis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
})

const WORKER_COUNT = Math.max(os.cpus().length - 1, 2)

// Scale workers based on queue depth
for (let i = 0; i < WORKER_COUNT; i++) {
    queue.process(async (job) => {
        const { submissionId } = job.data

        try {
            const result = await executeSubmission(submissionId)
            return result
        } catch (error) {
            // Re-throw for BullMQ retry logic
            throw error
        }
    })
}

// Monitor queue health
setInterval(async () => {
    const waitingCount = await queue.getWaitingCount()
    const activeCount = await queue.getActiveCount()

    console.log(`Submission Queue: ${waitingCount} waiting, ${activeCount} active`)

    // Alert if queue backing up
    if (waitingCount > 100) {
        logger.system.warn('Submission queue backing up', { waitingCount })
    }
}, 5000)
```

#### 5.2 Job Priority & Concurrency

```javascript
// src/services/submission.worker.js
queue.process('high', 2, async (job) => {
    // High-priority: 2 concurrent workers
    return executeSubmission(job.data)
})

queue.process('normal', 1, async (job) => {
    // Normal: 1 concurrent worker
    return executeSubmission(job.data)
})

queue.process('low', 0.25, async (job) => {
    // Low: throttled
    return executeSubmission(job.data)
})

// Client: Submit with priority
await queue.add(
    { submissionId },
    { priority: 10 } // Higher = more urgent
)
```

#### 5.3 Job Timeout & Graceful Degradation

```javascript
queue.process(async (job) => {
    const controller = new AbortController()
    const timeoutHandle = setTimeout(() => controller.abort(), 30000)

    try {
        const result = await executeSubmission(job.data, {
            signal: controller.signal,
        })
        return result
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Execution timeout after 30s')
        }
        throw error
    } finally {
        clearTimeout(timeoutHandle)
    }
})
```

---

## 6. Frontend Performance Optimization

### Problem: Frontend Loading Takes 5-10s, Blocking Real-Time Updates

### Solutions

#### 6.1 Code Splitting & Dynamic Imports

```javascript
// src/app/layout.js
import dynamic from 'next/dynamic'

// Load heavy components only when needed
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
    loading: () => <div>Loading...</div>,
    ssr: false, // Don't render on server
})

export default function Layout({ children }) {
    return (
        <>
            {children}
            <Suspense fallback={null}>
                <AdminPanel />
            </Suspense>
        </>
    )
}
```

#### 6.2 Image Optimization

```javascript
// src/components/ProblemCard.jsx
import Image from 'next/image'

export default function ProblemCard({ problem }) {
    return (
        <div>
            <Image
                src={problem.thumbnail}
                alt={problem.title}
                width={300}
                height={200}
                priority={false}
                loading="lazy"
                quality={75}
            />
        </div>
    )
}
```

**Impact:** Images 50% smaller, lazy-loaded out of viewport

#### 6.3 React Fast Refresh & HMR

Already enabled via `reactCompiler: true` in Next.js config

#### 6.4 Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# .env.local
ANALYZE=true npm run build

# Identify large packages to replace/remove
```

---

## 7. Docker Executor Performance

### Problem: Code Execution Takes 2-5s, Slow Container Creation

### Solutions

#### 7.1 Pre-warmed Container Pool

Keep idle containers ready:

```javascript
// src/lib/executor-pool.js
import Dockerode from 'dockerode'

export class ExecutorPool {
    constructor(poolSize = 10) {
        this.docker = new Dockerode()
        this.poolSize = poolSize
        this.availableContainers = []
        this.warmupPool()
    }

    async warmupPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const container = await this.docker.createContainer({
                Image: 'python:3.11-slim',
                Cmd: ['sleep', 'infinity'],
                HostConfig: {
                    Memory: 512 * 1024 * 1024, // 512MB
                    PidsLimit: 50,
                    NetworkMode: 'none',
                },
            })
            await container.start()
            this.availableContainers.push(container)
        }
    }

    async executeCode(code, language) {
        let container = this.availableContainers.pop()

        if (!container) {
            // Create on demand if pool empty
            container = await this.createContainer(language)
        }

        try {
            // Execute code in pre-warmed container
            const result = await container.exec({
                Cmd: [this.getExecutor(language), '-c', code],
                AttachStdout: true,
                AttachStderr: true,
            })
            return result
        } finally {
            // Return container to pool
            this.availableContainers.push(container)
        }
    }
}
```

**Impact:** Execution time: 2-5s → 200-500ms

#### 7.2 Multi-Stage Build Caching

Optimize executor images:

```dockerfile
# docker/executors/Dockerfile.python
FROM python:3.11-slim as base

# Layer 1: Base system
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Python packages (cached)
RUN pip install --no-cache-dir numpy pandas requests

# Layer 3: Runtime
FROM base
RUN adduser --disabled-password --gecos '' executor
USER executor
COPY --chown=executor:executor entrypoint.sh /
CMD ["/entrypoint.sh"]
```

#### 7.3 Limit Container Overhead

```javascript
const exec = await this.docker.createContainer({
    Image: 'python:3.11-slim',
    Hostname: 'executor',
    Env: ['PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'],
    HostConfig: {
        // CPU limits
        CpuPeriod: 100000,
        CpuQuota: 50000, // 50% of 1 CPU

        // Memory
        Memory: 512 * 1024 * 1024,
        MemorySwap: 512 * 1024 * 1024,

        // Process limits
        PidsLimit: 50,

        // Security
        ReadonlyRootfs: true,
        CapDrop: ['ALL'],
        NetworkMode: 'none',

        // Auto-cleanup
        AutoRemove: true,

        // Timeout
        StopTimeout: 30,
    },
})
```

---

## 8. Monitoring & Profiling

### Real-Time Performance Monitoring

```javascript
// src/lib/performance-monitor.js
import pino from 'pino'

const logger = pino({ level: 'info' })

export async function measurePerformance(label, fn) {
    const start = performance.now()

    try {
        const result = await fn()
        const duration = performance.now() - start

        logger.info({ label, duration, status: 'success' })
        return result
    } catch (error) {
        const duration = performance.now() - start
        logger.error({ label, duration, status: 'error', error })
        throw error
    }
}

// Usage
await measurePerformance('submit_code', async () => {
    return evaluatesubmission(submissionId)
})
```

### Key Metrics to Track

1. **API Endpoints**
    - Request latency (p50, p95, p99)
    - Request rate (RPS)
    - Error rate

2. **Database**
    - Query execution time
    - Connection pool usage
    - Slow query logs

3. **Redis**
    - Memory usage
    - Operation latency
    - Keyspace stats

4. **Workers**
    - Queue depth
    - Job processing time
    - Failure rate

5. **Socket.IO**
    - Active connections
    - Message throughput
    - Latency

---

## 9. Performance Checklist

### Immediate (Week 1)

- [ ] Enable Redis tcpNoDelay for Socket.IO
- [ ] Add `.lean()` to read-only MongoDB queries
- [ ] Enable request compression (gzip)
- [ ] Set up basic performance monitoring

### Short-term (Month 1)

- [ ] Implement Redis Cluster (3+ nodes)
- [ ] Split Redis into cache/queue/pubsub instances
- [ ] Add critical indexes to MongoDB
- [ ] Implement write-behind leaderboard caching
- [ ] Pre-warm container pool for executors

### Medium-term (Quarter 1)

- [ ] Implement worker threads for CPU tasks
- [ ] Add streaming responses for large datasets
- [ ] Implement dynamic worker scaling
- [ ] Add job priority queuing
- [ ] Frontend code splitting & lazy loading

### Long-term (Year 1)

- [ ] Migrate to TypeScript (enables better optimization)
- [ ] Implement GraphQL (better data fetching)
- [ ] Add CDN for static assets
- [ ] Multi-region deployment
- [ ] Advanced caching with service workers

---

## 10. Expected Performance Improvements

| Optimization           | Current | After     | Improvement   |
| ---------------------- | ------- | --------- | ------------- |
| **API Latency (p95)**  | 500ms   | 100ms     | 5x faster     |
| **Database Queries**   | 100ms   | 10ms      | 10x faster    |
| **Leaderboard Fetch**  | 100ms   | 2ms       | 50x faster    |
| **Socket.IO Latency**  | 200ms   | 50ms      | 4x faster     |
| **Code Execution**     | 2-5s    | 200-500ms | 5-10x faster  |
| **Redis Throughput**   | 10k RPS | 100k RPS  | 10x higher    |
| **Concurrent Users**   | 5k      | 50k+      | 10x more      |
| **Memory Usage**       | 2GB     | 1GB       | 50% reduction |
| **CPU Usage**          | 80%     | 30%       | 63% reduction |
| **Frontend Load Time** | 10s     | 2-3s      | 3-5x faster   |

---

## 11. References & Tools

**Profiling Tools:**

```bash
# Node.js profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Docker stats
docker stats --no-stream

# Redis monitoring
redis-cli MONITOR
redis-cli SLOWLOG GET 10
```

**Performance Testing:**

```bash
# Load testing with Artillery
npm install artillery
artillery quick --count 100 --num 10000 http://localhost:3000/api/problems

# Database profiling
db.setProfilingLevel(1)
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

---

**Final Note:** These optimizations should be implemented incrementally, with benchmarks before/after each change. Monitor production metrics closely and adjust based on real-world usage patterns.
