"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
            '@components': path_1.default.resolve(__dirname, './src/components'),
            '@lib': path_1.default.resolve(__dirname, './src/lib'),
            '@assets': path_1.default.resolve(__dirname, './src/assets'),
            '@hooks': path_1.default.resolve(__dirname, './src/hooks'),
            '@pages': path_1.default.resolve(__dirname, './src/pages'),
            '@services': path_1.default.resolve(__dirname, './src/services'),
        },
    },
});
