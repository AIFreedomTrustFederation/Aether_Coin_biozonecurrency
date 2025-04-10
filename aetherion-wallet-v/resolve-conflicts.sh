#!/bin/bash
# resolve-conflicts.sh - Helper script to resolve Git conflicts during sync
#
# This script automates the process of:
# 1. Detecting ongoing rebase/merge operations
# 2. Helping to resolve conflicts
# 3. Cleaning up repository state if needed
#
# Usage: ./resolve-conflicts.sh [--abort] [--accept-ours] [--accept-theirs]

set -e

# ANSI color codes
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RED="\033[31m"

# Banner
echo -e "${BLUE}${BOLD}"
echo "================================================================"
echo "  Aetherion Wallet - Git Conflict Resolution Helper"
echo "================================================================"
echo -e "${RESET}"

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed${RESET}"
    echo "Please install Git before running this script."
    exit 1
fi

# Parse arguments
ABORT=0
ACCEPT_OURS=0
ACCEPT_THEIRS=0

for arg in "$@"; do
    case $arg in
        --abort)
            ABORT=1
            shift
            ;;
        --accept-ours)
            ACCEPT_OURS=1
            shift
            ;;
        --accept-theirs)
            ACCEPT_THEIRS=1
            shift
            ;;
        *)
            # Unknown option
            echo -e "${YELLOW}Warning: Unknown option $arg${RESET}"
            shift
            ;;
    esac
done

# Check if there's an ongoing rebase
IS_REBASING=0
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    IS_REBASING=1
    echo -e "${YELLOW}Detected an ongoing rebase operation.${RESET}"
fi

# Check if there's an ongoing merge
IS_MERGING=0
if [ -f ".git/MERGE_HEAD" ]; then
    IS_MERGING=1
    echo -e "${YELLOW}Detected an ongoing merge operation.${RESET}"
fi

# Check for conflicts
CONFLICTS=$(git diff --name-only --diff-filter=U 2>/dev/null || echo "")
HAS_CONFLICTS=0
if [ -n "$CONFLICTS" ]; then
    HAS_CONFLICTS=1
    echo -e "${RED}Detected conflicts in the following files:${RESET}"
    echo "$CONFLICTS" | sed 's/^/- /'
fi

# Abort if requested
if [ $ABORT -eq 1 ]; then
    echo -e "${YELLOW}Aborting conflict resolution...${RESET}"
    
    if [ $IS_REBASING -eq 1 ]; then
        git rebase --abort
        echo -e "${GREEN}Rebase aborted.${RESET}"
    elif [ $IS_MERGING -eq 1 ]; then
        git merge --abort
        echo -e "${GREEN}Merge aborted.${RESET}"
    else
        echo -e "${YELLOW}No ongoing rebase or merge operation detected.${RESET}"
    fi
    
    # Clean up any leftover state
    if [ -d ".git/rebase-merge" ]; then
        rm -rf .git/rebase-merge
        echo "Cleaned up .git/rebase-merge"
    fi
    
    if [ -d ".git/rebase-apply" ]; then
        rm -rf .git/rebase-apply
        echo "Cleaned up .git/rebase-apply"
    fi
    
    if [ -f ".git/MERGE_HEAD" ]; then
        rm -f .git/MERGE_HEAD
        echo "Cleaned up .git/MERGE_HEAD"
    fi
    
    echo -e "${GREEN}Repository state cleaned up.${RESET}"
    exit 0
fi

# If no conflicts and no ongoing operations, check repository state
if [ $HAS_CONFLICTS -eq 0 ] && [ $IS_REBASING -eq 0 ] && [ $IS_MERGING -eq 0 ]; then
    echo -e "${GREEN}No conflicts or ongoing rebase/merge operations detected.${RESET}"
    
    # Check if there are any uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo -e "${YELLOW}Detected uncommitted changes.${RESET}"
        echo -e "Options:"
        echo -e "1. Commit changes: ${BOLD}git commit -am \"Your commit message\"${RESET}"
        echo -e "2. Stash changes: ${BOLD}git stash${RESET}"
        echo -e "3. Discard changes: ${BOLD}git reset --hard${RESET} (CAUTION: This will delete all uncommitted changes)"
    else
        echo -e "${GREEN}Repository is clean and ready for sync.${RESET}"
        echo -e "You can now run: ${YELLOW}./sync-to-github.sh${RESET}"
    fi
    
    exit 0
