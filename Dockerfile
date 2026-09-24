# syntax=docker/dockerfile:1

# Etapa 1: instalar dependências (cacheada por lockfile)
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Etapa 2: ambiente de desenvolvimento (Metro bundler para Expo Go)
FROM oven/bun:1-alpine
WORKDIR /app

ENV NODE_ENV=development \
    EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
    CHOKIDAR_USEPOLLING=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 8081

# O comando efetivo (LAN/tunnel) vem do docker-compose.yml; este é só fallback.
CMD ["bunx", "expo", "start", "--host", "lan", "--port", "8081"]
