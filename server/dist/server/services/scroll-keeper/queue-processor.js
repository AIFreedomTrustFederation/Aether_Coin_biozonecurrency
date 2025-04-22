"use strict";
/**
 * Scroll Keeper Queue Processor
 *
 * Handles asynchronous processing of extraction, embedding, and reflection tasks
 * for the Scroll Keeper system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startQueueProcessor = startQueueProcessor;
exports.stopQueueProcessor = stopQueueProcessor;
const storage_1 = require("../../storage");
const scroll_ingestor_1 = require("./scroll-ingestor");
const vectorstore_1 = require("./vectorstore");
// Configuration
const QUEUE_CHECK_INTERVAL = 60000; // Check for new tasks every 60 seconds
const MAX_CONCURRENT_TASKS = 2; // Maximum number of concurrent tasks
const TASK_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout for tasks
// Processing state
let isProcessing = false;
let processingInterval = null;
/**
 * Start the queue processor
 */
function startQueueProcessor() {
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
function stopQueueProcessor() {
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
        const pendingTasks = await storage_1.storage.getPendingProcessingQueueItems(MAX_CONCURRENT_TASKS);
        if (pendingTasks.length === 0) {
            isProcessing = false;
            return;
        }
        console.log(`Processing ${pendingTasks.length} tasks from the queue`);
        // Process each task
        await Promise.all(pendingTasks.map(async (task) => {
            // Mark task as processing
            await storage_1.storage.updateProcessingQueueItemStatus(task.id, 'processing', null, new Date());
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
                            const payload = task.payload;
                            result = await (0, scroll_ingestor_1.processScrollFromUrl)(payload.url, payload.userId);
                            break;
                        case 'embedding_generation':
                            const embeddingPayload = task.payload;
                            result = await (0, vectorstore_1.processEmbeddingForScroll)(embeddingPayload.scrollId);
                            break;
                        case 'reflection_generation':
                            const reflectionPayload = task.payload;
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
                await storage_1.storage.updateProcessingQueueItemStatus(task.id, 'completed', result, undefined, new Date());
                console.log(`Task ${task.id} completed successfully`);
            }
            catch (error) {
                console.error(`Error processing task ${task.id}:`, error);
                // Mark task as failed
                await storage_1.storage.updateProcessingQueueItemStatus(task.id, 'failed', null, undefined, new Date(), error instanceof Error ? error.message : String(error));
            }
        }));
    }
    catch (error) {
        console.error('Error in queue processing:', error);
    }
    finally {
        isProcessing = false;
    }
}
