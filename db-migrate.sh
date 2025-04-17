#!/bin/bash

# AI Freedom Trust Framework - Database Migration Script
# This script runs drizzle-kit to push schema changes to the database

echo "Starting database migration for AI Freedom Trust Framework..."

# Generate migration SQL
echo "Generating migration SQL..."
npx drizzle-kit push:pg --config=drizzle.config.ts

echo "Migration complete!"