/**
 * Scroll Keeper Queue Processor
 * 
 * Handles asynchronous processing of extraction, embedding, and reflection tasks
 * for the Scroll Keeper system.
 */

import { storage } from '../../storage';
import { processScrollFromUrl } from './scroll-ingestor';
import { processEmbeddingForScroll } from './vectorstore';

// Configuration
const QUEUE_CHECK_INTERVAL = 60000; // Check for new tasks every 60 seconds
const MAX_CONCURRENT_TASKS = 2; // Maximum number of concurrent tasks
const TASK_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout for tasks

// Processing state
let isProcessing = false;
let processingInterval: NodeJS.Timeout | null = null;

/**
 * Start the queue processor
 */
export function startQueueProcessor() {
  if (processingInterval) {
    console.log('Queue processor already running');
    return;
  }
  
  console.log('Starting Scroll Keeper queue processor');
  
  processingInterval = setInterval(async () => {
    if (!isProcessing) {
      await processNextTasks();
    }
  }, QUEUE_CHECK_INTERVAL);
  
  // Initial processing
  processNextTasks().catch(error => {
    console.error('Error in initial queue processing:', error);
  });
}

/**
 * Stop the queue processor
 */
export function stopQueueProcessor() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('Stopped Scroll Keeper queue processor');
  }
}

/**
 * Process the next batch of tasks in the queue
 */
async function processNextTasks() {
  try {
    isProcessing = true;
    
    // Get pending tasks from the queue, ordered by priority
    const pendingTasks = await storage.getPendingProcessingQueueItems(MAX_CONCURRENT_TASKS);
    
    if (pendingTasks.length === 0) {
      isProcessing = false;
      return;
    }
    
    console.log(`Processing ${pendingTasks.length} tasks from the queue`);
    
    // Process each task
    await Promise.all(pendingTasks.map(async (task) => {
      // Mark task as processing
      await storage.updateProcessingQueueItemStatus(task.id, 'processing', null, new Date());
      
      try {
        // Set timeout to prevent long-running tasks
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Task ${task.id} timed out after ${TASK_TIMEOUT}ms`));
          }, TASK_TIMEOUT);
        });
        
        // Process based on task type
        const processingPromise = (async () => {
          let result;
          
          switch (task.taskType) {
            case 'scroll_extraction':
              const payload = task.payload as Record<string, any>;
              result = await processScrollFromUrl(
                payload.url as string, 
                payload.userId as number
              );
              break;
              
            case 'embedding_generation':
              const embeddingPayload = task.payload as Record<string, any>;
              result = await processEmbeddingForScroll(embeddingPayload.scrollId as string);
              break;
              
            case 'reflection_generation':
              const reflectionPayload = task.payload as Record<string, any>;
              // TODO: Implement reflection generation
              result = null;
              break;
              
            default:
              throw new Error(`Unknown task type: ${task.taskType}`);
          }
          
          return result;
        })();
        
        // Wait for processing or timeout
        const result = await Promise.race([processingPromise, timeoutPromise]);
        
        // Mark task as completed
        await storage.updateProcessingQueueItemStatus(task.id, 'completed', result, undefined, new Date());
        
        console.log(`Task ${task.id} completed successfully`);
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        
        // Mark task as failed
        await storage.updateProcessingQueueItemStatus(
          task.id, 
          'failed', 
          null, 
          undefined, 
          new Date(),
          error instanceof Error ? error.message : String(error)
        );
      }
    }));
  } catch (error) {
    console.error('Error in queue processing:', error);
  } finally {
    isProcessing = false;
  }
}