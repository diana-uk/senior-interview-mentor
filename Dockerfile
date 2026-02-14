# Multi-stage build: build frontend + run backend
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY web/package.json web/package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS build-deps
COPY web/package.json web/package-lock.json* ./
RUN npm ci

# Build frontend
FROM build-deps AS build
COPY web/ ./
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built frontend
COPY --from=build /app/dist ./dist

# Copy server source (runs via tsx in production)
COPY web/server ./server
COPY web/package.json ./
COPY web/tsconfig.server.json ./

# Install tsx for running TypeScript server
RUN npm install tsx

EXPOSE 3001

CMD ["npx", "tsx", "server/index.ts"]
