#!/bin/bash

# Helper script to run common npm commands without modifying package.json

COMMAND=$1
shift

case $COMMAND in
  "db:studio")
    npx drizzle-kit studio "$@"
    ;;
  "backup")
    ./backup.sh "$@"
    ;;
  "reinit")
    ./reinit.sh "$@"
    ;;
  "clean")
    rm -rf dist/ build/ .cache/ node_modules/.cache/
    echo "✅ Project cleaned"
    ;;
  "lint")
    npx tsc --noEmit
    echo "✅ TypeScript check completed"
    ;;
  "debug")
    NODE_OPTIONS='--inspect' npx tsx server/index.ts
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Available commands:"
    echo "  db:studio - Run Drizzle Studio"
    echo "  backup - Run backup script"
    echo "  reinit - Run reinitialize script"
    echo "  clean - Clean build artifacts"
    echo "  lint - Run TypeScript check"
    echo "  debug - Run server in debug mode"
    exit 1
    ;;
esac