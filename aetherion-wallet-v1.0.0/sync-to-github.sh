#!/bin/bash
# sync-to-github.sh - Script to sync Aetherion Wallet to GitHub and create a release
#
# This script automates the process of:
# 1. Committing local changes
# 2. Pushing to GitHub
# 3. Creating a release package
# 4. Generating release notes
#
# Usage: ./sync-to-github.sh [--tag VERSION] [--no-release]
#   --tag VERSION: Specify version tag (default: auto-incremented)
#   --no-release: Skip release creation

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
echo "  Aetherion Wallet - GitHub Sync & Release Script"
echo "================================================================"
echo -e "${RESET}"

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI not found. Release creation will be skipped.${RESET}"
    echo "For automatic release creation, install GitHub CLI: https://cli.github.com/"
    USE_GH_CLI=0
else
    USE_GH_CLI=1
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}GitHub CLI not authenticated. Please login:${RESET}"
        gh auth login
    fi
fi

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed${RESET}"
    echo "Please install Git before running this script."
    exit 1
fi

# Parse arguments
VERSION=""
SKIP_RELEASE=0

for arg in "$@"; do
    case $arg in
        --tag=*)
            VERSION="${arg#*=}"
            shift
            ;;
        --tag)
            if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
                VERSION="$2"
                shift 2
            else
                echo -e "${RED}Error: --tag requires a version number${RESET}"
                exit 1
            fi
            ;;
        --no-release)
            SKIP_RELEASE=1
            shift
            ;;
        *)
            # Unknown option
            echo -e "${YELLOW}Warning: Unknown option $arg${RESET}"
            shift
            ;;
    esac
done

# Check GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    if [ -f .env ]; then
        # Try to load from .env
        GITHUB_TOKEN=$(grep -o 'GITHUB_TOKEN=.*' .env | cut -d '=' -f2)
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${YELLOW}GITHUB_TOKEN environment variable is not set.${RESET}"
        if [ $USE_GH_CLI -eq 0 ]; then
            echo -e "${YELLOW}GitHub operations may fail without a token.${RESET}"
            read -p "Do you want to continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Exiting."
                exit 1
            fi
        fi
    else
        export GITHUB_TOKEN
    fi
fi

# Determine repository information
if [ -z "$GITHUB_REPOSITORY" ]; then
    # Try to extract from git remote
    GITHUB_REPOSITORY=$(git remote get-url origin 2>/dev/null | grep -o 'github.com[:/][^/]*/[^.]*' | sed 's/github.com[:/]//')
    
    if [ -z "$GITHUB_REPOSITORY" ]; then
        echo -e "${YELLOW}Could not determine GitHub repository.${RESET}"
        echo -e "Please enter the repository in format 'owner/repo':"
        read GITHUB_REPOSITORY
        
        if [ -z "$GITHUB_REPOSITORY" ]; then
            echo -e "${RED}No repository specified, exiting.${RESET}"
            exit 1
        fi
    fi
fi

# Auto-increment version if not specified
if [ -z "$VERSION" ]; then
    # Get the latest tag
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    
    # Extract version components
    MAJOR=$(echo $LATEST_TAG | grep -o 'v[0-9]*' | grep -o '[0-9]*')
    MINOR=$(echo $LATEST_TAG | grep -o '\.[0-9]*\.' | grep -o '[0-9]*')
    PATCH=$(echo $LATEST_TAG | grep -o '\.[0-9]*$' | grep -o '[0-9]*')
    
    # Increment patch version
    PATCH=$((PATCH + 1))
    
    # Form new version
    VERSION="v$MAJOR.$MINOR.$PATCH"
    
    echo -e "${GREEN}Auto-incremented version to $VERSION${RESET}"
fi

# Ensure version starts with 'v'
if [[ ! $VERSION == v* ]]; then
    VERSION="v$VERSION"
    echo -e "${YELLOW}Added 'v' prefix to version: $VERSION${RESET}"
fi

# Update documentation with the new version
echo -e "${BLUE}Updating documentation...${RESET}"

