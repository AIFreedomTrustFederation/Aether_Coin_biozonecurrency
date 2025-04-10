/**
 * Matrix Notification Script for Aetherion Wallet Deployments
 * 
 * This script sends deployment notifications to a Matrix room.
 * It utilizes the matrix-js-sdk to connect to a Matrix server and send messages.
 * 
 * Usage:
 * node matrix-notify.js <status> <environment> <runId> <repoName>
 * 
 * Example:
 * node matrix-notify.js success production 12345678 aifreedomtrust/aetherion-wallet
 */

const sdk = require("matrix-js-sdk");
require('dotenv').config();

// Configuration
const MATRIX_SERVER_URL = process.env.MATRIX_SERVER_URL || 'https://matrix.org';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_USER_ID = process.env.MATRIX_USER_ID;
const MATRIX_ROOM_ID = process.env.MATRIX_DEPLOYMENT_ROOM_ID;

// Validate required environment variables
if (!MATRIX_ACCESS_TOKEN || !MATRIX_USER_ID || !MATRIX_ROOM_ID) {
  console.error('Error: Missing required Matrix environment variables.');
  console.error('Please set MATRIX_ACCESS_TOKEN, MATRIX_USER_ID, and MATRIX_DEPLOYMENT_ROOM_ID.');
  process.exit(1);
}

/**
 * Send a notification to a Matrix room
 */
async function sendMatrixNotification(message, roomId) {
  console.log('Connecting to Matrix server...');
  
  const client = sdk.createClient({
    baseUrl: MATRIX_SERVER_URL,
    accessToken: MATRIX_ACCESS_TOKEN,
    userId: MATRIX_USER_ID
  });
  
  try {
    await client.startClient({ initialSyncLimit: 0 });
    
    // Wait for client to initialize
    await new Promise(resolve => {
      client.once('sync', (state) => {
        if (state === 'PREPARED') {
          resolve();
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        resolve();
        console.log('Matrix client sync timeout, proceeding anyway...');
      }, 30000);
    });
    
    console.log(`Sending notification to room ${roomId}...`);
    await client.sendHtmlMessage(roomId, message, message);
    console.log('Matrix notification sent successfully!');
    
  } catch (error) {
    console.error('Error sending Matrix notification:', error.message);
    throw error;
  } finally {
    // Stop the client
    client.stopClient();
  }
}

/**
 * Format HTML message for Matrix
 */
function formatMessage(status, environment, runId, repoName) {
  const isSuccess = status === 'success';
  const emoji = isSuccess ? '✅' : '❌';
  const color = isSuccess ? 'green' : 'red';
  const statusText = isSuccess ? 'Successful' : 'Failed';
  const timestamp = new Date().toISOString();
  
  return `<h4>${emoji} Aetherion Wallet Deployment ${statusText}</h4>
<p>Environment: <strong>${environment}</strong></p>
<p>Status: <span style="color:${color}">${status}</span></p>
<p>Timestamp: ${timestamp}</p>
<p>Repository: ${repoName}</p>
<p><a href="https://github.com/${repoName}/actions/runs/${runId}">View logs</a></p>`;
}

/**
 * Main function
 */
async function main() {
  // Get command line arguments
  const status = process.argv[2] || 'unknown';
  const environment = process.argv[3] || 'production';
  const runId = process.argv[4] || 'unknown';
  const repoName = process.argv[5] || 'aifreedomtrust/aetherion-wallet';
  
  // Format the message
  const message = formatMessage(status, environment, runId, repoName);
  
  try {
    // Send the notification
    await sendMatrixNotification(message, MATRIX_ROOM_ID);
    process.exit(0);
  } catch (error) {
    console.error('Failed to send Matrix notification:', error);
    process.exit(1);
  }
}

// Run the main function
main();