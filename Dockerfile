# Multi-stage Dockerfile for Next.js

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# Disable husky in Docker
ENV HUSKY=0
RUN npm ci || (echo "npm ci failed, falling back to npm install" && npm install)

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
# Dummy environment variables to satisfy Next.js build-time checks
# These will be overridden by docker-compose at runtime
ENV MONGODB_URI mongodb://localhost:27017/dummy
ENV JWT_SECRET dummy_secret_for_build
ENV NEXT_PUBLIC_FIREBASE_API_KEY dummy
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN dummy
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID dummy
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET dummy
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID dummy
ENV NEXT_PUBLIC_FIREBASE_APP_ID dummy
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
