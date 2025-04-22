/**
 * ChatGPT Conversation Extractor
 * 
 * Extracts conversation data from a public ChatGPT conversation link
 * and converts it into a format suitable for the Scroll Keeper.
 * Uses Puppeteer for full JavaScript rendering support.
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';

/**
 * Extract conversation from a ChatGPT public link
 * 
 * @param {string} url - The public ChatGPT conversation URL
 * @returns {Promise<Object>} - The extracted conversation data
 */
export async function extractConversation(url) {
  console.log(`Extracting conversation from: ${url}`);
  
  try {
    // Validate URL format
    if (!url.includes('chat.openai.com/share/') && !url.includes('chatgpt.com/share/')) {
      throw new Error('Invalid ChatGPT share URL format. Expected format: https://chat.openai.com/share/[id] or https://chatgpt.com/share/[id]');
    }
    
    // First try to extract title from basic HTML fetch (faster)
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract title
    let title = "ChatGPT Conversation";
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.textContent) {
      // Remove "- ChatGPT" from the title
      title = titleElement.textContent.replace('- ChatGPT', '').trim();
    }
    
    console.log('Title extracted:', title);
    console.log('Now launching Puppeteer for full content extraction...');
    
    // Set a timeout for the Puppeteer extraction
    let browserClosed = false;
    let browser = null;
    
    try {
      // Use Puppeteer for full JavaScript rendering with optimized performance settings
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        defaultViewport: { width: 1280, height: 1024 }
      });
      
      // Create a timeout to automatically close the browser after 20 seconds
      const browserTimeoutId = setTimeout(() => {
        console.log('Browser extraction timed out, closing browser...');
        if (browser && !browserClosed) {
          browser.close().catch(e => console.error('Error closing browser on timeout:', e));
          browserClosed = true;
        }
      }, 20000);
      
      const page = await browser.newPage();
      
      // Set a reasonable timeout
      await page.setDefaultNavigationTimeout(15000);
      
      // Navigate to the page
      console.log('Navigating to URL...');
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Page loaded, extracting conversation...');
      
      // Get updated title from the loaded page (if available)
      const pageTitle = await page.title();
      if (pageTitle) {
        title = pageTitle.replace('- ChatGPT', '').trim();
      }
      
      // Extract messages using Puppeteer
      const messages = await page.evaluate(() => {
        const extractedMessages = [];
        
        // Try different selectors that might identify message blocks
        const selectors = [
          '[data-message-author-role]',
          '.conversation-turn',
          '.message',
          '.prose',
          'div[data-testid^="conversation-turn-"]'
        ];
        
        let messageElements = [];
        
        // Try each selector until we find elements
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            messageElements = Array.from(elements);
            console.log(`Found ${elements.length} messages with selector: ${selector}`);
            break;
          }
        }
        
        // Process the message elements
        if (messageElements.length > 0) {
          messageElements.forEach((element, index) => {
            // Try to determine the role (user or assistant)
            let role = element.getAttribute('data-message-author-role');
            
            if (!role) {
              // Simple alternating pattern if roles can't be determined
              role = index % 2 === 0 ? 'user' : 'assistant';
            }
            
            // Get content
            const content = element.innerHTML || element.textContent;
            
            if (content && content.trim()) {
              extractedMessages.push({
                role,
                content: content.trim()
              });
            }
          });
        } else {
          // Fallback to looking for paragraphs
          const paragraphs = document.querySelectorAll('p');
          if (paragraphs.length > 0) {
            // Just create some basic alternating messages
            let isUser = true;
            let currentMessage = '';
            
            paragraphs.forEach((p, i) => {
              if (i > 0 && i % 3 === 0) { // Group paragraphs in chunks of 3
                if (currentMessage.trim()) {
                  extractedMessages.push({
                    role: isUser ? 'user' : 'assistant',
                    content: currentMessage
                  });
                  isUser = !isUser;
                  currentMessage = p.outerHTML;
                }
              } else {
                currentMessage += p.outerHTML;
              }
            });
            
            // Add the last message if there is one
            if (currentMessage.trim()) {
              extractedMessages.push({
                role: isUser ? 'user' : 'assistant',
                content: currentMessage
              });
            }
          }
        }
        
        return extractedMessages;
      });
      
      // Clear the browser timeout since we're done
      clearTimeout(browserTimeoutId);
      
      // Close the browser
      if (browser && !browserClosed) {
        await browser.close();
        browserClosed = true;
        console.log('Puppeteer browser closed');
      }
      
      console.log(`Puppeteer extracted ${messages.length} messages`);
      
      // Generate a summary
      const summaryText = messages.length > 0 
        ? messages.slice(0, 2).map(m => m.content.replace(/<[^>]*>/g, '').substring(0, 100)).join(' ') 
        : "No message content extracted";
      
      // Create conversation object
      const conversation = {
        title,
        url,
        extractedAt: new Date().toISOString(),
        summary: summaryText.substring(0, 200) + (summaryText.length > 200 ? '...' : ''),
        messageCount: messages.length,
        messages
      };
      
      // If no messages were extracted, add fallback content
      if (messages.length === 0) {
        console.log('No messages extracted with Puppeteer, creating fallback content');
        
        conversation.messages.push({
          role: 'system',
          content: `<div class="error-message">
            <p><strong>Extraction Limitation:</strong></p>
            <p>We attempted to extract the conversation content using browser rendering, but were unable to identify the message structure on this page.</p>
            <p>We've saved the link for reference. You can view the original conversation at: <a href="${url}" target="_blank">${url}</a></p>
          </div>`
        });
        
        if (title && title !== "ChatGPT Conversation") {
          conversation.messages.push({
            role: 'assistant',
            content: `<div>This appears to be a conversation about: <strong>${title}</strong></div>`
          });
        }
        
        conversation.messageCount = conversation.messages.length;
      }
      
      return conversation;
      
    } catch (puppeteerError) {
      console.error('Puppeteer extraction error:', puppeteerError);
      
      // Close the browser if it's still open
      if (browser && !browserClosed) {
        try {
          await browser.close();
          console.log('Puppeteer browser closed after error');
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }
      
      // Return a basic conversation with just the title we already extracted
      return {
        title,
        url,
        extractedAt: new Date().toISOString(),
        summary: `Failed to extract complete content: ${puppeteerError.message}`,
        messageCount: 2,
        messages: [
          {
            role: 'system',
            content: `<div class="error-message">
              <p><strong>Extraction Error:</strong></p>
              <p>We encountered an error while trying to extract the full conversation content: ${puppeteerError.message}</p>
              <p>We've saved the link for reference. You can view the original conversation at: <a href="${url}" target="_blank">${url}</a></p>
            </div>`
          },
          {
            role: 'assistant',
            content: `<div>This appears to be a conversation about: <strong>${title}</strong></div>`
          }
        ]
      };
    }
    
  } catch (error) {
    console.error('Error extracting conversation:', error);
    
    // Return a minimal error conversation
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