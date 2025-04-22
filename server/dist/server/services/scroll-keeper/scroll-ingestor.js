"use strict";
/**
 * Scroll Keeper Scroll Ingestor
 *
 * Extracts content from URLs and converts it to scrolls
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processScrollFromUrl = processScrollFromUrl;
const storage_1 = require("../../storage");
const puppeteer_1 = __importDefault(require("puppeteer"));
const jsdom_1 = require("jsdom");
/**
 * Process a URL to extract its content and create a scroll
 */
async function processScrollFromUrl(url, userId) {
    try {
        console.log(`Processing URL for scroll: ${url}`);
        // Extract content from the URL
        const { title, content, originalContent } = await extractContentFromUrl(url);
        if (!content) {
            throw new Error('Failed to extract content from URL');
        }
        // Create a new scroll
        const scroll = {
            title: title || 'Untitled Scroll',
            content,
            originalUrl: url,
            originalContent,
            userId
        };
        const newScroll = await storage_1.storage.createScroll(scroll);
        // Queue embedding generation
        await storage_1.storage.createProcessingQueueItem({
            taskType: 'embedding_generation',
            payload: { scrollId: newScroll.id, text: content },
            priority: 5
        });
        return newScroll.id;
    }
    catch (error) {
        console.error('Error processing URL for scroll:', error);
        return null;
    }
}
/**
 * Extract content from a URL using either Puppeteer or JSDOM
 */
async function extractContentFromUrl(url) {
    // Try with Puppeteer first for dynamic content
    try {
        return await extractWithPuppeteer(url);
    }
    catch (puppeteerError) {
        console.warn('Puppeteer extraction failed, falling back to JSDOM:', puppeteerError);
        // Fall back to JSDOM for static content
        try {
            return await extractWithJSDOM(url);
        }
        catch (jsdomError) {
            console.error('JSDOM extraction failed:', jsdomError);
            throw new Error('Failed to extract content with both Puppeteer and JSDOM');
        }
    }
}
/**
 * Extract content from a URL using Puppeteer (for dynamic content)
 */
async function extractWithPuppeteer(url) {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        // Get the page title
        const title = await page.title();
        // Get the page content
        const originalContent = await page.content();
        // Extract text content
        const content = await page.evaluate(() => {
            // Define elements to exclude
            const excludeSelectors = [
                'nav', 'header', 'footer', 'script', 'style', 'noscript', 'iframe',
                'svg', 'path', 'button', '[role="navigation"]', '[role="banner"]',
                '[role="contentinfo"]', 'aside', '.sidebar', '.nav', '.menu',
                '.advertisement', '.ads', '.ad-container'
            ];
            // Remove excluded elements temporarily for text extraction
            const excludedElements = [];
            excludeSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    excludedElements.push(el);
                    el.remove();
                });
            });
            // Get main content elements
            const contentSelectors = [
                'article', 'main', '[role="main"]', '.content', '.post', '.entry',
                '#content', '.article', '.post-content'
            ];
            let mainContent = '';
            let foundMainContent = false;
            // Try to find main content first
            for (const selector of contentSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    elements.forEach(el => {
                        mainContent += el.textContent + '\n\n';
                    });
                    foundMainContent = true;
                    break;
                }
            }
            // If no main content found, use body
            if (!foundMainContent) {
                mainContent = document.body.textContent || '';
            }
            // Clean up the text
            return mainContent
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();
        });
        return {
            title,
            content,
            originalContent
        };
    }
    finally {
        await browser.close();
    }
}
/**
 * Extract content from a URL using JSDOM (for static content)
 */
async function extractWithJSDOM(url) {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new jsdom_1.JSDOM(html);
    const document = dom.window.document;
    // Get the page title
    const title = document.querySelector('title')?.textContent || 'Untitled';
    // Define elements to exclude
    const excludeSelectors = [
        'nav', 'header', 'footer', 'script', 'style', 'noscript', 'iframe',
        'svg', 'path', 'button', '[role="navigation"]', '[role="banner"]',
        '[role="contentinfo"]', 'aside', '.sidebar', '.nav', '.menu',
        '.advertisement', '.ads', '.ad-container'
    ];
    // Remove excluded elements temporarily for text extraction
    excludeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.parentNode?.removeChild(el);
        });
    });
    // Get main content elements
    const contentSelectors = [
        'article', 'main', '[role="main"]', '.content', '.post', '.entry',
        '#content', '.article', '.post-content'
    ];
    let mainContent = '';
    let foundMainContent = false;
    // Try to find main content first
    for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(el => {
                mainContent += el.textContent + '\n\n';
            });
            foundMainContent = true;
            break;
        }
    }
    // If no main content found, use body
    if (!foundMainContent) {
        mainContent = document.body.textContent || '';
    }
    // Clean up the text
    const content = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    return {
        title,
        content,
        originalContent: html
    };
}
