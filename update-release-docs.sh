#!/bin/bash

# Update Release Documentation Script
# This script ensures the whitepaper and release documentation is updated
# in both the main repository and the release package

echo "================================================================"
echo "  Aetherion Wallet - Update Release Documentation"
echo "================================================================"

# Variables
RELEASE_DIR="aetherion-wallet-v1.0.0"
WHITEPAPER_DIR="updated_whitepaper"
DOCS_TO_SYNC=(
    "RELEASE-USAGE-GUIDE.md"
    "GITHUB-RELEASE-GUIDE.md"
)

# Check if release directory exists
if [ ! -d "$RELEASE_DIR" ]; then
    echo "Release directory $RELEASE_DIR does not exist. Creating it first..."
    ./create-deployment-package.sh --version=1.0.0
    
    if [ ! -d "$RELEASE_DIR" ]; then
        echo "Failed to create release directory. Exiting."
        exit 1
    fi
    
    echo "Release directory created successfully."
fi

# 1. Copy documentation files to release directory
echo "Copying documentation files to release package..."
for doc in "${DOCS_TO_SYNC[@]}"; do
    if [ -f "$doc" ]; then
        cp "$doc" "$RELEASE_DIR/"
        echo "✓ Copied $doc to release package"
    else
        echo "⚠ Warning: $doc not found, skipping"
    fi
done

# 2. Create whitepaper directory in release package if it doesn't exist
if [ ! -d "$RELEASE_DIR/$WHITEPAPER_DIR" ]; then
    mkdir -p "$RELEASE_DIR/$WHITEPAPER_DIR"
    echo "✓ Created whitepaper directory in release package"
fi

# 3. Copy whitepaper files to release package
echo "Copying whitepaper files to release package..."
if [ -d "$WHITEPAPER_DIR" ]; then
    cp -r "$WHITEPAPER_DIR"/*.md "$RELEASE_DIR/$WHITEPAPER_DIR/"
    cp -r "$WHITEPAPER_DIR"/*.sh "$RELEASE_DIR/$WHITEPAPER_DIR/"
    
    # Ensure scripts are executable
    chmod +x "$RELEASE_DIR/$WHITEPAPER_DIR"/*.sh
    
    echo "✓ Copied whitepaper files to release package"
    
    # If images directory exists, copy it too
    if [ -d "$WHITEPAPER_DIR/images" ]; then
        mkdir -p "$RELEASE_DIR/$WHITEPAPER_DIR/images"
        cp -r "$WHITEPAPER_DIR/images"/* "$RELEASE_DIR/$WHITEPAPER_DIR/images/"
        echo "✓ Copied whitepaper images to release package"
    fi
else
    echo "⚠ Warning: Whitepaper directory not found, skipping"
fi

# 4. Update package.json in release directory to include whitepaper scripts
if [ -f "$RELEASE_DIR/package.json" ]; then
    # Using temporary files to ensure proper JSON formatting
    jq '.scripts["whitepaper:pdf"] = "cd updated_whitepaper && ./compile_whitepaper.sh"' "$RELEASE_DIR/package.json" > "$RELEASE_DIR/package.json.tmp"
    mv "$RELEASE_DIR/package.json.tmp" "$RELEASE_DIR/package.json"
    
    jq '.scripts["whitepaper:update"] = "cd updated_whitepaper && ./update_client_whitepaper.sh"' "$RELEASE_DIR/package.json" > "$RELEASE_DIR/package.json.tmp"
    mv "$RELEASE_DIR/package.json.tmp" "$RELEASE_DIR/package.json"
    
    echo "✓ Updated package.json with whitepaper scripts"
fi

# 5. Create new package tarball
echo "Creating updated release package tarball..."
tar -czf "$RELEASE_DIR.tar.gz" "$RELEASE_DIR"
echo "✓ Created updated tarball: $RELEASE_DIR.tar.gz"

echo "================================================================"
echo "  Documentation update complete!"
echo "================================================================"
echo "The following files have been updated in the release package:"
for doc in "${DOCS_TO_SYNC[@]}"; do
    echo "  - $doc"
done
echo "  - Complete whitepaper documentation"
echo ""
echo "You can now run ./github-release.sh to update the GitHub release"
echo "with the latest documentation."
echo "================================================================"