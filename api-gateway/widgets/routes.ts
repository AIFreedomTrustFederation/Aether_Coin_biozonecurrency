import { Router, Request, Response } from 'express';
import { WIDGET_TEMPLATES, DEFAULT_DASHBOARD, DEMO_WIDGETS, getWidgetCategories } from './data';
import { z } from 'zod';

const router = Router();

/**
 * @route GET /api/gateway/widgets/templates
 * @desc Get all widget templates
 */
router.get('/templates', (req: Request, res: Response) => {
  res.json(WIDGET_TEMPLATES);
});

/**
 * @route GET /api/gateway/widgets/templates/categories
 * @desc Get all widget template categories
 */
router.get('/templates/categories', (req: Request, res: Response) => {
  res.json(getWidgetCategories());
});

/**
 * @route GET /api/gateway/widgets/templates/category/:category
 * @desc Get widget templates by category
 */
router.get('/templates/category/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const templates = WIDGET_TEMPLATES.filter(t => t.category === category);
  res.json(templates);
});

/**
 * @route GET /api/gateway/widgets/templates/:id
 * @desc Get a specific widget template
 */
router.get('/templates/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const template = WIDGET_TEMPLATES.find(t => t.id === id);
  
  if (!template) {
    return res.status(404).json({ message: 'Widget template not found' });
  }
  
  res.json(template);
});

/**
 * @route GET /api/gateway/widgets/dashboards
 * @desc Get default dashboard for user
 */
router.get('/dashboards', (req: Request, res: Response) => {
  const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
  
  // For demo, return the default dashboard with its widgets
  const dashboard = { ...DEFAULT_DASHBOARD, userId };
  const widgets = DEMO_WIDGETS.filter(w => w.dashboardId === dashboard.id);
  
  res.json({
    ...dashboard,
    widgets
  });
});

/**
 * @route GET /api/gateway/widgets/dashboards/:id
 * @desc Get a specific dashboard with its widgets
 */
router.get('/dashboards/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
  
  // For demo, return the default dashboard with modified ID
  const dashboard = { ...DEFAULT_DASHBOARD, id, userId };
  const widgets = DEMO_WIDGETS.filter(w => w.dashboardId === dashboard.id);
  
  res.json({
    ...dashboard,
    widgets
  });
});

/**
 * @route POST /api/gateway/widgets/dashboards
 * @desc Create a new dashboard
 */
router.post('/dashboards', (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.number(),
    name: z.string(),
    isDefault: z.boolean().optional(),
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
router.get('/widgets', (req: Request, res: Response) => {
  const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
  const dashboardId = req.query.dashboardId ? parseInt(req.query.dashboardId as string) : null;
  
  let widgets = DEMO_WIDGETS.filter(w => w.userId === userId);
  
  if (dashboardId) {
    widgets = widgets.filter(w => w.dashboardId === dashboardId);
  }
  
  res.json(widgets);
});

/**
 * @route GET /api/gateway/widgets/widgets/:id
 * @desc Get a specific widget
 */
router.get('/widgets/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const widget = DEMO_WIDGETS.find(w => w.id === id);
  
  if (!widget) {
    return res.status(404).json({ message: 'Widget not found' });
  }
  
  res.json(widget);
});

/**
 * @route POST /api/gateway/widgets/widgets
 * @desc Create a new widget
 */
router.post('/widgets', (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.number(),
    dashboardId: z.number(),
    type: z.string(),
    name: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    config: z.record(z.any()),
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
router.patch('/widgets/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const widgetIndex = DEMO_WIDGETS.findIndex(w => w.id === id);
  
  if (widgetIndex === -1) {
    return res.status(404).json({ message: 'Widget not found' });
  }
  
  const schema = z.object({
    name: z.string().optional(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
    config: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
  });
  
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }
  
  // Create a clone of the widget and apply updates
  const updatedWidget = {
    ...DEMO_WIDGETS[widgetIndex],
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
router.delete('/widgets/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const widgetIndex = DEMO_WIDGETS.findIndex(w => w.id === id);
  
  if (widgetIndex === -1) {
    return res.status(404).json({ message: 'Widget not found' });
  }
  
  // In a real app, this would delete the record from the database
  res.json({ success: true, message: 'Widget deleted successfully' });
});

export default router;