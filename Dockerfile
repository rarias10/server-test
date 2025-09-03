# ---- Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src
COPY sql ./sql
COPY .env.example .env.example

# ---- Runtime
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# (Optional) tini as PID 1 for proper signal handling
RUN apk add --no-cache tini curl

# Non-root user
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp

# Bring in built app + node_modules
COPY --from=build /app /app

USER nodeuser
EXPOSE 8080

# NOTE: K8s ignores Dockerfile HEALTHCHECK; define probes in the Pod spec.
# Keep this for local docker-compose if you like:
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD sh -c "curl -fsS http://127.0.0.1:8080/api/health >/dev/null || exit 1"

# Ensure your server binds to 0.0.0.0:8080
# (in src/index.js or wherever you call app.listen)
CMD ["tini", "--", "node", "src/index.js"]
