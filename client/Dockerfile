# --- Build stage ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

COPY shared shared
COPY client client
ARG VITE_API_BASE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
RUN npm run build -w shared && npm run build -w client

# --- Runtime stage ---
FROM nginx:alpine AS runtime
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
