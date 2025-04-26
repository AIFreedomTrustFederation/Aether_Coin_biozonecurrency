/**
 * Developer Productivity Service
 * Provides functionality for tracking, analyzing, and visualizing developer productivity metrics
 */

import { formatDate } from '@/lib/utils';
import { 
  DeveloperActivity, 
  ProductivityMetric, 
  DeveloperGoal, 
  ProductivityInsight,
  TimeBlock,
  CodeQualityMetric,
  InsertDeveloperActivity,
  InsertProductivityMetric,
  InsertTimeBlock
} from '@/shared/schema';

// Mock user ID for demo purposes (would be retrieved from auth service in real app)
const CURRENT_USER_ID = 1;

// Sample activity types
export const ACTIVITY_TYPES = [
  'coding',
  'review',
  'testing',
  'documentation',
  'planning',
  'meeting',
  'learning',
  'debugging',
  'refactoring'
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number];

// Time block categories
export const TIMEBLOCK_CATEGORIES = [
  'deep_work',
  'meeting',
  'learning',
  'admin',
  'break'
] as const;

export type TimeBlockCategory = typeof TIMEBLOCK_CATEGORIES[number];

// Sample data (would be retrieved from API in real app)
const mockActivities: DeveloperActivity[] = [
  {
    id: 1,
    userId: CURRENT_USER_ID,
    activityType: 'coding',
    description: 'Implemented productivity dashboard components',
    timeSpent: 120, // minutes
    codeLines: 250,
    complexity: 45,
    date: new Date(),
    timestamp: new Date(),
    metadata: { 
      language: 'TypeScript',
      files: ['productivityService.ts', 'ProductivityDashboard.tsx']
    },
    projectId: 1
  },
  {
    id: 2,
    userId: CURRENT_USER_ID,
    activityType: 'review',
    description: 'Code review for CodeStar feature PR',
    timeSpent: 45,
    codeLines: 0,
    complexity: 0,
    date: new Date(Date.now() - 86400000), // yesterday
    timestamp: new Date(Date.now() - 86400000),
    metadata: { 
      prNumber: 'PR-123',
      comments: 8
    },
    projectId: 1
  },
  {
    id: 3,
    userId: CURRENT_USER_ID,
    activityType: 'testing',
    description: 'Unit tests for complexity analyzer',
    timeSpent: 60,
    codeLines: 85,
    complexity: 15,
    date: new Date(Date.now() - 172800000), // 2 days ago
    timestamp: new Date(Date.now() - 172800000),
    metadata: { 
      testCount: 12,
      coverage: 87
    },
    projectId: 1
  },
  {
    id: 4,
    userId: CURRENT_USER_ID,
    activityType: 'documentation',
    description: 'Updated API documentation',
    timeSpent: 30,
    codeLines: 45,
    complexity: 0,
    date: new Date(Date.now() - 259200000), // 3 days ago
    timestamp: new Date(Date.now() - 259200000),
    metadata: { 
      format: 'markdown',
      sections: ['API', 'Usage Examples']
    },
    projectId: 1
  },
  {
    id: 5,
    userId: CURRENT_USER_ID,
    activityType: 'planning',
    description: 'Sprint planning for next milestone',
    timeSpent: 90,
    codeLines: 0,
    complexity: 0,
    date: new Date(Date.now() - 345600000), // 4 days ago
    timestamp: new Date(Date.now() - 345600000),
    metadata: { 
      tasks: 15,
      sprint: 'Q2-Sprint-3'
    },
    projectId: 1
  }
];

