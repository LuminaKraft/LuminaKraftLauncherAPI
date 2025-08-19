# Use Node.js 18 LTS (Alpine for smaller image size)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies with improved reliability
# Use multiple mirrors, add retry logic, and install all packages in one layer
RUN set -eux; \
    # Configure multiple package mirrors for reliability
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/main" > /etc/apk/repositories; \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/community" >> /etc/apk/repositories; \
    echo "http://mirror.yandex.ru/mirrors/alpine/v3.21/main" >> /etc/apk/repositories; \
    echo "http://mirror.yandex.ru/mirrors/alpine/v3.21/community" >> /etc/apk/repositories; \
    # Update package index with timeout
    timeout 300 apk update --no-cache; \
    # Install packages with retry logic and timeout
    for attempt in 1 2 3; do \
        echo "Package installation attempt $attempt/3"; \
        if timeout 600 apk add --no-cache dumb-init curl; then \
            echo "✅ Package installation successful"; \
            break; \
        else \
            echo "❌ Attempt $attempt failed"; \
            if [ $attempt -eq 3 ]; then \
                echo "💥 All attempts failed"; \
                exit 1; \
            fi; \
            sleep 10; \
        fi; \
    done; \
    # Create non-root user
    addgroup -g 1001 -S nodejs; \
    adduser -S nodeuser -u 1001

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with error handling
RUN set -eux; \
    echo "📦 Installing Node.js dependencies..."; \
    npm ci --only=production --no-audit --no-fund; \
    npm cache clean --force;

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose port 9374
EXPOSE 9374

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9374/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"] 