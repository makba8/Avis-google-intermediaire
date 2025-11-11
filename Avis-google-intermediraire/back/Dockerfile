# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Verify build output structure
RUN echo "=== Checking dist structure ===" && \
    ls -la /app/dist/ && \
    echo "=== Checking for main.js ===" && \
    (test -f /app/dist/main.js && echo "Found dist/main.js" || echo "dist/main.js not found") && \
    (test -f /app/dist/src/main.js && echo "Found dist/src/main.js" || echo "dist/src/main.js not found") && \
    echo "=== Build verification complete ==="

# Create data directory for SQLite with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Create startup script that finds the correct main.js location
RUN printf '#!/bin/sh\n\
if [ -f dist/src/main.js ]; then\n\
  echo "Starting from dist/src/main.js"\n\
  exec node dist/src/main.js\n\
elif [ -f dist/main.js ]; then\n\
  echo "Starting from dist/main.js"\n\
  exec node dist/main.js\n\
else\n\
  echo "ERROR: main.js not found!"\n\
  echo "Contents of dist/:"\n\
  ls -la dist/ || echo "dist/ does not exist"\n\
  echo "Contents of dist/src/:"\n\
  ls -la dist/src/ 2>/dev/null || echo "dist/src/ does not exist"\n\
  exit 1\n\
fi\n' > /app/start.sh && \
    chmod +x /app/start.sh

# Create docker entrypoint script that creates Google files from env vars
RUN printf '#!/bin/sh\n\
# Create credentials.json from environment variable if not already present\n\
if [ -n "$GOOGLE_CREDENTIALS_JSON" ] && [ ! -f /app/credentials.json ]; then\n\
  echo "Creating credentials.json from environment variable..."\n\
  echo "$GOOGLE_CREDENTIALS_JSON" > /app/credentials.json\n\
  chmod 644 /app/credentials.json\n\
fi\n\
# Create token.json from environment variable if not already present\n\
if [ -n "$GOOGLE_TOKEN_JSON" ] && [ ! -f /app/token.json ]; then\n\
  echo "Creating token.json from environment variable..."\n\
  echo "$GOOGLE_TOKEN_JSON" > /app/token.json\n\
  chmod 644 /app/token.json\n\
fi\n\
# Start the application\n\
exec /app/start.sh\n' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of app directory (but not mounted volumes)
RUN chown -R nestjs:nodejs /app

# Note: credentials.json and token.json can be:
# 1. Mounted as volumes (for local development)
# 2. Created from GOOGLE_CREDENTIALS_JSON and GOOGLE_TOKEN_JSON env vars (for cloud deployment)
# They should be readable by the user (chmod 644 recommended)
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/stats', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using entrypoint that handles Google credentials
CMD ["/app/docker-entrypoint.sh"]



