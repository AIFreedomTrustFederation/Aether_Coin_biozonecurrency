/**
 * Test script for ChatGPT extraction
 */

import { extractConversation, conversationToScroll } from './server/services/scroll-keeper/chat-extractor.js';

// Test URL - the one provided by the user
const TEST_URL = 'https://chatgpt.com/share/6807d925-01a4-8006-8b51-5688f96750b0';

async function testExtraction() {
  console.log(`Testing extraction with URL: ${TEST_URL}`);
  
  try {
    // Extract the conversation
    const conversation = await extractConversation(TEST_URL);
    console.log('Extraction complete:');
    console.log('Title:', conversation.title);
    console.log('Message count:', conversation.metadata.messageCount);
    
    // Convert to scroll format
    const scroll = conversationToScroll(conversation);
    console.log('Scroll conversion complete');
    
    // Print the first 500 characters of content
    if (scroll.content) {
      console.log('Preview of content:', scroll.content.substring(0, 500) + '...');
    }
    
    // Print the roles of all messages
    if (conversation.messages && conversation.messages.length > 0) {
      console.log('Message roles:');
      conversation.messages.forEach((msg, i) => {
        console.log(`  Message ${i+1}: ${msg.role} (${msg.content.length} characters)`);
      });
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testExtraction();