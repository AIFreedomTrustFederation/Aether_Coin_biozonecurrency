"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const widgets_1 = __importDefault(require("./widgets"));
const router = (0, express_1.Router)();
// Version the API for future expansion
const apiVersion = 'v1';
// Add health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', version: apiVersion });
});
// Register widget system routes
router.use('/widgets', widgets_1.default);
// Future API gateway routes can be added here
// For example:
// router.use('/ai', aiRouter);
// router.use('/matrix', matrixRouter);
// router.use('/quantum', quantumRouter);
exports.default = router;
