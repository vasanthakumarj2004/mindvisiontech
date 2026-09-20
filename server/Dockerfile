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

CMD ["node", "server.js"]
