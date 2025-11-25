# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for native dependencies like bcrypt
RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./

# Prefer reproducible installs when lockfile is present
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY backend/. .

# Compile the NestJS application
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY backend/. .
COPY --from=builder /app/dist ./dist
COPY run-migrations.sh ./run-migrations.sh

RUN chmod +x ./run-migrations.sh

EXPOSE 3000

CMD ["sh", "-c", "./run-migrations.sh && node dist/main.js"]
