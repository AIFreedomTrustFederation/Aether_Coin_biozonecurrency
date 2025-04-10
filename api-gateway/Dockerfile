FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the API Gateway
COPY . .

# Build the API Gateway
RUN npm run build

# Set up environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 3001

# Create startup script
RUN echo '#!/bin/bash\n\
# Run code quality checks\n\
echo "Running code quality checks for API Gateway..."\n\
npm run lint || true\n\
\n\
# Run type safety checks\n\
echo "Running type safety checks for API Gateway..."\n\
npm run typecheck || true\n\
\n\
# Start the API Gateway\n\
echo "Starting Aetherion API Gateway..."\n\
npm run start\n\
' > /app/docker-entrypoint.sh \
&& chmod +x /app/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]