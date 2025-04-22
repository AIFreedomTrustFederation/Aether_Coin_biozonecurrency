"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
exports.setupVite = setupVite;
exports.serveStatic = serveStatic;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const url_1 = require("url");
const vite_1 = require("vite");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
const vite_config_1 = __importDefault(require("../vite.config"));
const nanoid_1 = require("nanoid");
const viteLogger = (0, vite_1.createLogger)();
function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app, server) {
    const serverOptions = {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
    };
    const vite = await (0, vite_1.createServer)({
        ...vite_config_1.default,
        configFile: false,
        customLogger: {
            ...viteLogger,
            error: (msg, options) => {
                viteLogger.error(msg, options);
                process.exit(1);
            },
        },
        server: serverOptions,
        appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
            const clientTemplate = path_1.default.resolve(__dirname, "..", "client", "index.html");
            // always reload the index.html file from disk incase it changes
            let template = await fs_1.default.promises.readFile(clientTemplate, "utf-8");
            template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${(0, nanoid_1.nanoid)()}"`);
            const page = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        }
        catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
}
function serveStatic(app) {
    const distPath = path_1.default.resolve(__dirname, "public");
    if (!fs_1.default.existsSync(distPath)) {
        throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    app.use(express_1.default.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        res.sendFile(path_1.default.resolve(distPath, "index.html"));
    });
}
