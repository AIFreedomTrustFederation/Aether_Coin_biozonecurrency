#!/bin/bash

# Whitepaper Client Update Script
# This script copies all whitepaper sections to the client/public/whitepaper directory
# and generates necessary metadata files for the whitepaper browser component

echo "======================================================"
echo "  Aetherion Whitepaper Client Update Tool"
echo "  v1.0.0"
echo "======================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "FractalCoin_Toroidal_Economics_Whitepaper.md" ]; then
    echo "Error: This script must be run from the updated_whitepaper directory"
    exit 1
fi

# Create the whitepaper directory in client/public if it doesn't exist
mkdir -p "../client/public/whitepaper"

# Copy whitepaper files
echo "Copying whitepaper files to client/public/whitepaper..."

# Main whitepaper
cp "FractalCoin_Toroidal_Economics_Whitepaper.md" "../client/public/whitepaper/"
echo "✓ Copied main whitepaper"

# AI Agent Network section
cp "AI_Agent_Network_Section.md" "../client/public/whitepaper/"
echo "✓ Copied AI Agent Network section"

# Wallet implementation
cp "Aetherion_Wallet_v1.0.0_Section.md" "../client/public/whitepaper/"
echo "✓ Copied Wallet implementation section"

# User guide
cp "User_Guide_Section.md" "../client/public/whitepaper/"
echo "✓ Copied User Guide section"

# Feature matrix
cp "Appendix_Feature_Matrix.md" "../client/public/whitepaper/"
echo "✓ Copied Feature Matrix appendix"

# References section
cp "References_Section.md" "../client/public/whitepaper/"
echo "✓ Copied References section"

# Create table of contents file
cat > "../client/public/whitepaper/toc.json" << EOF
{
  "title": "FractalCoin & Aetherion Whitepaper v1.0.0",
  "updated": "$(date +"%B %d, %Y")",
  "sections": [
    {
      "id": "main",
      "title": "FractalCoin Toroidal Economics",
      "filename": "FractalCoin_Toroidal_Economics_Whitepaper.md",
      "description": "Core economic principles, tokenomics, and consensus mechanisms"
    },
    {
      "id": "ai-agents",
      "title": "AI Agent Network",
      "filename": "AI_Agent_Network_Section.md",
      "description": "Architecture for the secure AI agent network and personalization framework"
    },
    {
      "id": "wallet",
      "title": "Aetherion Wallet v1.0.0",
      "filename": "Aetherion_Wallet_v1.0.0_Section.md",
      "description": "Technical architecture, security model, and implementation details"
    },
    {
      "id": "user-guide",
      "title": "User Guide",
      "filename": "User_Guide_Section.md",
      "description": "Detailed installation, configuration, and usage instructions"
    },
    {
      "id": "feature-matrix",
      "title": "Feature Matrix",
      "filename": "Appendix_Feature_Matrix.md",
      "description": "Complete feature inventory with implementation status"
    },
    {
      "id": "references",
      "title": "References",
      "filename": "References_Section.md",
      "description": "Academic papers, technical standards, and resources"
    }
  ]
}
EOF

echo "✓ Created whitepaper table of contents"

# Create compiled full whitepaper
echo "Creating combined whitepaper file..."
cat "FractalCoin_Toroidal_Economics_Whitepaper.md" > "../client/public/whitepaper/complete.md"
echo -e "\n\n" >> "../client/public/whitepaper/complete.md"
cat "AI_Agent_Network_Section.md" >> "../client/public/whitepaper/complete.md"
echo -e "\n\n" >> "../client/public/whitepaper/complete.md"
cat "Aetherion_Wallet_v1.0.0_Section.md" >> "../client/public/whitepaper/complete.md"
echo -e "\n\n" >> "../client/public/whitepaper/complete.md"
cat "User_Guide_Section.md" >> "../client/public/whitepaper/complete.md"
echo -e "\n\n" >> "../client/public/whitepaper/complete.md"
cat "Appendix_Feature_Matrix.md" >> "../client/public/whitepaper/complete.md"
echo -e "\n\n" >> "../client/public/whitepaper/complete.md"
cat "References_Section.md" >> "../client/public/whitepaper/complete.md"

echo "✓ Created combined whitepaper file"

# Copy over images if they exist
if [ -d "images" ]; then
    mkdir -p "../client/public/whitepaper/images"
    cp -r images/* "../client/public/whitepaper/images/"
    echo "✓ Copied whitepaper images"
fi

echo "======================================================"
echo "  Whitepaper content updated successfully!"
echo "======================================================"
echo "The whitepaper is now available in the client application at:"
echo "http://localhost:5173/whitepaper"
echo "======================================================"