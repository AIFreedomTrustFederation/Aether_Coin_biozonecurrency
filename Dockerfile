FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set up environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Expose the port the app runs on
EXPOSE 5000

# Create startup script that runs automated processes
RUN echo '#!/bin/bash\n\
# Run database migrations\n\
echo "Running database migrations..."\n\
npm run db:push\n\
\n\
# Run automated code quality checks\n\
echo "Running code quality checks..."\n\
npm run lint || true\n\
\n\
# Run type safety checks\n\
echo "Running type safety checks..."\n\
npm run typecheck || true\n\
\n\
# Start the application\n\
echo "Starting Aetherion Wallet..."\n\
npm run start\n\
' > /app/docker-entrypoint.sh \
&& chmod +x /app/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]