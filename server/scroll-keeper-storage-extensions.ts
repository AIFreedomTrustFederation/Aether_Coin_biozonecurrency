/**
 * Scroll Keeper Storage Extensions
 * 
 * Extends the storage interface with methods specific to Scroll Keeper functionality
 */

import { IStorage } from './storage';
import { 
  InsertScroll, Scroll, 
  InsertReflection, Reflection,
  InsertProcessingQueueItem, ProcessingQueueItem,
  InsertScrollKeeperSettings, ScrollKeeperSettings
} from '../shared/scroll-keeper-schema';
import { v4 as uuidv4 } from 'uuid';
import { json } from 'drizzle-orm/pg-core';

// In-memory storage for scrolls
const scrollsMap = new Map<string, Scroll>();

// In-memory storage for reflections
const reflectionsMap = new Map<number, Reflection>();

// In-memory storage for processing queue
const processingQueueMap = new Map<number, ProcessingQueueItem>();
let nextProcessingQueueId = 1;

// In-memory storage for settings
const settingsMap = new Map<number, ScrollKeeperSettings>();
let nextSettingsId = 1;

declare module './storage' {
  interface IStorage {
    // Scroll operations
    createScroll(scroll: InsertScroll): Promise<Scroll>;
    getScroll(id: string): Promise<Scroll | null>;
    getScrollsByUserId(userId: number): Promise<Scroll[]>;
    updateScroll(id: string, scroll: Partial<Scroll>): Promise<Scroll | null>;
    deleteScroll(id: string): Promise<boolean>;
    
    // Reflection operations
    createReflection(reflection: InsertReflection): Promise<Reflection>;
    getReflection(id: number): Promise<Reflection | null>;
    getReflectionsByUserId(userId: number): Promise<Reflection[]>;
    getReflectionsByScrollId(scrollId: string): Promise<Reflection[]>;
    updateReflection(id: number, reflection: Partial<Reflection>): Promise<Reflection | null>;
    deleteReflection(id: number): Promise<boolean>;
    
    // Processing queue operations
    createProcessingQueueItem(item: InsertProcessingQueueItem): Promise<ProcessingQueueItem>;
    getProcessingQueueItem(id: number): Promise<ProcessingQueueItem | null>;
    getPendingProcessingQueueItems(limit?: number): Promise<ProcessingQueueItem[]>;
    updateProcessingQueueItem(id: number, item: Partial<ProcessingQueueItem>): Promise<ProcessingQueueItem | null>;
    updateProcessingQueueItemStatus(
      id: number, 
      status: string, 
      result?: any, 
      startedAt?: Date, 
      completedAt?: Date, 
      error?: string
    ): Promise<ProcessingQueueItem | null>;
    deleteProcessingQueueItem(id: number): Promise<boolean>;
    
    // Settings operations
    createScrollKeeperSettings(settings: InsertScrollKeeperSettings): Promise<ScrollKeeperSettings>;
    getScrollKeeperSettings(id: number): Promise<ScrollKeeperSettings | null>;
    getScrollKeeperSettingsByUserId(userId: number): Promise<ScrollKeeperSettings | null>;
    updateScrollKeeperSettings(id: number, settings: Partial<ScrollKeeperSettings>): Promise<ScrollKeeperSettings | null>;
  }
}