const mockMetrics: ProductivityMetric[] = [
  {
    id: 1,
    userId: CURRENT_USER_ID,
    date: new Date(),
    totalTimeSpent: 295, // minutes
    totalCodeLines: 335,
    focusScore: 85,
    efficiencyRating: 78,
    qualityScore: 92,
    tasksCompleted: 3,
    blockers: 1,
    metadata: { mood: 'productive', energy: 'high' },
    createdAt: new Date()
  },
  {
    id: 2,
    userId: CURRENT_USER_ID,
    date: new Date(Date.now() - 86400000), // yesterday
    totalTimeSpent: 310,
    totalCodeLines: 215,
    focusScore: 72,
    efficiencyRating: 65,
    qualityScore: 88,
    tasksCompleted: 2,
    blockers: 2,
    metadata: { mood: 'focused', energy: 'medium' },
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    userId: CURRENT_USER_ID,
    date: new Date(Date.now() - 172800000), // 2 days ago
    totalTimeSpent: 350,
    totalCodeLines: 420,
    focusScore: 90,
    efficiencyRating: 87,
    qualityScore: 94,
    tasksCompleted: 4,
    blockers: 0,
    metadata: { mood: 'flow', energy: 'high' },
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: 4,
    userId: CURRENT_USER_ID,
    date: new Date(Date.now() - 259200000), // 3 days ago
    totalTimeSpent: 240,
    totalCodeLines: 150,
    focusScore: 60,
    efficiencyRating: 55,
    qualityScore: 75,
    tasksCompleted: 2,
    blockers: 3,
    metadata: { mood: 'distracted', energy: 'low' },
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: 5,
    userId: CURRENT_USER_ID,
    date: new Date(Date.now() - 345600000), // 4 days ago
    totalTimeSpent: 275,
    totalCodeLines: 280,
    focusScore: 78,
    efficiencyRating: 72,
    qualityScore: 85,
    tasksCompleted: 3,
    blockers: 1,
    metadata: { mood: 'steady', energy: 'medium' },
    createdAt: new Date(Date.now() - 345600000)
  }
];

const mockGoals: DeveloperGoal[] = [
  {
    id: 1,
    userId: CURRENT_USER_ID,
    title: 'Increase code quality score',
    description: 'Aim to maintain 90+ code quality score for the quarter',
    targetValue: 90,
    currentValue: 87,
    metricType: 'quality_score',
    timeframe: 'quarterly',
    startDate: new Date(Date.now() - 30 * 86400000), // 30 days ago
    endDate: new Date(Date.now() + 60 * 86400000),  // 60 days from now
    status: 'active',
    priority: 1,
    createdAt: new Date(Date.now() - 30 * 86400000),
    updatedAt: new Date()
  },
  {
    id: 2,
    userId: CURRENT_USER_ID,
    title: 'Reduce meeting time',
    description: 'Spend less than 60 minutes per day in meetings on average',
    targetValue: 60,
    currentValue: 75,
    metricType: 'time',
    timeframe: 'weekly',
    startDate: new Date(Date.now() - 15 * 86400000), // 15 days ago
    endDate: new Date(Date.now() + 15 * 86400000),  // 15 days from now
    status: 'active',
    priority: 2,
    createdAt: new Date(Date.now() - 15 * 86400000),
    updatedAt: new Date()
  },
  {
    id: 3,
    userId: CURRENT_USER_ID,
    title: 'Write more unit tests',
    description: 'Complete 15 unit tests per week',
    targetValue: 15,
    currentValue: 9,
    metricType: 'tasks',
    timeframe: 'weekly',
    startDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
    endDate: new Date(Date.now() + 20 * 86400000),  // 20 days from now
    status: 'active',
    priority: 3,
    createdAt: new Date(Date.now() - 10 * 86400000),
    updatedAt: new Date()
  }
];

const mockInsights: ProductivityInsight[] = [
  {
    id: 1,
    userId: CURRENT_USER_ID,
    insightType: 'pattern',
    title: 'Peak productivity time',
    description: 'You consistently produce more code between 9am-11am. Consider scheduling deep work during this period.',
    score: 0.85,
    date: new Date(),
    isRead: false,
    metadata: { timeOfDay: 'morning', confidence: 'high' },
    createdAt: new Date()
  },
  {
    id: 2,
    userId: CURRENT_USER_ID,
    insightType: 'suggestion',
    title: 'Consider adding more comments',
    description: 'Your comment ratio is lower than recommended. Adding more documentation can improve maintainability.',
    score: 0.75,
    date: new Date(),
    isRead: true,
    metadata: { currentRatio: 0.12, recommendedRatio: 0.2 },
    createdAt: new Date(Date.now() - 86400000) // yesterday
  },
  {
    id: 3,
    userId: CURRENT_USER_ID,
    insightType: 'achievement',
    title: 'Personal best',
    description: 'You completed 4 tasks yesterday, your highest daily count this month!',
    score: 0.95,
    date: new Date(Date.now() - 86400000), // yesterday
    isRead: true,
    metadata: { previousBest: 3, average: 2.5 },
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 4,
    userId: CURRENT_USER_ID,
    insightType: 'warning',
    title: 'Increasing complexity',
    description: 'Code complexity has been trending upward in recent commits. Consider refactoring.',
    score: 0.8,
    date: new Date(Date.now() - 172800000), // 2 days ago
    isRead: true,
    metadata: { trend: 'increasing', recentScore: 65, threshold: 50 },
    createdAt: new Date(Date.now() - 172800000)
  }
];