# Update version in package.json
if [ -f package.json ]; then
    # Extract version without 'v' prefix
    NUMERIC_VERSION=${VERSION#v}
    
    # Use temporary file to avoid issues with inline editing
    cat package.json | sed "s/\"version\": \"[^\"]*\"/\"version\": \"$NUMERIC_VERSION\"/" > package.json.tmp
    mv package.json.tmp package.json
    
    echo -e "${GREEN}Updated version in package.json to $NUMERIC_VERSION${RESET}"
fi

# Update CHANGELOG.md with version and date
if [ -f CHANGELOG.md ]; then
    TODAY=$(date +"%Y-%m-%d")
    
    # Check if version header already exists
    if ! grep -q "## \[$VERSION\]" CHANGELOG.md; then
        # Insert new version at the top after the header
        sed -i "0,/# Changelog/a\\
\\
## [$VERSION] - $TODAY\\
### Added\\
- Enhanced cross-platform deployment scripts\\
- Comprehensive deployment documentation\\
- One-command deployment for Docker and traditional environments\\
- Automated release and GitHub sync tools\\
" CHANGELOG.md
        
        echo -e "${GREEN}Updated CHANGELOG.md with new version $VERSION${RESET}"
    fi
fi

# Update README.md with new deployment information
if [ -f README.md ]; then
    # Check if README already has deployment section
    if ! grep -q "## Deployment" README.md; then
        # Add deployment section
        cat >> README.md << EOL

## Deployment

Aetherion Wallet can be easily deployed on any platform using our automated scripts.

### Docker Deployment (Recommended)

For most users, Docker deployment is the easiest option:

\`\`\`bash
./run-with-docker.sh
\`\`\`

This will automatically set up the entire application stack with PostgreSQL and Redis.

### Traditional Deployment

For environments without Docker:

\`\`\`bash
./deploy-traditional.sh
\`\`\`

### Detailed Instructions

For complete deployment instructions, see [CROSS-PLATFORM-DEPLOYMENT.md](CROSS-PLATFORM-DEPLOYMENT.md)
EOL
        
        echo -e "${GREEN}Updated README.md with deployment information${RESET}"
    fi
fi

# Stage files
echo -e "${BLUE}Staging changes for commit...${RESET}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to commit.${RESET}"
else
    # Commit changes
    echo -e "${BLUE}Committing changes...${RESET}"
    git commit -m "Update deployment tools and documentation for $VERSION"
    
    # Push changes
    echo -e "${BLUE}Pushing changes to GitHub...${RESET}"
    git push origin HEAD || {
        echo -e "${RED}Failed to push to GitHub.${RESET}"
        echo -e "${YELLOW}This could be due to an authentication issue or because the branch doesn't exist remotely.${RESET}"
        echo -e "Would you like to push with --set-upstream? (y/N)"
        read -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            BRANCH_NAME=$(git symbolic-ref --short HEAD)
            git push --set-upstream origin $BRANCH_NAME
        else
            echo "Skipping push. You'll need to push manually later."
        fi
    }
    
    # Tag version
    echo -e "${BLUE}Creating tag $VERSION...${RESET}"
    git tag -a $VERSION -m "Release $VERSION"
    git push origin $VERSION || echo -e "${YELLOW}Failed to push tag. You may need to push manually later.${RESET}"
fi

# Skip release creation if requested
if [ $SKIP_RELEASE -eq 1 ]; then
    echo -e "${YELLOW}Skipping release creation as requested.${RESET}"
    exit 0
fi

# Create a release package
echo -e "${BLUE}Creating release package...${RESET}"

# Create release directory
RELEASE_DIR="release-$VERSION"
mkdir -p $RELEASE_DIR

# Copy essential files
echo "Copying files to release package..."
cp -r \
    package.json \
    package-lock.json \
    .env.example \
    docker-compose.yml \
    Dockerfile \
    run-with-docker.sh \
    deploy-traditional.sh \
    CROSS-PLATFORM-DEPLOYMENT.md \
    README.md \
    CHANGELOG.md \
    LICENSE \
    $RELEASE_DIR/ 2>/dev/null || true

# Create release directories
mkdir -p $RELEASE_DIR/client
mkdir -p $RELEASE_DIR/server
mkdir -p $RELEASE_DIR/shared
mkdir -p $RELEASE_DIR/api-gateway

# Copy source code
cp -r client/src $RELEASE_DIR/client/ 2>/dev/null || true
cp -r server/src $RELEASE_DIR/server/ 2>/dev/null || true
cp -r shared/src $RELEASE_DIR/shared/ 2>/dev/null || true
cp -r api-gateway/src $RELEASE_DIR/api-gateway/ 2>/dev/null || true

# Copy configuration files
cp client/*.json $RELEASE_DIR/client/ 2>/dev/null || true
cp server/*.json $RELEASE_DIR/server/ 2>/dev/null || true
cp shared/*.json $RELEASE_DIR/shared/ 2>/dev/null || true
cp api-gateway/*.json $RELEASE_DIR/api-gateway/ 2>/dev/null || true

# Create zip archive
RELEASE_ZIP="aetherion-wallet-$VERSION.zip"
echo "Creating zip archive $RELEASE_ZIP..."
(cd $RELEASE_DIR && zip -r ../$RELEASE_ZIP .)

echo -e "${GREEN}Release package created: $RELEASE_ZIP${RESET}"

# Create GitHub release if GitHub CLI is available
if [ $USE_GH_CLI -eq 1 ]; then
    echo -e "${BLUE}Creating GitHub release...${RESET}"
    
    # Generate release notes
    RELEASE_NOTES=$(cat << EOL
# Aetherion Wallet $VERSION

## What's New

### Added
- Enhanced cross-platform deployment scripts
- Comprehensive deployment documentation
- One-command deployment for Docker and traditional environments
- Automated release and GitHub sync tools

## Deployment

See [CROSS-PLATFORM-DEPLOYMENT.md](CROSS-PLATFORM-DEPLOYMENT.md) for detailed instructions.

### Quick Start

**Docker:**
\`\`\`bash
./run-with-docker.sh
\`\`\`

**Traditional:**
\`\`\`bash
./deploy-traditional.sh
\`\`\`
EOL
)
    
    # Create GitHub release
    echo "$RELEASE_NOTES" > release-notes.md
    gh release create $VERSION -F release-notes.md $RELEASE_ZIP || {
        echo -e "${RED}Failed to create GitHub release.${RESET}"
        echo -e "${YELLOW}You can create the release manually on GitHub using the generated package.${RESET}"
    }
    rm release-notes.md
    
    echo -e "${GREEN}GitHub release created: $VERSION${RESET}"
else
    echo -e "${YELLOW}GitHub CLI not available, skipping release creation.${RESET}"
    echo -e "${YELLOW}You can create the release manually on GitHub using the generated package: $RELEASE_ZIP${RESET}"
fi

# Clean up
echo "Cleaning up..."
rm -rf $RELEASE_DIR

echo -e "${GREEN}${BOLD}Sync and release completed successfully!${RESET}"
echo -e "Version: $VERSION"
echo -e "Release package: $RELEASE_ZIP"