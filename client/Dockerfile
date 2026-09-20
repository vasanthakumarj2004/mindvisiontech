<<<<<<< HEAD
# Multi-stage Dockerfile for MindVisionTech Next.js Client
# Stage 1: Dependencies
=======
# ==========================================
# Multi-stage Production Dockerfile for Next.js App
# ==========================================

# Stage 1: Install dependencies
>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

<<<<<<< HEAD
COPY package.json package-lock.json ./
RUN npm ci --no-audit

# Stage 2: Builder
=======
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

<<<<<<< HEAD
# Environment variables for build time
ARG NEXT_PUBLIC_API_BASE_URL=https://mindvisiontech.com/api
ARG NEXT_PUBLIC_SITE_URL=https://mindvisiontech.com
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
=======
>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

<<<<<<< HEAD
# Stage 3: Runner
=======
# Stage 3: Production runner
>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
<<<<<<< HEAD
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory and standalone output
=======
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
