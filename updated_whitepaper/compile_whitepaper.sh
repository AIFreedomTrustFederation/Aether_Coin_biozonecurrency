#!/bin/bash

# Compile Whitepaper Script for Aetherion
# This script combines multiple markdown files into a single PDF

echo "======================================================"
echo "  Compiling FractalCoin & Aetherion Whitepaper v1.0.0"
echo "======================================================"

# Check for required tools
if ! command -v pandoc &> /dev/null; then
    echo "Error: pandoc is required but not installed."
    echo "Please install it with:"
    echo "  apt-get install pandoc"
    exit 1
fi

# Define output file
OUTPUT_FILE="FractalCoin_Complete_Whitepaper_v1.0.0.pdf"
TEMP_COMBINED="combined_whitepaper.md"

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
CURRENT_DIR=$(pwd)

# Clean up function
cleanup() {
    rm -f "$TEMP_COMBINED"
    rm -rf "$TEMP_DIR"
    cd "$CURRENT_DIR"
}

# Clean up on exit
trap cleanup EXIT

echo "Combining markdown files..."

# Create title page
cat > "$TEMP_COMBINED" << EOF
---
title: "FractalCoin & Aetherion"
subtitle: "A Quantum-Resistant Blockchain Ecosystem with Toroidal Economics"
author: "Aetherion Network"
date: "Version 1.0.0 - $(date +"%B %d, %Y")"
geometry: margin=1in
fontsize: 11pt
toc: true
toc-depth: 3
documentclass: report
header-includes:
    - \usepackage{fancyhdr}
    - \pagestyle{fancy}
    - \fancyhead[LE,RO]{FractalCoin \& Aetherion v1.0.0}
    - \fancyfoot[CE,CO]{© $(date +"%Y") Aetherion Network}
---

EOF

# Combine the markdown files in the specified order
cat "FractalCoin_Toroidal_Economics_Whitepaper.md" >> "$TEMP_COMBINED"
echo -e "\n\n" >> "$TEMP_COMBINED"
cat "AI_Agent_Network_Section.md" >> "$TEMP_COMBINED"
echo -e "\n\n" >> "$TEMP_COMBINED"
cat "Aetherion_Wallet_v1.0.0_Section.md" >> "$TEMP_COMBINED"
echo -e "\n\n" >> "$TEMP_COMBINED"
cat "User_Guide_Section.md" >> "$TEMP_COMBINED"
echo -e "\n\n" >> "$TEMP_COMBINED"
cat "Appendix_Feature_Matrix.md" >> "$TEMP_COMBINED"
echo -e "\n\n" >> "$TEMP_COMBINED"
cat "References_Section.md" >> "$TEMP_COMBINED"

echo "Creating PDF with pandoc..."

# Convert to PDF using pandoc
pandoc "$TEMP_COMBINED" \
    --pdf-engine=xelatex \
    -o "$OUTPUT_FILE" \
    --toc \
    --toc-depth=3 \
    --highlight-style=tango \
    --variable urlcolor=blue \
    --variable linkcolor=blue \
    --variable geometry:margin=1in

if [ $? -eq 0 ]; then
    echo "Success! Whitepaper compiled as $OUTPUT_FILE"
    
    # Get file size
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "File size: $FILE_SIZE"
    
    # Get page count if pdftk is available
    if command -v pdfinfo &> /dev/null; then
        PAGE_COUNT=$(pdfinfo "$OUTPUT_FILE" | grep Pages | awk '{print $2}')
        echo "Page count: $PAGE_COUNT pages"
    fi
else
    echo "Error: Failed to compile the whitepaper"
    exit 1
fi

echo "Done!"