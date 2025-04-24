#!/bin/bash

# migrate-to-main.sh
# Script to migrate CodeStar files and configuration from clean_fixes branch to main branch

echo "=== Aetherion: CodeStar Migration Script ==="
echo "This script migrates files from clean_fixes_20250410_163230 branch to main branch"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed or not in PATH"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Store current branch to return to it later
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Function to copy files from clean_fixes to main
copy_files_to_main() {
    echo "Switching to main branch..."
    git checkout main
    
    if [ $? -ne 0 ]; then
        echo "Error switching to main branch"
        return 1
    fi
    
    echo "Switching to clean_fixes_20250410_163230 branch to get latest files..."
    git checkout clean_fixes_20250410_163230
    
    if [ $? -ne 0 ]; then
        echo "Error switching to clean_fixes_20250410_163230 branch"
        git checkout $CURRENT_BRANCH
        return 1
    fi
    
    echo "Creating temporary directory..."
    TEMP_DIR=$(mktemp -d)
    
    # Copy the necessary files to the temporary directory
    echo "Copying files to temporary location..."
    cp -r client/src/pages/CodeStarPage.tsx $TEMP_DIR/
    cp -r client/src/pages/ScrollKeeperPage.tsx $TEMP_DIR/ScrollKeeperPage.tsx
    cp -r client/src/components/ScrollKeeperHighlight.tsx $TEMP_DIR/ScrollKeeperHighlight.tsx
    cp -r client/src/features/code-editor/components/CodeEditor.tsx $TEMP_DIR/
    cp -r client/src/App.tsx $TEMP_DIR/
    cp -r server-proxy.js $TEMP_DIR/
    cp -r .github/workflows/deploy-main-to-cpanel.yml $TEMP_DIR/
    cp -r .github/README-MAIN-DEPLOYMENT.md $TEMP_DIR/
    
    # Switch back to main branch
    echo "Switching back to main branch..."
    git checkout main
    
    if [ $? -ne 0 ]; then
        echo "Error switching to main branch"
        rm -rf $TEMP_DIR
        git checkout $CURRENT_BRANCH
        return 1
    fi
    
    # Create necessary directories if they don't exist
    echo "Creating necessary directories..."
    mkdir -p client/src/pages/
    mkdir -p client/src/components/
    mkdir -p client/src/features/code-editor/components/
    mkdir -p .github/workflows/
    
    # Copy files from temp directory to main branch
    echo "Copying files to main branch..."
    cp $TEMP_DIR/CodeStarPage.tsx client/src/pages/
    cp $TEMP_DIR/ScrollKeeperPage.tsx client/src/pages/
    cp $TEMP_DIR/ScrollKeeperHighlight.tsx client/src/components/
    cp $TEMP_DIR/CodeEditor.tsx client/src/features/code-editor/components/
    cp $TEMP_DIR/App.tsx client/src/
    cp $TEMP_DIR/server-proxy.js ./
    cp $TEMP_DIR/deploy-main-to-cpanel.yml .github/workflows/
    cp $TEMP_DIR/README-MAIN-DEPLOYMENT.md .github/
    
    # Clean up temp directory
    echo "Cleaning up..."
    rm -rf $TEMP_DIR
    
    # Return to original branch
    echo "Returning to original branch: $CURRENT_BRANCH"
    git checkout $CURRENT_BRANCH
    
    echo "File migration completed successfully!"
    echo "Please review the changes and commit them to the main branch."
    echo "To commit the changes, run:"
    echo "  git checkout main"
    echo "  git add ."
    echo "  git commit -m 'feat: Migrate CodeStar from clean_fixes to main branch'"
    echo "  git push origin main"
}

# Main execution
echo "==== Starting migration ===="
copy_files_to_main

if [ $? -ne 0 ]; then
    echo "Migration failed! See error messages above."
    exit 1
else
    echo "==== Migration completed successfully ===="
    echo "The necessary files have been copied to the main branch."
    echo "You'll need to commit these changes to the main branch."
fi