fi

# Auto-resolve conflicts if requested
if [ $ACCEPT_OURS -eq 1 ] && [ $HAS_CONFLICTS -eq 1 ]; then
    echo -e "${BLUE}Resolving conflicts by accepting our changes...${RESET}"
    
    for file in $CONFLICTS; do
        if [ -f "$file" ]; then
            git checkout --ours "$file"
            git add "$file"
            echo "Resolved: $file (using our version)"
        fi
    done
    
    # Continue the rebase or merge
    if [ $IS_REBASING -eq 1 ]; then
        git rebase --continue
        echo -e "${GREEN}Rebase continued after resolving conflicts.${RESET}"
    elif [ $IS_MERGING -eq 1 ]; then
        git commit
        echo -e "${GREEN}Merge completed after resolving conflicts.${RESET}"
    fi
elif [ $ACCEPT_THEIRS -eq 1 ] && [ $HAS_CONFLICTS -eq 1 ]; then
    echo -e "${BLUE}Resolving conflicts by accepting their changes...${RESET}"
    
    for file in $CONFLICTS; do
        if [ -f "$file" ]; then
            git checkout --theirs "$file"
            git add "$file"
            echo "Resolved: $file (using their version)"
        fi
    done
    
    # Continue the rebase or merge
    if [ $IS_REBASING -eq 1 ]; then
        git rebase --continue
        echo -e "${GREEN}Rebase continued after resolving conflicts.${RESET}"
    elif [ $IS_MERGING -eq 1 ]; then
        git commit
        echo -e "${GREEN}Merge completed after resolving conflicts.${RESET}"
    fi
elif [ $HAS_CONFLICTS -eq 1 ]; then
    # Manual conflict resolution
    echo -e "${BLUE}Please resolve conflicts manually, then continue:${RESET}"
    echo
    echo -e "1. Edit conflicted files to resolve conflicts"
    echo -e "   (Look for markers like ${YELLOW}<<<<<<< HEAD${RESET}, ${YELLOW}=======${RESET}, and ${YELLOW}>>>>>>> branch-name${RESET})"
    echo
    echo -e "2. Add resolved files:"
    echo -e "   ${BOLD}git add path/to/resolved/file${RESET}"
    echo
    echo -e "3. Continue the operation:"
    
    if [ $IS_REBASING -eq 1 ]; then
        echo -e "   ${BOLD}git rebase --continue${RESET}"
    elif [ $IS_MERGING -eq 1 ]; then
        echo -e "   ${BOLD}git commit${RESET}"
    fi
    
    echo
    echo -e "Alternatively, you can:"
    echo -e "- Accept our changes for all files: ${BOLD}./resolve-conflicts.sh --accept-ours${RESET}"
    echo -e "- Accept their changes for all files: ${BOLD}./resolve-conflicts.sh --accept-theirs${RESET}"
    echo -e "- Abort the operation: ${BOLD}./resolve-conflicts.sh --abort${RESET}"
    echo
fi

# Provide help for common conflict scenarios
echo -e "${BLUE}${BOLD}Common Conflict Resolution Scenarios:${RESET}"
echo

# package.json conflicts
if echo "$CONFLICTS" | grep -q "package.json"; then
    echo -e "${YELLOW}Resolving package.json conflicts:${RESET}"
    echo -e "1. Manually merge dependencies by keeping both sets"
    echo -e "2. Make sure version numbers don't conflict"
    echo -e "3. Run ${BOLD}npm install${RESET} after resolving to update package-lock.json"
    echo
fi

# Lock file conflicts
if echo "$CONFLICTS" | grep -q "package-lock.json\|yarn.lock"; then
    echo -e "${YELLOW}Resolving lock file conflicts:${RESET}"
    echo -e "Recommended: Accept local version and regenerate:"
    echo -e "${BOLD}git checkout --ours package-lock.json && npm install${RESET}"
    echo -e "or"
    echo -e "${BOLD}git checkout --ours yarn.lock && yarn${RESET}"
    echo
fi

# Configuration file conflicts
if echo "$CONFLICTS" | grep -q "\.env\|config\."; then
    echo -e "${YELLOW}Resolving configuration file conflicts:${RESET}"
    echo -e "1. Be careful with sensitive data in .env files"
    echo -e "2. For config files, merge settings carefully to avoid breaking changes"
    echo
fi

echo -e "${GREEN}Run this script again after making progress to check status.${RESET}"