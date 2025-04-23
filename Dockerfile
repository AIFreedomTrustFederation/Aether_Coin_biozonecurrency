FROM node:18-alpine

# Set working directory
WORKDIR /app

# Environment setup
ENV NODE_ENV=production
ENV PORT=5000

# Create and use non-root user for security
RUN addgroup -S scrollkeeper && \
    adduser -S -G scrollkeeper scrollkeeper && \
    chown -R scrollkeeper:scrollkeeper /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Set file permissions
RUN chown -R scrollkeeper:scrollkeeper /app

# Switch to non-root user
USER scrollkeeper

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/status || exit 1

# Command to run the application
CMD ["node", "server.js"]