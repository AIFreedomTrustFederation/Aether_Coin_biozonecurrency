"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWidgetStore = void 0;
const zustand_1 = __importDefault(require("zustand"));
const utils_1 = require("./utils");
// Create the store
exports.useWidgetStore = (0, zustand_1.default)((set) => ({
    widgets: [],
    selectedWidgetId: null,
    // Add a new widget
    addWidget: (widget) => set((state) => ({
        widgets: [...state.widgets, {
                ...widget,
                id: widget.id || `widget-${(0, utils_1.nanoid)()}`
            }]
    })),
    // Update a widget
    updateWidget: (id, updates) => set((state) => ({
        widgets: state.widgets.map((widget) => widget.id === id
            ? {
                ...widget,
                ...updates,
                config: { ...widget.config, ...(updates.config || {}) }
            }
            : widget)
    })),
    // Remove a widget
    removeWidget: (id) => set((state) => ({
        widgets: state.widgets.filter((widget) => widget.id !== id),
        selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId
    })),
    // Select a widget
    selectWidget: (id) => set(() => ({
        selectedWidgetId: id
    })),
    // Move a widget
    moveWidget: (id, position) => set((state) => ({
        widgets: state.widgets.map((widget) => widget.id === id
            ? {
                ...widget,
                position: { ...widget.position, ...position }
            }
            : widget)
    })),
    // Resize a widget
    resizeWidget: (id, size) => set((state) => ({
        widgets: state.widgets.map((widget) => widget.id === id
            ? {
                ...widget,
                position: {
                    ...widget.position,
                    w: size.w,
                    h: size.h
                }
            }
            : widget)
    })),
}));
