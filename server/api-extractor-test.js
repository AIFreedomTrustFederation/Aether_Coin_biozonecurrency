/**
 * Direct API Extractor Test
 * Test script to attempt direct extraction from ChatGPT's API
 */

import fetch from 'node-fetch';

const TARGET_URL = 'https://chatgpt.com/share/6807d925-01a4-8006-8b51-5688f96750b0';

// Extract shareable ID from URL
function extractShareableId(url) {
  const regex = /\/share\/([a-zA-Z0-9-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Try the OpenAI backend API directly
async function testBackendApi() {
  const shareableId = extractShareableId(TARGET_URL);
  if (!shareableId) {
    console.error('Invalid URL format, could not extract shareable ID');
    return;
  }
  
  console.log(`Testing API extraction for ID: ${shareableId}`);
  
  try {
    // Try the main backend API endpoint
    const apiUrl = `https://chat.openai.com/backend-api/share/${shareableId}`;
    
    console.log(`Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`API request failed with status: ${response.status}`);
      console.log('Response headers:', response.headers.raw());
      
      // Try to read any error message
      const errorText = await response.text();
      console.log('Error response:', errorText.substring(0, 500));
      
      return;
    }
    
    // Successfully got a response
    const data = await response.json();
    console.log('Successfully retrieved data:');
    console.log('Title:', data.title);
    console.log('Create time:', data.create_time);
    console.log('Update time:', data.update_time);
    
    if (data.messages && data.messages.length > 0) {
      console.log(`Found ${data.messages.length} messages`);
      
      // Print first few messages
      data.messages.slice(0, 3).forEach((msg, i) => {
        console.log(`\nMessage ${i+1}:`);
        console.log('Role:', msg.author?.role);
        console.log('Content:', msg.content?.parts?.[0]?.substring(0, 100) + '...');
      });
    } else {
      console.log('No messages found in the response');
    }
  } catch (error) {
    console.error('Error testing API extraction:', error);
  }
}

// Try the share interface
async function testShareInterface() {
  try {
    console.log(`Fetching HTML from: ${TARGET_URL}`);
    
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Request failed with status: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    console.log(`Received ${html.length} bytes of HTML`);
    
    // Look for JSON data
    const scriptRegex = /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s;
    const match = html.match(scriptRegex);
    
    if (match && match[1]) {
      console.log('Found __NEXT_DATA__ script tag with content');
      
      try {
        const jsonData = JSON.parse(match[1]);
        console.log('Successfully parsed JSON data');
        
        // Check for conversation data
        if (jsonData.props?.pageProps?.conversation) {
          const conversation = jsonData.props.pageProps.conversation;
          console.log('Found conversation data:');
          console.log('Title:', conversation.title);
          
          if (conversation.messages && conversation.messages.length > 0) {
            console.log(`Found ${conversation.messages.length} messages`);
            
            // Print first few messages
            conversation.messages.slice(0, 3).forEach((msg, i) => {
              console.log(`\nMessage ${i+1}:`);
              console.log('Role:', msg.author?.role);
              console.log('Content:', msg.content?.parts?.[0]?.substring(0, 100) + '...');
            });
          } else {
            console.log('No messages found in the conversation data');
          }
        } else {
          console.log('No conversation data found in the JSON');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    } else {
      console.log('Could not find __NEXT_DATA__ script tag');
      
      // Search for any script tags
      const scriptCount = (html.match(/<script/g) || []).length;
      console.log(`Found ${scriptCount} script tags in total`);
    }
  } catch (error) {
    console.error('Error testing share interface:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('=== Testing ChatGPT API Extraction ===');
  console.log('Target URL:', TARGET_URL);
  
  console.log('\n--- 1. Backend API Test ---');
  await testBackendApi();
  
  console.log('\n--- 2. Share Interface Test ---');
  await testShareInterface();
  
  console.log('\n=== Testing Complete ===');
}

runTests();