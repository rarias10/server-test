# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install prod deps from lockfile (faster layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy only what the server needs at runtime
COPY src ./src
COPY sql ./sql
COPY .env.example .env.example
# If you transpile (TS/Babel), add:
# RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# tini for signal handling; curl for healthcheck
RUN apk add --no-cache tini curl

# Non-root user
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp

# Bring in deps and app files with proper ownership
COPY --from=build --chown=nodeuser:nodegrp /app/node_modules ./node_modules
COPY --chown=nodeuser:nodegrp package.json package-lock.json ./
COPY --chown=nodeuser:nodegrp src ./src
COPY --chown=nodeuser:nodegrp sql ./sql
COPY --chown=nodeuser:nodegrp .env.example .env.example
# If you build to /app/dist, copy that instead of src:
# COPY --from=build --chown=nodeuser:nodegrp /app/dist ./dist

USER nodeuser
EXPOSE 8080

# Dockerfile healthcheck (ignored by K8s; fine for local/Compose)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD sh -c "curl -fsS http://127.0.0.1:8080/api/health >/dev/null || exit 1"

# Prefer ENTRYPOINT for tini; keep CMD for your app
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","src/index.js"]
# If you build to dist:
# CMD ["node","dist/index.js"]

