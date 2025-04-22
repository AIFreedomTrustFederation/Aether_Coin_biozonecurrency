"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_swc_1 = __importDefault(require("@vitejs/plugin-react-swc"));
const path_1 = __importDefault(require("path"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)(({ mode }) => ({
    server: {
        host: "0.0.0.0",
        port: 5173,
        hmr: {
            protocol: 'ws',
            host: '0.0.0.0',
            port: 5173
        }
    },
    plugins: [
        (0, plugin_react_swc_1.default)(),
        // Removed lovable-tagger dependency
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path_1.default.resolve(__dirname, "./src"),
            "@assets": path_1.default.resolve(__dirname, "../attached_assets"),
        },
    },
}));
