"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("./data");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @route GET /api/gateway/widgets/templates
 * @desc Get all widget templates
 */
router.get('/templates', (req, res) => {
    res.json(data_1.WIDGET_TEMPLATES);
});
/**
 * @route GET /api/gateway/widgets/templates/categories
 * @desc Get all widget template categories
 */
router.get('/templates/categories', (req, res) => {
    res.json((0, data_1.getWidgetCategories)());
});
/**
 * @route GET /api/gateway/widgets/templates/category/:category
 * @desc Get widget templates by category
 */
router.get('/templates/category/:category', (req, res) => {
    const { category } = req.params;
    const templates = data_1.WIDGET_TEMPLATES.filter(t => t.category === category);
    res.json(templates);
});
/**
 * @route GET /api/gateway/widgets/templates/:id
 * @desc Get a specific widget template
 */
router.get('/templates/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const template = data_1.WIDGET_TEMPLATES.find(t => t.id === id);
    if (!template) {
        return res.status(404).json({ message: 'Widget template not found' });
    }
    res.json(template);
});
/**
 * @route GET /api/gateway/widgets/dashboards
 * @desc Get default dashboard for user
 */
router.get('/dashboards', (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId) : 1;
    // For demo, return the default dashboard with its widgets
    const dashboard = { ...data_1.DEFAULT_DASHBOARD, userId };
    const widgets = data_1.DEMO_WIDGETS.filter(w => w.dashboardId === dashboard.id);
    res.json({
        ...dashboard,
        widgets
    });
});
/**
 * @route GET /api/gateway/widgets/dashboards/:id
 * @desc Get a specific dashboard with its widgets
 */
router.get('/dashboards/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.query.userId ? parseInt(req.query.userId) : 1;
    // For demo, return the default dashboard with modified ID
    const dashboard = { ...data_1.DEFAULT_DASHBOARD, id, userId };
    const widgets = data_1.DEMO_WIDGETS.filter(w => w.dashboardId === dashboard.id);
    res.json({
        ...dashboard,
        widgets
    });
});
/**
 * @route POST /api/gateway/widgets/dashboards
 * @desc Create a new dashboard
 */
router.post('/dashboards', (req, res) => {
    const schema = zod_1.z.object({
        userId: zod_1.z.number(),
        name: zod_1.z.string(),
        isDefault: zod_1.z.boolean().optional(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
    }
    const { userId, name, isDefault = false } = validation.data;
    // In a real app, this would create a record in the database
    const newDashboard = {
        id: Date.now(),
        userId,
        name,
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: []
    };
    res.status(201).json(newDashboard);
});
/**
 * @route GET /api/gateway/widgets/widgets
 * @desc Get widgets (filtered by userId and optionally dashboardId)
 */
router.get('/widgets', (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId) : 1;
    const dashboardId = req.query.dashboardId ? parseInt(req.query.dashboardId) : null;
    let widgets = data_1.DEMO_WIDGETS.filter(w => w.userId === userId);
    if (dashboardId) {
        widgets = widgets.filter(w => w.dashboardId === dashboardId);
    }
    res.json(widgets);
});
/**
 * @route GET /api/gateway/widgets/widgets/:id
 * @desc Get a specific widget
 */
router.get('/widgets/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const widget = data_1.DEMO_WIDGETS.find(w => w.id === id);
    if (!widget) {
        return res.status(404).json({ message: 'Widget not found' });
    }
    res.json(widget);
});
/**
 * @route POST /api/gateway/widgets/widgets
 * @desc Create a new widget
 */
router.post('/widgets', (req, res) => {
    const schema = zod_1.z.object({
        userId: zod_1.z.number(),
        dashboardId: zod_1.z.number(),
        type: zod_1.z.string(),
        name: zod_1.z.string(),
        position: zod_1.z.object({
            x: zod_1.z.number(),
            y: zod_1.z.number(),
            width: zod_1.z.number(),
            height: zod_1.z.number(),
        }),
        config: zod_1.z.record(zod_1.z.any()),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
    }
    const { userId, dashboardId, type, name, position, config } = validation.data;
    // In a real app, this would create a record in the database
    const newWidget = {
        id: Date.now(),
        userId,
        dashboardId,
        type,
        name,
        position,
        config,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    res.status(201).json(newWidget);
});
/**
 * @route PATCH /api/gateway/widgets/widgets/:id
 * @desc Update a widget
 */
router.patch('/widgets/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const widgetIndex = data_1.DEMO_WIDGETS.findIndex(w => w.id === id);
    if (widgetIndex === -1) {
        return res.status(404).json({ message: 'Widget not found' });
    }
    const schema = zod_1.z.object({
        name: zod_1.z.string().optional(),
        position: zod_1.z.object({
            x: zod_1.z.number(),
            y: zod_1.z.number(),
            width: zod_1.z.number(),
            height: zod_1.z.number(),
        }).optional(),
        config: zod_1.z.record(zod_1.z.any()).optional(),
        isActive: zod_1.z.boolean().optional(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
    }
    // Create a clone of the widget and apply updates
    const updatedWidget = {
        ...data_1.DEMO_WIDGETS[widgetIndex],
        ...validation.data,
        updatedAt: new Date()
    };
    // In a real app, this would update the record in the database
    // For demo, we'll return the merged object
    res.json(updatedWidget);
});
/**
 * @route DELETE /api/gateway/widgets/widgets/:id
 * @desc Delete a widget
 */
router.delete('/widgets/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const widgetIndex = data_1.DEMO_WIDGETS.findIndex(w => w.id === id);
    if (widgetIndex === -1) {
        return res.status(404).json({ message: 'Widget not found' });
    }
    // In a real app, this would delete the record from the database
    res.json({ success: true, message: 'Widget deleted successfully' });
});
exports.default = router;
