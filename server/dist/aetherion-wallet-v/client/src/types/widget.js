"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWidgetType = isWidgetType;
// Type guard to check if a widget is of a specific type
function isWidgetType(widget, type) {
    return widget.type === type;
}
