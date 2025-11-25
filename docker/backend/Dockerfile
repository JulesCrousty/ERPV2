FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/. .
COPY run-migrations.sh ./
RUN npm run build
RUN chmod +x run-migrations.sh
CMD ["sh", "-c", "./run-migrations.sh && node dist/main.js"]
