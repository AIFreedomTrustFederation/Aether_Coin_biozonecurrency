/**
 * ChatGPT Conversation Extractor
 * 
 * Extracts conversations from ChatGPT's public sharing links.
 * Uses node-fetch to grab the HTML and extract content from conversations.
 * Processes the API response if available or falls back to HTML parsing.
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

/**
 * Extract a conversation from a ChatGPT sharing URL
 * 
 * @param {string} url - The ChatGPT sharing URL
 * @returns {Promise<object>} - The extracted conversation data
 */
export async function extractConversation(url) {
  console.log(`Extracting conversation from: ${url}`);
  
  try {
    // Extract shareable ID from the URL
    const shareableId = extractShareableId(url);
    if (!shareableId) {
      throw new Error('Invalid ChatGPT sharing URL. Could not extract ID.');
    }
    
    console.log(`Extracted shareable ID: ${shareableId}`);
    
    // First try to get conversation metadata via OpenAI's API
    try {
      const apiData = await fetchConversationFromApi(shareableId);
      
      // Generate a default title from the shareable ID if needed
      let title = `ChatGPT Conversation ${shareableId.substring(0, 8)}`;
      
      // If we have API data, use its title
      if (apiData && apiData.title) {
        title = apiData.title;
        console.log(`Successfully extracted title: ${title}`);
      }
      
      // Check if we got messages from the API
      if (apiData && apiData.messages && apiData.messages.length > 0) {
        console.log('Successfully extracted conversation data via API');
        
        return {
          url,
          title,
          messages: apiData.messages.map(msg => ({
            role: msg.author.role,
            content: msg.content.parts.join('\n')
          })),
          metadata: {
            source: 'chatgpt',
            extractedAt: new Date().toISOString(),
            messageCount: apiData.messages.length,
            extractionMethod: 'api'
          }
        };
      } else if (apiData) {
        // If we got API data but no messages, try to reconstruct conversation from annotations/content
        console.log('API returned metadata but no messages, attempting to reconstruct from any available data');
        
        const reconstructedMessages = [];
        
        // Add a system message
        reconstructedMessages.push({
          role: 'system',
          content: 'This conversation has been extracted from a ChatGPT sharing link.'
        });
        
        // If there's a description or summary in the API data, add it as a user message
        if (apiData.description || apiData.summary) {
          reconstructedMessages.push({
            role: 'user',
            content: `Topic: ${apiData.description || apiData.summary || title}`
          });
          
          // Add a placeholder assistant response
          reconstructedMessages.push({
            role: 'assistant',
            content: 'The full conversation content could not be extracted. This is a partial reconstruction based on available metadata.'
          });
        }
        
        // If reconstruction produced some messages, return them
        if (reconstructedMessages.length > 1) {
          console.log(`Created ${reconstructedMessages.length} reconstructed messages from metadata`);
          
          return {
            url,
            title,
            messages: reconstructedMessages,
            metadata: {
              source: 'chatgpt',
              extractedAt: new Date().toISOString(),
              messageCount: reconstructedMessages.length,
              extractionMethod: 'api_metadata_reconstruction',
              partialReconstruction: true
            }
          };
        }
      }
    } catch (apiError) {
      console.error('API extraction failed, falling back to HTML parsing:', apiError.message);
    }
    
    // Fallback to HTML parsing if API method fails
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Use JSDOM to parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract title
    let title = '';
    const titleElement = document.querySelector('title');
    if (titleElement) {
      title = titleElement.textContent.replace(' - ChatGPT', '').trim();
    }
    
    if (!title || title.includes('Chat with ChatGPT')) {
      title = `ChatGPT Conversation ${shareableId.substring(0, 8)}`;
    }
    
    // Try to extract any JSON data embedded in the page
    const extractedData = extractJsonFromHtml(html);
    if (extractedData && extractedData.messages && extractedData.messages.length > 0) {
      console.log('Successfully extracted conversation data from embedded JSON');
      
      return {
        url,
        title,
        messages: extractedData.messages,
        metadata: {
          source: 'chatgpt',
          extractedAt: new Date().toISOString(),
          messageCount: extractedData.messages.length,
          extractionMethod: 'embedded_json'
        }
      };
    }
    
    // If no JSON data, extract conversation from HTML structure
    const messages = extractMessagesFromHtml(document);
    
    if (messages.length === 0) {
      // If no messages found, provide a system message explaining the issue
      messages.push({
        role: 'system',
        content: 'The conversation could not be extracted. ChatGPT sharing links require JavaScript to render content, which is not available in this extraction method. Try opening the link in a browser.'
      });
    }
    
    return {
      url,
      title,
      messages,
      metadata: {
        source: 'chatgpt',
        extractedAt: new Date().toISOString(),
        messageCount: messages.length,
        extractionMethod: 'html_parsing'
      }
    };
  } catch (error) {
    console.error('Error extracting conversation:', error);
    // In case of error, return a basic structure with error info
    return {
      url,
      title: 'Extraction Failed',
      messages: [
        {
          role: 'system',
          content: `Failed to extract conversation: ${error.message}. Please check the URL and try again.`
        }
      ],
      metadata: {
        source: 'chatgpt',
        extractedAt: new Date().toISOString(),
        error: error.message,
        messageCount: 1
      }
    };
  }
}

