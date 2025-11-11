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

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of app directory (but not mounted volumes)
RUN chown -R nestjs:nodejs /app

# Note: credentials.json and token.json will be mounted as volumes
# They should be readable by the user (chmod 644 recommended on host)
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/stats', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["/app/start.sh"]



