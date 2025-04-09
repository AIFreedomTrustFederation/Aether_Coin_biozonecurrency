#!/bin/bash

# Initialize the LLM service and set up prompts
echo "Initializing LLM service..."
npx tsx server/scripts/init-llm.ts

echo "Done!"