/**
 * Extract the shareable ID from a ChatGPT sharing URL
 * 
 * @param {string} url - The ChatGPT sharing URL
 * @returns {string|null} - The extracted ID or null if not found
 */
function extractShareableId(url) {
  const regex = /\/share\/([a-zA-Z0-9-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Fetch conversation data directly from OpenAI's API
 * 
 * @param {string} shareableId - The shareable ID from the URL
 * @returns {Promise<object|null>} - The conversation data or null if not available
 */
async function fetchConversationFromApi(shareableId) {
  try {
    const apiUrl = `https://chat.openai.com/backend-api/share/${shareableId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`API request failed with status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from API:', error.message);
    return null;
  }
}

/**
 * Extract any JSON data with conversation content from HTML
 * 
 * @param {string} html - The HTML string
 * @returns {object|null} - Extracted data or null
 */
function extractJsonFromHtml(html) {
  try {
    // Look for JSON data in script tags - multiple patterns
    const scriptDataPatterns = [
      /<script[^>]*>(__NEXT_DATA__)\s*=\s*({.*?})<\/script>/s,
      /<script[^>]*>(window\.__INITIAL_STATE__)\s*=\s*({.*?})<\/script>/s,
      /<script[^>]*>(window\.__PRELOADED_STATE__)\s*=\s*({.*?})<\/script>/s,
      /<script[^>]*type="application\/json"[^>]*>(.*?)<\/script>/s,
      /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
    ];
    
    // Try each pattern
    for (const pattern of scriptDataPatterns) {
      const match = html.match(pattern);
      if (match && (match[2] || match[1])) {
        try {
          const jsonData = JSON.parse(match[2] || match[1]);
          
          // Extract messages from various structures
          let messages = extractMessagesFromStructure(jsonData);
          if (messages && messages.length > 0) {
            return { messages };
          }
        } catch (e) {
          console.log(`Failed to parse JSON from pattern ${pattern}:`, e.message);
        }
      }
    }
    
    // Look for any JSON object in the HTML that contains conversation data
    // This is a more aggressive approach to find embedded JSON
    const potentialJsonBlocks = html.match(/{[^{}]*{[^{}]*}[^{}]*}/g) || [];
    for (const block of potentialJsonBlocks) {
      if (block.includes('"role"') || block.includes('"messages"') || block.includes('"content"')) {
        try {
          const jsonData = JSON.parse(block);
          let messages = extractMessagesFromStructure(jsonData);
          if (messages && messages.length > 0) {
            return { messages };
          }
        } catch (e) {
          // Silently continue on parsing errors
        }
      }
    }
    
    // Deep scan for conversation data using regex patterns
    const conversationPatterns = [
      /\bconversation\s*[:=]\s*({[\s\S]*?})[,;]/,
      /\bmessages\s*[:=]\s*(\[[\s\S]*?\])[,;]/,
      /"messages"\s*:\s*(\[[\s\S]*?\])/
    ];
    
    for (const pattern of conversationPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          // Check if we have an array of messages directly
          if (match[1].startsWith('[')) {
            const messagesArray = JSON.parse(match[1]);
            if (Array.isArray(messagesArray) && messagesArray.length > 0) {
              const messages = messagesArray.map(msg => ({
                role: msg.role || msg.author?.role || 'unknown',
                content: msg.content || msg.parts?.join('\n') || msg.text || ''
              }));
              return { messages };
            }
          } else {
            // Or a conversation object containing messages
            const conversationData = JSON.parse(match[1]);
            let messages = extractMessagesFromStructure(conversationData);
            if (messages && messages.length > 0) {
              return { messages };
            }
          }
        } catch (e) {
          console.log(`Failed to parse conversation data from pattern:`, e.message);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting JSON from HTML:', error.message);
    return null;
  }
}

/**
 * Helper function to extract messages from various JSON structures
 * 
 * @param {object} data - JSON data structure
 * @returns {Array|null} - Array of message objects or null
 */
function extractMessagesFromStructure(data) {
  // Direct messages array
  if (data.messages && Array.isArray(data.messages)) {
    return data.messages.map(msg => ({
      role: msg.role || msg.author?.role || 'unknown',
      content: msg.content?.parts?.join('\n') || msg.content || msg.text || ''
    }));
  }
  
  // Next.js data structure
  if (data.props?.pageProps?.conversation?.messages) {
    return data.props.pageProps.conversation.messages.map(msg => ({
      role: msg.author?.role || 'unknown',
      content: msg.content?.parts?.join('\n') || msg.content || ''
    }));
  }
  
  // Mapping structure (common in newer formats)
  if (data.conversation?.mapping) {
    const mapping = data.conversation.mapping;
    return Object.values(mapping)
      .filter(node => node.message)
      .map(node => ({
        role: node.message.author?.role || 'unknown',
        content: node.message.content?.parts?.join('\n') || node.message.content || ''
      }));
  }
  
  // Alternative structures
  if (data.data?.messages) {
    return data.data.messages.map(msg => ({
      role: msg.role || msg.author?.role || 'unknown',
      content: msg.content || msg.text || ''
    }));
  }
  
  if (data.body?.messages) {
    return data.body.messages.map(msg => ({
      role: msg.role || msg.author?.role || 'unknown',
      content: msg.content || msg.text || ''
    }));
  }
  
  if (data.response?.data?.messages) {
    return data.response.data.messages.map(msg => ({
      role: msg.role || msg.author?.role || 'unknown',
      content: msg.content || msg.text || ''
    }));
  }
  
  // Recursive search for messages structure
  const deepSearch = (obj, depth = 0) => {
    if (depth > 5) return null; // Limit recursion depth
    
    if (obj.messages && Array.isArray(obj.messages) && obj.messages.length > 0 && 
        (obj.messages[0].role || obj.messages[0].author)) {
      return obj.messages.map(msg => ({
        role: msg.role || msg.author?.role || 'unknown',
        content: msg.content?.parts?.join('\n') || msg.content || msg.text || ''
      }));
    }
    
    // Recursively search object properties
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const result = deepSearch(obj[key], depth + 1);
          if (result) return result;
        }
      }
    }
    
    return null;
  };
  
  return deepSearch(data);
}

/**
 * Extract messages from the HTML structure
 * 
 * @param {Document} document - The DOM document
 * @returns {Array} - Array of message objects
 */
function extractMessagesFromHtml(document) {
  const messages = [];
  
  // Try different selectors for message containers
  const possibleContainers = [
    '.message', // Common class for message containers
    '.w-full.border-b', // ChatGPT specific class
    '.group', // Another common class
    '.prose', // Content class
    'main > div > div > div' // Generic structure
  ];
  
  let messageElements = [];
  
  // Try each selector until we find message elements
  for (const selector of possibleContainers) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 1) { // We need at least a couple messages
      messageElements = Array.from(elements);
      break;
    }
  }
  
  // Process the message elements
  let currentRole = 'user'; // Start with user, then alternate
  
  messageElements.forEach(element => {
    let role = 'unknown';
    let content = '';
    
    // Check for role indicators
    const html = element.innerHTML.toLowerCase();
    if (html.includes('user') || html.includes('human')) {
      role = 'user';
    } else if (html.includes('assistant') || html.includes('chatgpt') || html.includes('gpt')) {
      role = 'assistant';
    } else {
      // Alternate roles if we can't determine
      role = currentRole === 'user' ? 'assistant' : 'user';
    }
    
    // Update current role for next iteration
    currentRole = role;
    
    // Extract content - try different selectors
    const contentSelectors = ['.prose', '.markdown', 'p', 'div > div'];
    for (const selector of contentSelectors) {
      const contentElement = element.querySelector(selector);
      if (contentElement && contentElement.textContent.trim()) {
        content = contentElement.textContent.trim();
        break;
      }
    }
    
    // If no content found via selectors, use the element's own text
    if (!content) {
      content = element.textContent.trim();
    }
    
    // Only add if we have content
    if (content) {
      messages.push({ role, content });
    }
  });
  
  // If we couldn't extract messages but page has content, create a generic conversation
  if (messages.length === 0) {
    const bodyText = document.body.textContent.trim();
    if (bodyText.length > 100) {
      const paragraphs = document.querySelectorAll('p');
      
      // Create alternating user/assistant messages from paragraphs
      let msgRole = 'user';
      
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.length > 20) {
          messages.push({
            role: msgRole,
            content: text
          });
          msgRole = msgRole === 'user' ? 'assistant' : 'user';
        }
      });
    }
  }
  
  // Add system message if we have messages
  if (messages.length > 0) {
    messages.unshift({
      role: 'system',
      content: 'This conversation has been extracted from a ChatGPT sharing link.'
    });
  }
  
  return messages;
}

/**
 * Convert a conversation object to a scroll format for storage
 * 
 * @param {object} conversation - The extracted conversation
 * @param {string} userId - Optional user ID to associate with the scroll
 * @returns {object} - The scroll object ready for storage
 */
export function conversationToScroll(conversation, userId = null) {
  // Generate a content string from the messages
  let content = '';
  if (conversation.messages && conversation.messages.length > 0) {
    content = conversation.messages.map(msg => {
      const role = msg.role === 'assistant' ? 'ChatGPT' : 
                  msg.role === 'user' ? 'You' : 'System';
      
      return `### ${role}\n${msg.content}\n\n`;
    }).join('');
  }
  
  return {
    title: conversation.title,
    content,
    messages: conversation.messages,
    userId,
    metadata: {
      ...conversation.metadata,
      originalUrl: conversation.url
    },
    createdAt: new Date().toISOString()
  };
}

export default {
  extractConversation,
  conversationToScroll
};