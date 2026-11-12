# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY tsconfig.base.json ./
COPY scripts/prepare.mjs ./scripts/prepare.mjs

RUN npm ci

COPY server/ ./server/

WORKDIR /app/server
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY scripts/prepare.mjs ./scripts/prepare.mjs
RUN npm ci --omit=dev

COPY --from=builder /app/server/dist ./dist

EXPOSE 5000

USER node

CMD ["node", "dist/server.js"]

