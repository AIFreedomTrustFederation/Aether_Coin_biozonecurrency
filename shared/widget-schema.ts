import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, text, integer, timestamp, json, boolean } from 'drizzle-orm/pg-core';

// Widget table definition
export const widgets = pgTable('widgets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type').notNull(), // 'price', 'chart', 'wallet', 'news', etc.
  name: text('name').notNull(),
  position: json('position').notNull(), // { x, y, width, height }
  config: json('config').notNull(), // Widget specific configuration
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Widget type definition
export type Widget = typeof widgets.$inferSelect;

// Widget insert schema
export const insertWidgetSchema = createInsertSchema(widgets, {
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }),
  config: z.record(z.any())
}).omit({ id: true, createdAt: true, updatedAt: true });

// Widget insert type
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

// Widget marketplace item table
export const widgetTemplates = pgTable('widget_templates', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  name: text('name').notNull(), 
  description: text('description').notNull(),
  thumbnail: text('thumbnail'), 
  defaultConfig: json('default_config').notNull(),
  defaultPosition: json('default_position').notNull(),
  category: text('category').notNull(), // 'trading', 'analytics', 'social', etc.
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Widget template type
export type WidgetTemplate = typeof widgetTemplates.$inferSelect;

// Widget template insert schema
export const insertWidgetTemplateSchema = createInsertSchema(widgetTemplates, {
  defaultConfig: z.record(z.any()),
  defaultPosition: z.object({
    width: z.number(),
    height: z.number()
  })
}).omit({ id: true, createdAt: true });

// Widget template insert type
export type InsertWidgetTemplate = z.infer<typeof insertWidgetTemplateSchema>;

// Widget layout (dashboard) table
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Dashboard type
export type Dashboard = typeof dashboards.$inferSelect;

// Dashboard insert schema
export const insertDashboardSchema = createInsertSchema(dashboards)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Dashboard insert type
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;