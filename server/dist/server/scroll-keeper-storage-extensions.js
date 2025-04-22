"use strict";
/**
 * Scroll Keeper Storage Extensions
 *
 * Extends the storage interface with methods specific to Scroll Keeper functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = extendStorageWithScrollKeeper;
const uuid_1 = require("uuid");
// In-memory storage for scrolls
const scrollsMap = new Map();
// In-memory storage for reflections
const reflectionsMap = new Map();
// In-memory storage for processing queue
const processingQueueMap = new Map();
let nextProcessingQueueId = 1;
// In-memory storage for settings
const settingsMap = new Map();
let nextSettingsId = 1;
// Extend the storage with Scroll Keeper functionality
function extendStorageWithScrollKeeper(storage) {
    // Scroll operations
    storage.createScroll = async (scroll) => {
        const now = new Date();
        const newScroll = {
            id: scroll.id || (0, uuid_1.v4)(),
            userId: scroll.userId || null,
            title: scroll.title,
            content: scroll.content,
            originalUrl: scroll.originalUrl,
            originalContent: scroll.originalContent || null,
            tags: scroll.tags || null,
            metadata: scroll.metadata || null,
            vectorEmbedding: null,
            createdAt: now,
            updatedAt: now
        };
        scrollsMap.set(newScroll.id, newScroll);
        return newScroll;
    };
    storage.getScroll = async (id) => {
        return scrollsMap.get(id) || null;
    };
    storage.getScrollsByUserId = async (userId) => {
        return Array.from(scrollsMap.values()).filter(scroll => scroll.userId === userId);
    };
    storage.updateScroll = async (id, scrollUpdate) => {
        const scroll = scrollsMap.get(id);
        if (!scroll)
            return null;
        const updatedScroll = {
            ...scroll,
            ...scrollUpdate,
            updatedAt: new Date(),
            tags: scrollUpdate.tags || scroll.tags,
            id // Ensure ID doesn't change
        };
        scrollsMap.set(id, updatedScroll);
        return updatedScroll;
    };
    storage.deleteScroll = async (id) => {
        return scrollsMap.delete(id);
    };
    // Reflection operations
    storage.createReflection = async (reflection) => {
        const id = reflectionsMap.size + 1;
        const now = new Date();
        const newReflection = {
            id,
            userId: reflection.userId || null,
            question: reflection.question,
            answer: reflection.answer,
            scrollIds: reflection.scrollIds,
            vectorEmbedding: null,
            createdAt: now
        };
        reflectionsMap.set(id, newReflection);
        return newReflection;
    };
    storage.getReflection = async (id) => {
        return reflectionsMap.get(id) || null;
    };
    storage.getReflectionsByUserId = async (userId) => {
        return Array.from(reflectionsMap.values()).filter(reflection => reflection.userId === userId);
    };
    storage.getReflectionsByScrollId = async (scrollId) => {
        return Array.from(reflectionsMap.values()).filter(reflection => reflection.scrollIds && reflection.scrollIds.includes(scrollId));
    };
    storage.updateReflection = async (id, reflectionUpdate) => {
        const reflection = reflectionsMap.get(id);
        if (!reflection)
            return null;
        const updatedReflection = {
            ...reflection,
            ...reflectionUpdate,
            id // Ensure ID doesn't change
        };
        reflectionsMap.set(id, updatedReflection);
        return updatedReflection;
    };
    storage.deleteReflection = async (id) => {
        return reflectionsMap.delete(id);
    };
    // Processing queue operations
    storage.createProcessingQueueItem = async (item) => {
        const id = nextProcessingQueueId++;
        const now = new Date();
        const newItem = {
            id,
            taskType: item.taskType,
            status: 'pending',
            payload: item.payload,
            result: null,
            error: null,
            createdAt: now,
            startedAt: null,
            completedAt: null,
            priority: item.priority || 5
        };
        processingQueueMap.set(id, newItem);
        return newItem;
    };
    storage.getProcessingQueueItem = async (id) => {
        return processingQueueMap.get(id) || null;
    };
    storage.getPendingProcessingQueueItems = async (limit = 10) => {
        const pendingItems = Array.from(processingQueueMap.values())
            .filter(item => item.status === 'pending')
            .sort((a, b) => {
            // First by priority (higher priority first)
            const priorityDiff = (b.priority || 5) - (a.priority || 5);
            if (priorityDiff !== 0)
                return priorityDiff;
            // Then by creation date (older first)
            return a.createdAt.getTime() - b.createdAt.getTime();
        })
            .slice(0, limit);
        return pendingItems;
    };
    storage.updateProcessingQueueItem = async (id, itemUpdate) => {
        const item = processingQueueMap.get(id);
        if (!item)
            return null;
        const updatedItem = {
            ...item,
            ...itemUpdate,
            id // Ensure ID doesn't change
        };
        processingQueueMap.set(id, updatedItem);
        return updatedItem;
    };
    storage.updateProcessingQueueItemStatus = async (id, status, result, startedAt, completedAt, error) => {
        const item = processingQueueMap.get(id);
        if (!item)
            return null;
        const updatedItem = {
            ...item,
            status,
            result: result !== undefined ? result : item.result,
            startedAt: startedAt || item.startedAt,
            completedAt: completedAt || item.completedAt,
            error: error !== undefined ? error : item.error
        };
        processingQueueMap.set(id, updatedItem);
        return updatedItem;
    };
    storage.deleteProcessingQueueItem = async (id) => {
        return processingQueueMap.delete(id);
    };
    // Settings operations
    storage.createScrollKeeperSettings = async (settings) => {
        // Check if user already has settings
        const existingSettings = await storage.getScrollKeeperSettingsByUserId(settings.userId);
        if (existingSettings) {
            return existingSettings;
        }
        const id = nextSettingsId++;
        const now = new Date();
        const newSettings = {
            id,
            userId: settings.userId,
            theme: settings.theme || 'cosmic',
            defaultPromptTemplate: settings.defaultPromptTemplate || null,
            allowPublicSharing: settings.allowPublicSharing === 'true',
            createdAt: now,
            updatedAt: now
        };
        settingsMap.set(id, newSettings);
        return newSettings;
    };
    storage.getScrollKeeperSettings = async (id) => {
        return settingsMap.get(id) || null;
    };
    storage.getScrollKeeperSettingsByUserId = async (userId) => {
        return Array.from(settingsMap.values()).find(settings => settings.userId === userId) || null;
    };
    storage.updateScrollKeeperSettings = async (id, settingsUpdate) => {
        const settings = settingsMap.get(id);
        if (!settings)
            return null;
        const updatedSettings = {
            ...settings,
            ...settingsUpdate,
            updatedAt: new Date(),
            id // Ensure ID doesn't change
        };
        settingsMap.set(id, updatedSettings);
        return updatedSettings;
    };
}
// Initialize the extensions
const storage_1 = require("./storage");
extendStorageWithScrollKeeper(storage_1.storage);