const mockTimeBlocks: TimeBlock[] = [
  {
    id: 1,
    userId: CURRENT_USER_ID,
    title: 'Implement Dashboard UI',
    description: 'Create the main components for the productivity dashboard',
    startTime: new Date(Date.now() - 3600000), // 1 hour ago
    endTime: new Date(),
    status: 'completed',
    category: 'deep_work',
    interruptions: 2,
    productivity: 85,
    notes: 'Good progress, minor interruptions from Slack',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    userId: CURRENT_USER_ID,
    title: 'Team Standup',
    description: 'Daily team status update',
    startTime: new Date(Date.now() + 3600000), // 1 hour from now
    endTime: null,
    status: 'scheduled',
    category: 'meeting',
    interruptions: 0,
    productivity: null,
    notes: '',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    userId: CURRENT_USER_ID,
    title: 'Code Review',
    description: 'Review PR for AI integration feature',
    startTime: new Date(Date.now() + 7200000), // 2 hours from now
    endTime: null,
    status: 'scheduled',
    category: 'deep_work',
    interruptions: 0,
    productivity: null,
    notes: '',
    createdAt: new Date(Date.now() - 86400000)
  }
];

export type ActivitySummary = {
  totalTimeSpent: number;
  totalCodeLines: number;
  taskCount: number;
  avgComplexity: number;
  activityTypes: { [key: string]: number };
};

// API Functions

/**
 * Get recent developer activities
 */
export async function getDeveloperActivities(limit = 10): Promise<DeveloperActivity[]> {
  // In real app, would make API request
  // return apiRequest(`/api/productivity/activities?limit=${limit}`);
  
  // For now, return mock data
  return Promise.resolve(mockActivities.slice(0, limit));
}

/**
 * Add new developer activity
 */
export async function addDeveloperActivity(activity: InsertDeveloperActivity): Promise<DeveloperActivity> {
  // In real app, would make API request
  // return apiRequest('/api/productivity/activities', { method: 'POST', body: activity });
  
  // For now, simulate API response
  const newActivity: DeveloperActivity = {
    id: mockActivities.length + 1,
    ...activity,
    timestamp: new Date(), // Override with server timestamp
    metadata: activity.metadata || {}
  };
  
  mockActivities.unshift(newActivity);
  return Promise.resolve(newActivity);
}

/**
 * Get productivity metrics
 */
export async function getProductivityMetrics(days = 7): Promise<ProductivityMetric[]> {
  // In real app, would make API request
  // return apiRequest(`/api/productivity/metrics?days=${days}`);
  
  // For now, return mock data
  return Promise.resolve(mockMetrics.slice(0, days));
}

/**
 * Log daily productivity metrics
 */
export async function logProductivityMetrics(metrics: InsertProductivityMetric): Promise<ProductivityMetric> {
  // In real app, would make API request
  // return apiRequest('/api/productivity/metrics', { method: 'POST', body: metrics });
  
  // For now, simulate API response
  const newMetrics: ProductivityMetric = {
    id: mockMetrics.length + 1,
    ...metrics,
    createdAt: new Date()
  };
  
  mockMetrics.unshift(newMetrics);
  return Promise.resolve(newMetrics);
}

/**
 * Get developer goals
 */
export async function getDeveloperGoals(): Promise<DeveloperGoal[]> {
  // In real app, would make API request
  // return apiRequest('/api/productivity/goals');
  
  // For now, return mock data
  return Promise.resolve(mockGoals);
}

/**
 * Get productivity insights
 */
export async function getProductivityInsights(limit = 5): Promise<ProductivityInsight[]> {
  // In real app, would make API request
  // return apiRequest(`/api/productivity/insights?limit=${limit}`);
  
  // For now, return mock data
  return Promise.resolve(mockInsights.slice(0, limit));
}

/**
 * Mark insight as read
 */
