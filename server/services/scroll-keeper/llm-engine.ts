/**
 * Scroll Keeper LLM Engine
 * 
 * Manages interactions with LLM APIs for generating reflections,
 * extracting insights, and creating knowledge graphs from scrolls.
 */

import { storage } from '../../storage';
import { Scroll, InsertReflection } from '../../../shared/scroll-keeper-schema';
import { searchSimilarScrolls } from './vectorstore';
import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face client lazily
// Using open-source models instead of OpenAI to avoid API costs
let hf: HfInference | null = null;

// Lazily initialize HuggingFace inference
function getHfClient(): HfInference | null {
  if (hf) return hf;
  
  try {
    hf = new HfInference(process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY);
    console.log('HuggingFace inference initialized successfully');
    return hf;
  } catch (error) {
    console.warn('Failed to initialize HuggingFace inference:', error);
    return null;
  }
}

// System prompts for different tasks
const REFLECTION_PROMPT = `
You are a wisdom extractor for the Scroll Keeper system. Your task is to analyze the provided conversation
and extract the most important insights, lessons, and wisdom. Focus on timeless principles, mental models,
and actionable wisdom rather than specific technical details or ephemeral information.

Format your reflection as follows:
1. Core Insight: The single most important insight from this conversation
2. Key Lessons: 3-5 important takeaways in bullet points
3. Mental Models: Any mental models or frameworks mentioned or implied
4. Action Items: Potential actions a person could take based on this wisdom
5. Connections: How this wisdom connects to broader knowledge domains

Remember, your goal is to create a reflection that will be valuable even years from now.
`;

const ANSWER_GENERATION_PROMPT = `
You are a knowledge integrator for the Scroll Keeper system. Your task is to answer a question by synthesizing
information from multiple scrolls (conversation excerpts) that have been provided to you.

Guidelines:
1. Draw primarily from the provided scrolls, citing which scroll contains the information
2. When information is missing or contradictory, clearly state this
3. Synthesize rather than simply concatenating information
4. Keep your answer concise but comprehensive
5. If the scrolls don't contain relevant information, state this clearly

Format your answer to be clear, helpful, and accurate, drawing connections between different scrolls when appropriate.
`;

/**
 * Generate text using Hugging Face models
 */
async function generateTextWithHuggingFace(prompt: string): Promise<string> {
  try {
    const client = getHfClient();
    
    // If HF client is not available, return a graceful fallback
    if (!client) {
      console.warn("Hugging Face client not available, returning fallback message");
      return "I'm sorry, but the text generation service is not available at the moment. Please try again later.";
    }
    
    // Using an open-source large language model
    const model = "mistralai/Mistral-7B-Instruct-v0.2"; // Free, high-quality open-source model
    
    const response = await client.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      }
    });
    
    return response.generated_text;
  } catch (error) {
    console.error("Error generating text with Hugging Face:", error);
    return "I encountered an issue while processing your request. The service might be temporarily unavailable.";
  }
}

/**
 * Generate a reflection from a scroll
 */
export async function generateReflectionForScroll(scrollId: string): Promise<string | null> {
  try {
    // Get the scroll
    const scroll = await storage.getScroll(scrollId);
    
    if (!scroll) {
      console.error(`Scroll with ID ${scrollId} not found`);
      return null;
    }
    
    // Prepare the prompt with system message and user content
    const prompt = `${REFLECTION_PROMPT}\n\nPlease create a reflection for the following conversation:\n\n${scroll.content}`;
    
    // Generate reflection using Hugging Face
    const reflectionContent = await generateTextWithHuggingFace(prompt);
    
    // Store the reflection
    const reflection = await storage.createReflection({
      question: `Reflection for scroll: ${scroll.title}`,
      answer: reflectionContent,
      scrollIds: [scrollId],
      userId: scroll.userId
    });
    
    if (!reflection) {
      throw new Error('Failed to store reflection');
    }
    
    // Queue embedding generation for the reflection
    await storage.createProcessingQueueItem({
      taskType: 'embedding_generation',
      payload: {
        reflectionId: reflection.id,
        text: reflectionContent
      },
      priority: 4 // Lower priority than scroll extraction
    });
    
    return reflection.id.toString();
  } catch (error) {
    console.error(`Error generating reflection for scroll ${scrollId}:`, error);
    return null;
  }
}

/**
 * Generate an answer to a question using relevant scrolls
 */
export async function generateAnswerFromScrolls(question: string, userId: number | null = null): Promise<{
  answer: string;
  scrollIds: string[];
} | null> {
  try {
    // Find similar scrolls
    const { scrolls } = await searchSimilarScrolls(question, 5);
    
    if (scrolls.length === 0) {
      return {
        answer: "I couldn't find any relevant information in your scrolls to answer this question.",
        scrollIds: []
      };
    }
    
    // Prepare context from scrolls
    const scrollsContext = scrolls.map((scroll, index) => {
      return `Scroll ${index + 1} (ID: ${scroll.id}):\n${scroll.content.substring(0, 2000)}${scroll.content.length > 2000 ? '...' : ''}`;
    }).join('\n\n');
    
    // Prepare the prompt with system message and user content
    const prompt = `${ANSWER_GENERATION_PROMPT}\n\nQuestion: ${question}\n\nHere are the relevant scrolls:\n\n${scrollsContext}`;
    
    // Generate answer using Hugging Face
    const answer = await generateTextWithHuggingFace(prompt);
    
    // Store the reflection (answer)
    const reflection = await storage.createReflection({
      question,
      answer,
      scrollIds: scrolls.map(s => s.id),
      userId
    });
    
    // Store the answer and relevant scroll IDs
    return {
      answer,
      scrollIds: scrolls.map(s => s.id)
    };
  } catch (error) {
    console.error(`Error generating answer from scrolls:`, error);
    return null;
  }
}