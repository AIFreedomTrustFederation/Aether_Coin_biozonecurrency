import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import path from 'path';

// Configuration
const VERSION = 'v1.0.0'; // Set your version here
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'AIFreedomTrustFederation/Aether_Coin_biozonecurrency'; // owner/repo format
const RELEASE_NOTES_FILE = `RELEASE-NOTES-${VERSION}.md`;
let PACKAGE_FILE = `aetherion-wallet-${VERSION}.tar.gz`;

// Check token
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

// Check if files exist
if (!fs.existsSync(RELEASE_NOTES_FILE)) {
  console.error(`Error: Release notes file '${RELEASE_NOTES_FILE}' not found`);
  process.exit(1);
}

if (!fs.existsSync(PACKAGE_FILE)) {
  console.error(`Error: Package file '${PACKAGE_FILE}' not found`);
  console.log('Looking for alternative package file...');
  
  // Try with v prefix if not there
  if (VERSION.startsWith('v')) {
    const altPackageFile = `aetherion-wallet-${VERSION.substring(1)}.tar.gz`;
    if (fs.existsSync(altPackageFile)) {
      console.log(`Found alternative package file: ${altPackageFile}`);
      PACKAGE_FILE = altPackageFile;
    }
  } else {
    const altPackageFile = `aetherion-wallet-v${VERSION}.tar.gz`;
    if (fs.existsSync(altPackageFile)) {
      console.log(`Found alternative package file: ${altPackageFile}`);
      PACKAGE_FILE = altPackageFile;
    }
  }
  
  if (!fs.existsSync(PACKAGE_FILE)) {
    console.error(`Error: Could not find any suitable package file`);
    process.exit(1);
  }
}

// Read release notes
const releaseNotes = fs.readFileSync(RELEASE_NOTES_FILE, 'utf8');

// Create release
console.log(`Creating GitHub release ${VERSION}...`);

const releaseData = {
  tag_name: VERSION,
  name: `Aetherion Wallet ${VERSION}`,
  body: releaseNotes,
  draft: false,
  prerelease: false
};

const releaseOptions = {
  hostname: 'api.github.com',
  path: `/repos/${REPO}/releases`,
  method: 'POST',
  headers: {
    'User-Agent': 'Aetherion-Release-Script',
    'Content-Type': 'application/json',
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

const releaseReq = https.request(releaseOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const releaseResponse = JSON.parse(data);
      console.log(`Release created successfully: ${releaseResponse.html_url}`);
      
      // Upload asset
      uploadAsset(releaseResponse.upload_url, PACKAGE_FILE);
    } else {
      console.error(`Error creating release: ${res.statusCode}`);
      console.error(data);
    }
  });
});

releaseReq.on('error', (error) => {
  console.error(`Error creating release: ${error.message}`);
});

releaseReq.write(JSON.stringify(releaseData));
releaseReq.end();

function uploadAsset(uploadUrl, assetPath) {
  console.log(`Uploading asset: ${assetPath}...`);
  
  // Format upload URL (remove {?name,label} template)
  uploadUrl = uploadUrl.replace(/{.*}/, '');
  
  // Get asset content and size
  const assetContent = fs.readFileSync(assetPath);
  const assetSize = fs.statSync(assetPath).size;
  
  // Set upload options
  const assetOptions = {
    hostname: new URL(uploadUrl).hostname,
    path: `${new URL(uploadUrl).pathname}?name=${encodeURIComponent(assetPath)}`,
    method: 'POST',
    headers: {
      'User-Agent': 'Aetherion-Release-Script',
      'Content-Type': 'application/octet-stream',
      'Content-Length': assetSize,
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  };
  
  const assetReq = https.request(assetOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const assetResponse = JSON.parse(data);
        console.log(`Asset uploaded successfully: ${assetResponse.browser_download_url}`);
      } else {
        console.error(`Error uploading asset: ${res.statusCode}`);
        console.error(data);
      }
    });
  });
  
  assetReq.on('error', (error) => {
    console.error(`Error uploading asset: ${error.message}`);
  });
  
  assetReq.write(assetContent);
  assetReq.end();
}