// This script generates the Tailwind CSS output file
// Run this script with Node.js when you need to update your Tailwind CSS

const fs = require('fs');
const path = require('path');
const tailwindcss = require('tailwindcss');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

// Define the input and output file paths
const inputFile = path.join(__dirname, 'src', 'tailwind-input.css');
const outputFile = path.join(__dirname, 'src', 'styles', 'tailwind-output.css');

// Create a minimal input file with Tailwind directives
const inputContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

// Write the input file
fs.writeFileSync(inputFile, inputContent);

// Process the CSS with Tailwind and PostCSS
async function generateCSS() {
  try {
    const result = await postcss([
      tailwindcss(path.join(__dirname, 'tailwind.config.js')),
      autoprefixer,
    ]).process(inputContent, {
      from: inputFile,
      to: outputFile,
    });

    // Write the output file
    fs.writeFileSync(outputFile, result.css);
    console.log('Tailwind CSS generated successfully!');

    // Clean up the input file
    fs.unlinkSync(inputFile);
  } catch (error) {
    console.error('Error generating Tailwind CSS:', error);
  }
}

generateCSS();