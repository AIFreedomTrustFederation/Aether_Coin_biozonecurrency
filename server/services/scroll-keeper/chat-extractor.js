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
    if (!url.includes('chat.openai.com/share/') && !url.includes('chatgpt.com/share/')) {
      throw new Error('Invalid ChatGPT share URL format. Expected format: https://chat.openai.com/share/[id] or https://chatgpt.com/share/[id]');
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
    
    // Extract messages using different selectors depending on the page structure
    const messages = [];
    
    // Try the standard selector first
    let messageElements = document.querySelectorAll('[data-message-author-role]');
    
    console.log(`Found ${messageElements.length} message elements with data-message-author-role`);
    
    // If no messages found, try alternate selectors
    if (messageElements.length === 0) {
      // Try to find message containers (may vary depending on ChatGPT's HTML structure)
      messageElements = document.querySelectorAll('.conversation-turn');
      console.log(`Found ${messageElements.length} message elements with .conversation-turn`);
      
      if (messageElements.length === 0) {
        messageElements = document.querySelectorAll('.message');
        console.log(`Found ${messageElements.length} message elements with .message`);
      }
    }
    
    // Log document structure for debugging
    console.log('Document structure:', {
      title: document.title,
      bodyChildCount: document.body?.childElementCount || 0,
      hasConversationContainer: !!document.querySelector('.conversation-container'),
      hasMarkdown: !!document.querySelector('.markdown')
    });
    
    // Process the message elements
    messageElements.forEach((element, index) => {
      try {
        // Try to determine the role (user or assistant)
        let role = element.getAttribute('data-message-author-role');
        
        if (!role) {
          // Try alternate methods to determine role
          const isUser = element.classList.contains('user') || 
                        element.querySelector('.user') || 
                        element.querySelector('.from-user');
                        
          const isAssistant = element.classList.contains('assistant') || 
                            element.querySelector('.assistant') || 
                            element.querySelector('.from-assistant');
          
          role = isUser ? 'user' : (isAssistant ? 'assistant' : (index % 2 === 0 ? 'user' : 'assistant'));
        }
        
        // Try to find content element with various selectors
        let contentElement = element.querySelector('.markdown');
        
        if (!contentElement) {
          contentElement = element.querySelector('.message-content') || 
                          element.querySelector('.content') ||
                          element; // Fallback to the element itself
        }
        
        if (contentElement) {
          // Get text content with proper formatting
          const content = contentElement.innerHTML || contentElement.textContent;
          
          if (content && content.trim()) {
            messages.push({
              role,
              content
            });
          }
        }
      } catch (error) {
        console.error(`Error processing message element ${index}:`, error);
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
    
    // If no messages were extracted, create a fallback message explaining the issue
    if (messages.length === 0) {
      console.log('No messages extracted, creating fallback content');
      
      // Add fallback messages to indicate extraction issues
      messages.push({
        role: 'system',
        content: `<div class="error-message">
          <p><strong>Limited Extraction Notice:</strong></p>
          <p>The conversation content could not be fully extracted because ChatGPT's shared conversations use dynamic JavaScript rendering which our server-side HTML parser cannot process.</p>
          <p>We've successfully saved the conversation link and basic information. You can view the original conversation at: <a href="${url}" target="_blank">${url}</a></p>
        </div>`
      });
      
      // If we have a title, we can still provide some context
      if (title && title !== "ChatGPT Conversation") {
        messages.push({
          role: 'assistant',
          content: `<div>This appears to be a conversation about: <strong>${title}</strong></div>`
        });
      }
    }
    
    return conversation;
  } catch (error) {
    console.error('Error extracting conversation:', error);
    
    // Instead of failing completely, return a minimal conversation object
    // This allows the system to still create a scroll with error information
    return {
      title: "Extraction Error - ChatGPT Conversation",
      url,
      extractedAt: new Date().toISOString(),
      summary: "There was an error extracting this conversation. The link may be invalid or the page structure unsupported.",
      messageCount: 1,
      messages: [{
        role: 'system',
        content: `<div class="error-message">Failed to extract the conversation: ${error.message}</div><div>URL attempted: ${url}</div>`
      }]
    };
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