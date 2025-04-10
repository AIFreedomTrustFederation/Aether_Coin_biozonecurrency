#!/bin/bash

# resolve-conflicts.sh
# Script to resolve git conflicts after rebase abort

echo "=== Aetherion Git Conflict Resolution ==="
echo "This script will help resolve conflicts in package.json."
echo

# First, check current git status
echo "Current git status:"
git status

# Resolve conflicts in package.json by taking our version
echo
echo "Resolving package.json conflict..."
git checkout --ours package.json
git add package.json

echo
echo "Conflict resolved. Current git status:"
git status

# Create a clean branch with all our changes
echo
echo "Creating a clean branch with all changes..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BRANCH_NAME="clean_fixes_$TIMESTAMP"
git checkout -b $BRANCH_NAME

# Add all changes and commit
echo
echo "Adding all changes..."
git add .

echo
echo "Committing changes..."
git commit -m "Fixed conflicts and integrated all changes"

echo
echo "All conflicts resolved and changes committed to branch: $BRANCH_NAME"
echo "You can now synchronize with GitHub using this branch."