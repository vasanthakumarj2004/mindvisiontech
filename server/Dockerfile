<<<<<<< HEAD
# Dockerfile for MindVisionTech Express Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first for optimal caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy server application source
COPY . .

EXPOSE 5000

=======
# ==========================================
# Production Dockerfile for MindVisionTech API
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY . .

# Use non-root node user for security
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
CMD ["node", "server.js"]
