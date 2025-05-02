/**
 * OpenAI Integration Service for AI Freedom Trust Brand Showcase
 * This service provides AI-powered features using the OpenAI API
 */

import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate enhanced brand description using OpenAI
 * @param {Object} brand - Brand object with basic information
 * @returns {Promise<string>} - Enhanced description
 */
export async function generateEnhancedDescription(brand) {
  try {
    const prompt = `
      Generate an enhanced marketing description for a technology brand called "${brand.name}".
      The brand specializes in: ${brand.technologies.join(', ')}.
      Their core offering is: "${brand.description}"
      Some of their key features include: ${brand.features.join(', ')}.
      
      Write a compelling, professional 2-paragraph description that highlights their unique value proposition
      and positions them as a leader in their field. Focus on business benefits and innovative aspects.
      Keep the tone professional and avoid hyperbole.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a skilled technology marketing copywriter specializing in B2B SaaS products." },
        { role: "user", content: prompt }
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating enhanced description:", error);
    throw new Error("Unable to generate enhanced description. Please try again later.");
  }
}

/**
 * Analyze technology trends relevant to a specific brand
 * @param {Object} brand - Brand object with technologies array
 * @returns {Promise<Array>} - Array of trend objects with title and description
 */
export async function analyzeTechnologyTrends(brand) {
  try {
    const prompt = `
      Analyze current technology trends related to: ${brand.technologies.join(', ')}.
      Focus on how these trends relate to: "${brand.description}"
      
      Provide 3 specific trends that would be relevant to ${brand.name}'s business.
      
      Format the response as a JSON array with objects containing:
      - title: The name of the trend
      - description: A brief explanation of the trend and its relevance
      
      Keep each description under 100 words and focus on business impact.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a technology analyst specializing in identifying meaningful business trends." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.5,
    });

    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    return result.trends || [];
  } catch (error) {
    console.error("Error analyzing technology trends:", error);
    throw new Error("Unable to analyze technology trends. Please try again later.");
  }
}

/**
 * Generate feature recommendations for a brand
 * @param {Object} brand - Brand object
 * @returns {Promise<Array>} - Array of feature recommendation objects
 */
export async function generateFeatureRecommendations(brand) {
  try {
    const prompt = `
      Based on the following brand information:
      - Name: ${brand.name}
      - Description: ${brand.description}
      - Current features: ${brand.features.join(', ')}
      - Technologies: ${brand.technologies.join(', ')}
      
      Recommend 3 innovative new features or capabilities that could enhance their product offering.
      
      Format your response as a JSON array where each object contains:
      - name: A concise name for the feature (5 words or less)
      - description: A brief explanation of what the feature does (30-50 words)
      - businessImpact: The primary business benefit this feature would provide (1-2 sentences)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a product strategist who specializes in technology product innovation." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.7,
    });

    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error("Error generating feature recommendations:", error);
    throw new Error("Unable to generate feature recommendations. Please try again later.");
  }
}

/**
 * Generate product documentation outline
 * @param {Object} brand - Brand object
 * @param {string} productName - Name of the product
 * @returns {Promise<Object>} - Documentation outline object
 */
export async function generateDocumentationOutline(brand, productName) {
  try {
    const prompt = `
      Create a technical documentation outline for a product called "${productName}" 
      from the company "${brand.name}" which specializes in ${brand.technologies.join(', ')}.
      
      The product is part of their ${brand.description} offering.
      
      Generate a comprehensive documentation outline with the following sections:
      1. Introduction
      2. Getting Started
      3. Core Features (with subsections)
      4. API Reference (if applicable)
      5. Deployment & Integration
      6. Troubleshooting
      7. Best Practices
      
      Format your response as a JSON object with nested sections and subsections.
      Keep the entire outline professional and technically focused.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a technical documentation specialist who creates comprehensive documentation outlines for enterprise software products." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.4,
    });

    // Parse the JSON response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating documentation outline:", error);
    throw new Error("Unable to generate documentation outline. Please try again later.");
  }
}

// Export the OpenAI service
export default {
  generateEnhancedDescription,
  analyzeTechnologyTrends,
  generateFeatureRecommendations,
  generateDocumentationOutline
};