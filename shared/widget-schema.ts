import { z } from 'zod';
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Widget position schema
export const widgetPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

export type WidgetPosition = z.infer<typeof widgetPositionSchema>;

// Widget schema - Database tables
export const widgetTemplates = pgTable("widget_templates", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  defaultConfig: jsonb("default_config").notNull(),
  defaultWidth: integer("default_width").notNull(),
  defaultHeight: integer("default_height").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dashboardId: integer("dashboard_id").notNull().references(() => dashboards.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas
export const widgetTemplateSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  defaultConfig: z.record(z.any()),
  defaultWidth: z.number(),
  defaultHeight: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type WidgetTemplate = z.infer<typeof widgetTemplateSchema>;

export const widgetSchema = z.object({
  id: z.number(),
  userId: z.number(),
  dashboardId: z.number(),
  type: z.string(),
  name: z.string(),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  config: z.record(z.any()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Widget = z.infer<typeof widgetSchema>;

export const dashboardSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Dashboard = z.infer<typeof dashboardSchema>;

export const dashboardWithWidgetsSchema = dashboardSchema.extend({
  widgets: z.array(widgetSchema)
});

export type DashboardWithWidgets = z.infer<typeof dashboardWithWidgetsSchema>;

// Insert schemas from Drizzle
export const insertWidgetTemplateSchema = createInsertSchema(widgetTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertWidgetSchema = createInsertSchema(widgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Update schema
export const updateWidgetSchema = z.object({
  name: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional()
});

export type UpdateWidget = z.infer<typeof updateWidgetSchema>;

export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type InsertWidgetTemplate = z.infer<typeof insertWidgetTemplateSchema>;