export async function markInsightAsRead(insightId: number): Promise<void> {
  // In real app, would make API request
  // return apiRequest(`/api/productivity/insights/${insightId}/read`, { method: 'POST' });
  
  // For now, simulate API response
  const insight = mockInsights.find(i => i.id === insightId);
  if (insight) {
    insight.isRead = true;
  }
  return Promise.resolve();
}

/**
 * Get time blocks (for today or specified date)
 */
export async function getTimeBlocks(date?: Date): Promise<TimeBlock[]> {
  // In real app, would make API request with date parameter
  // const dateStr = date ? formatDate(date) : 'today';
  // return apiRequest(`/api/productivity/timeblocks?date=${dateStr}`);
  
  // For now, return mock data
  return Promise.resolve(mockTimeBlocks);
}

/**
 * Create a new time block
 */
export async function createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
  // In real app, would make API request
  // return apiRequest('/api/productivity/timeblocks', { method: 'POST', body: timeBlock });
  
  // For now, simulate API response
  const newTimeBlock: TimeBlock = {
    id: mockTimeBlocks.length + 1,
    ...timeBlock,
    endTime: null,
    productivity: null,
    interruptions: 0,
    createdAt: new Date()
  };
  
  mockTimeBlocks.push(newTimeBlock);
  return Promise.resolve(newTimeBlock);
}

/**
 * Update a time block
 */
export async function updateTimeBlock(id: number, updates: Partial<TimeBlock>): Promise<TimeBlock> {
  // In real app, would make API request
  // return apiRequest(`/api/productivity/timeblocks/${id}`, { method: 'PATCH', body: updates });
  
  // For now, simulate API response
  const timeBlock = mockTimeBlocks.find(tb => tb.id === id);
  if (!timeBlock) {
    throw new Error('Time block not found');
  }
  
  Object.assign(timeBlock, updates);
  return Promise.resolve(timeBlock);
}

/**
 * Calculate activity summary stats
 */
export async function getActivitySummary(days = 7): Promise<ActivitySummary> {
  const activities = await getDeveloperActivities(100); // Get a large number to filter from
  
  // Filter to activities within the specified time range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentActivities = activities.filter(a => 
    new Date(a.timestamp) >= cutoffDate
  );
  
  // Calculate summary stats
  const totalTimeSpent = recentActivities.reduce((sum, a) => sum + a.timeSpent, 0);
  const totalCodeLines = recentActivities.reduce((sum, a) => sum + (a.codeLines || 0), 0);
  const codeActivities = recentActivities.filter(a => a.complexity && a.complexity > 0);
  const avgComplexity = codeActivities.length
    ? codeActivities.reduce((sum, a) => sum + a.complexity, 0) / codeActivities.length
    : 0;
  
  // Count activities by type
  const activityTypes: { [key: string]: number } = {};
  recentActivities.forEach(a => {
    activityTypes[a.activityType] = (activityTypes[a.activityType] || 0) + 1;
  });
  
  return {
    totalTimeSpent,
    totalCodeLines,
    taskCount: recentActivities.length,
    avgComplexity,
    activityTypes
  };
}

/**
 * Calculate focus trend over time
 */
export async function getFocusTrend(days = 7): Promise<{ date: string; score: number }[]> {
  const metrics = await getProductivityMetrics(days);
  
  return metrics.map(m => ({
    date: formatDate(new Date(m.date)),
    score: m.focusScore || 0
  })).reverse(); // Order from oldest to newest
}

/**
 * Calculate productivity score (weighted average of metrics)
 */
export function calculateProductivityScore(metric: ProductivityMetric): number {
  // Weights for different factors
  const weights = {
    focusScore: 0.3,
    efficiencyRating: 0.3,
    qualityScore: 0.25,
    tasksCompleted: 0.15
  };
  
  // Normalize tasks completed to 0-100 scale (assuming 5 tasks is 100%)
  const normalizedTasks = Math.min(metric.tasksCompleted * 20, 100);
  
  // Calculate weighted score
  const score =
    (metric.focusScore || 0) * weights.focusScore +
    (metric.efficiencyRating || 0) * weights.efficiencyRating +
    (metric.qualityScore || 0) * weights.qualityScore +
    normalizedTasks * weights.tasksCompleted;
  
  return Math.round(score);
}