// Extend the storage with Scroll Keeper functionality
export default function extendStorageWithScrollKeeper(storage: IStorage) {
  // Scroll operations
  storage.createScroll = async (scroll: InsertScroll): Promise<Scroll> => {
    const now = new Date();
    const newScroll: Scroll = {
      id: scroll.id || uuidv4(),
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
  
  storage.getScroll = async (id: string): Promise<Scroll | null> => {
    return scrollsMap.get(id) || null;
  };
  
  storage.getScrollsByUserId = async (userId: number): Promise<Scroll[]> => {
    return Array.from(scrollsMap.values()).filter(scroll => scroll.userId === userId);
  };
  
  storage.updateScroll = async (id: string, scrollUpdate: Partial<Scroll>): Promise<Scroll | null> => {
    const scroll = scrollsMap.get(id);
    if (!scroll) return null;
    
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
  
  storage.deleteScroll = async (id: string): Promise<boolean> => {
    return scrollsMap.delete(id);
  };
  
  // Reflection operations
  storage.createReflection = async (reflection: InsertReflection): Promise<Reflection> => {
    const id = reflectionsMap.size + 1;
    const now = new Date();
    
    const newReflection: Reflection = {
      id,
      userId: reflection.userId || null,
      question: reflection.question,
      answer: reflection.answer as string,
      scrollIds: reflection.scrollIds as string[] | null,
      vectorEmbedding: null,
      createdAt: now
    };
    
    reflectionsMap.set(id, newReflection);
    return newReflection;
  };
  
  storage.getReflection = async (id: number): Promise<Reflection | null> => {
    return reflectionsMap.get(id) || null;
  };
  
  storage.getReflectionsByUserId = async (userId: number): Promise<Reflection[]> => {
    return Array.from(reflectionsMap.values()).filter(reflection => reflection.userId === userId);
  };
  
  storage.getReflectionsByScrollId = async (scrollId: string): Promise<Reflection[]> => {
    return Array.from(reflectionsMap.values()).filter(reflection => 
      reflection.scrollIds && reflection.scrollIds.includes(scrollId)
    );
  };
  
  storage.updateReflection = async (id: number, reflectionUpdate: Partial<Reflection>): Promise<Reflection | null> => {
    const reflection = reflectionsMap.get(id);
    if (!reflection) return null;
    
    const updatedReflection = {
      ...reflection,
      ...reflectionUpdate,
      id // Ensure ID doesn't change
    };
    
    reflectionsMap.set(id, updatedReflection);
    return updatedReflection;
  };
  
  storage.deleteReflection = async (id: number): Promise<boolean> => {
    return reflectionsMap.delete(id);
  };
  
  // Processing queue operations
  storage.createProcessingQueueItem = async (item: InsertProcessingQueueItem): Promise<ProcessingQueueItem> => {
    const id = nextProcessingQueueId++;
    const now = new Date();
    
    const newItem: ProcessingQueueItem = {
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
  
  storage.getProcessingQueueItem = async (id: number): Promise<ProcessingQueueItem | null> => {
    return processingQueueMap.get(id) || null;
  };
  
  storage.getPendingProcessingQueueItems = async (limit = 10): Promise<ProcessingQueueItem[]> => {
    const pendingItems = Array.from(processingQueueMap.values())
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        // First by priority (higher priority first)
        const priorityDiff = (b.priority || 5) - (a.priority || 5);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by creation date (older first)
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .slice(0, limit);
    
    return pendingItems;
  };
  
  storage.updateProcessingQueueItem = async (
    id: number, 
    itemUpdate: Partial<ProcessingQueueItem>
  ): Promise<ProcessingQueueItem | null> => {
    const item = processingQueueMap.get(id);
    if (!item) return null;
    
    const updatedItem = {
      ...item,
      ...itemUpdate,
      id // Ensure ID doesn't change
    };
    
    processingQueueMap.set(id, updatedItem);
    return updatedItem;
  };
  
  storage.updateProcessingQueueItemStatus = async (
    id: number, 
    status: string, 
    result?: any, 
    startedAt?: Date, 
    completedAt?: Date, 
    error?: string
  ): Promise<ProcessingQueueItem | null> => {
    const item = processingQueueMap.get(id);
    if (!item) return null;
    
    const updatedItem: ProcessingQueueItem = {
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
  
  storage.deleteProcessingQueueItem = async (id: number): Promise<boolean> => {
    return processingQueueMap.delete(id);
  };
  
  // Settings operations
  storage.createScrollKeeperSettings = async (settings: InsertScrollKeeperSettings): Promise<ScrollKeeperSettings> => {
    // Check if user already has settings
    const existingSettings = await storage.getScrollKeeperSettingsByUserId(settings.userId);
    if (existingSettings) {
      return existingSettings;
    }
    
    const id = nextSettingsId++;
    const now = new Date();
    
    const newSettings: ScrollKeeperSettings = {
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
  
  storage.getScrollKeeperSettings = async (id: number): Promise<ScrollKeeperSettings | null> => {
    return settingsMap.get(id) || null;
  };
  
  storage.getScrollKeeperSettingsByUserId = async (userId: number): Promise<ScrollKeeperSettings | null> => {
    return Array.from(settingsMap.values()).find(settings => settings.userId === userId) || null;
  };
  
  storage.updateScrollKeeperSettings = async (
    id: number, 
    settingsUpdate: Partial<ScrollKeeperSettings>
  ): Promise<ScrollKeeperSettings | null> => {
    const settings = settingsMap.get(id);
    if (!settings) return null;
    
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
import { storage } from './storage';
extendStorageWithScrollKeeper(storage);