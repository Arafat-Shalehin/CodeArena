# Multi-stage Dockerfile for Next.js with API/Worker process split.

# Stage 1: dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
ENV HUSKY=0
RUN npm ci || (echo "npm ci failed, falling back to npm install" && npm install)

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV PROCESS_TYPE=API

# Build-time NEXT_PUBLIC_* values
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ENV NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}

RUN npm run build

# Stage 3: runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=7860
ENV HOSTNAME=0.0.0.0
# Default process; Railway worker service overrides this to WORKER.
ENV PROCESS_TYPE=API

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Keep standalone bundle in .next/standalone so scripts/start-process.js can detect it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/standalone/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./.next/standalone/public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/docker/executors/seccomp-profile.json ./docker/executors/seccomp-profile.json
COPY --from=builder --chown=nextjs:nodejs /app/docker/executors/seccomp-profile.json ./.next/standalone/docker/executors/seccomp-profile.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start-process.js ./scripts/start-process.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/worker-boot.js ./scripts/worker-boot.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/alias-loader.mjs ./scripts/alias-loader.mjs

USER nextjs

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
	CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1

# PROCESS_TYPE controls the entry command.
CMD ["sh", "-c", "if [ \"${PROCESS_TYPE}\" = \"WORKER\" ]; then npm run start:worker; else npm run start:api; fi"]
