# ---- Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY src ./src
COPY sql ./sql
COPY .env.example .env.example
# Keep node_modules from build for production image (no native deps here)

# ---- Runtime
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
# Create non-root user
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp
COPY --from=build /app /app
USER nodeuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node", "src/index.js"]
