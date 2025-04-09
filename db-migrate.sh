#!/bin/bash

# Run database migrations using Drizzle ORM
echo "Running database migrations..."
npx tsx server/migrate.ts

echo "Done!"