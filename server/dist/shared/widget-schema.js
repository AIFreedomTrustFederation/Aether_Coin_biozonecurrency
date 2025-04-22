"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWidgetSchema = exports.insertWidgetSchema = exports.insertDashboardSchema = exports.insertWidgetTemplateSchema = exports.dashboardWithWidgetsSchema = exports.dashboardSchema = exports.widgetSchema = exports.widgetTemplateSchema = exports.widgets = exports.dashboards = exports.widgetTemplates = exports.widgetPositionSchema = void 0;
const zod_1 = require("zod");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Widget position schema
exports.widgetPositionSchema = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    width: zod_1.z.number(),
    height: zod_1.z.number()
});
// Widget schema - Database tables
exports.widgetTemplates = (0, pg_core_1.pgTable)("widget_templates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    type: (0, pg_core_1.text)("type").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    defaultConfig: (0, pg_core_1.jsonb)("default_config").notNull(),
    defaultWidth: (0, pg_core_1.integer)("default_width").notNull(),
    defaultHeight: (0, pg_core_1.integer)("default_height").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.dashboards = (0, pg_core_1.pgTable)("dashboards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.widgets = (0, pg_core_1.pgTable)("widgets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    dashboardId: (0, pg_core_1.integer)("dashboard_id").notNull().references(() => exports.dashboards.id),
    type: (0, pg_core_1.text)("type").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    positionX: (0, pg_core_1.integer)("position_x").notNull(),
    positionY: (0, pg_core_1.integer)("position_y").notNull(),
    width: (0, pg_core_1.integer)("width").notNull(),
    height: (0, pg_core_1.integer)("height").notNull(),
    config: (0, pg_core_1.jsonb)("config").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Zod Schemas
exports.widgetTemplateSchema = zod_1.z.object({
    id: zod_1.z.number(),
    type: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    defaultConfig: zod_1.z.record(zod_1.z.any()),
    defaultWidth: zod_1.z.number(),
    defaultHeight: zod_1.z.number(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.widgetSchema = zod_1.z.object({
    id: zod_1.z.number(),
    userId: zod_1.z.number(),
    dashboardId: zod_1.z.number(),
    type: zod_1.z.string(),
    name: zod_1.z.string(),
    positionX: zod_1.z.number(),
    positionY: zod_1.z.number(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
    config: zod_1.z.record(zod_1.z.any()),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.dashboardSchema = zod_1.z.object({
    id: zod_1.z.number(),
    userId: zod_1.z.number(),
    name: zod_1.z.string(),
    isDefault: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.dashboardWithWidgetsSchema = exports.dashboardSchema.extend({
    widgets: zod_1.z.array(exports.widgetSchema)
});
// Insert schemas from Drizzle
exports.insertWidgetTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.widgetTemplates).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.insertDashboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dashboards).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.insertWidgetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.widgets).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
// Update schema
exports.updateWidgetSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    positionX: zod_1.z.number().optional(),
    positionY: zod_1.z.number().optional(),
    width: zod_1.z.number().optional(),
    height: zod_1.z.number().optional(),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional()
});
