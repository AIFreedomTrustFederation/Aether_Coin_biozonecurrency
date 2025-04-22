/**
 * ChatGPT Conversation Extractor
 * 
 * Extracts conversation data from a public ChatGPT conversation link
 * and converts it into a format suitable for the Scroll Keeper.
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

/**
 * Extract conversation from a ChatGPT public link
 * 
 * @param {string} url - The public ChatGPT conversation URL
 * @returns {Promise<Object>} - The extracted conversation data
 */
export async function extractConversation(url) {
  try {
    console.log(`Extracting conversation from: ${url}`);
    
    // Validate URL format
    if (!url.includes('chat.openai.com/share/')) {
      throw new Error('Invalid ChatGPT share URL format. Expected format: https://chat.openai.com/share/[id]');
    }
    
    // Fetch the conversation HTML
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse HTML content
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract title
    let title = "ChatGPT Conversation";
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.textContent) {
      // Remove "- ChatGPT" from the title
      title = titleElement.textContent.replace('- ChatGPT', '').trim();
    }
    
    // Extract messages
    const messages = [];
    const messageElements = document.querySelectorAll('[data-message-author-role]');
    
    messageElements.forEach((element) => {
      const role = element.getAttribute('data-message-author-role');
      const contentElement = element.querySelector('.markdown');
      
      if (contentElement) {
        // Get text content with proper formatting
        const content = contentElement.innerHTML;
        
        messages.push({
          role,
          content
        });
      }
    });
    
    // Generate a summary using the first few messages
    const summaryContent = messages.slice(0, 3).map(msg => {
      // Strip HTML and truncate
      const plainText = msg.content.replace(/<[^>]*>/g, '');
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    }).join(' ');
    
    // Create conversation object
    const conversation = {
      title,
      url,
      extractedAt: new Date().toISOString(),
      summary: summaryContent.substring(0, 200) + (summaryContent.length > 200 ? '...' : ''),
      messageCount: messages.length,
      messages
    };
    
    return conversation;
  } catch (error) {
    console.error('Error extracting conversation:', error);
    throw error;
  }
}

/**
 * Convert a ChatGPT conversation to a Scroll Keeper scroll
 * 
 * @param {Object} conversation - The conversation data
 * @param {string} userId - Optional user ID to associate with the scroll
 * @returns {Object} - The scroll object
 */
export function conversationToScroll(conversation, userId = null) {
  // Format messages as markdown
  const formattedMessages = conversation.messages.map(msg => {
    const role = msg.role === 'assistant' ? 'ChatGPT' : 'You';
    return `### ${role}\n\n${msg.content}\n\n`;
  }).join('---\n\n');
  
  // Create scroll content
  const content = `# ${conversation.title}\n\n` +
    `*Extracted from ChatGPT on ${new Date(conversation.extractedAt).toLocaleString()}*\n\n` +
    `Original URL: ${conversation.url}\n\n` +
    `## Conversation\n\n` +
    formattedMessages;
  
  return {
    title: conversation.title,
    content,
    userId,
    metadata: {
      source: 'chatgpt',
      url: conversation.url,
      messageCount: conversation.messageCount,
      extractedAt: conversation.extractedAt
    }
  };
}