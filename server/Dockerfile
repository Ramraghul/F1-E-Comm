# --- Build stage ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

COPY shared shared
COPY server server
RUN npm run build -w shared && npm run build -w server

# --- Runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci --omit=dev

COPY --from=builder /app/shared/dist shared/dist
COPY --from=builder /app/server/dist server/dist

WORKDIR /app/server
EXPOSE 5000
CMD ["node", "dist/index.js"]
