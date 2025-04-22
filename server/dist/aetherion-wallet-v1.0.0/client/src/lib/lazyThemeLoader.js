"use strict";
/**
 * Utility for lazily loading theme styles and effects
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeThemeLoader = exports.getThemeChunks = exports.loadThemeStyles = void 0;
// Track loaded themes to avoid duplicate loading
const loadedThemes = {};
/**
 * Dynamically load theme CSS
 * @param themeName The name/identifier of the theme to load
 * @returns Promise that resolves when the theme is loaded
 */
const loadThemeStyles = async (themeName) => {
    // If already loaded, don't reload
    if (loadedThemes[themeName]) {
        return;
    }
    try {
        // We'll use different approaches based on theme type
        switch (themeName) {
            case 'neon-base':
                // Base neon effects (loaded by default now)
                loadedThemes[themeName] = true;
                break;
            case 'neon-advanced':
                // Advanced neon effects (glows, animations, etc.)
                await Promise.resolve().then(() => __importStar(require('../styles/neon-advanced.css')));
                loadedThemes[themeName] = true;
                break;
            case 'neon-animations':
                // Heavy animations for neon effects
                await Promise.resolve().then(() => __importStar(require('../styles/neon-animations.css')));
                loadedThemes[themeName] = true;
                break;
            default:
                console.warn(`Unknown theme: ${themeName}`);
        }
    }
    catch (error) {
        console.error(`Failed to load theme: ${themeName}`, error);
    }
};
exports.loadThemeStyles = loadThemeStyles;
/**
 * Get necessary theme chunks based on the selected theme
 * @param themeId The theme ID from the theme context
 * @returns Array of theme chunk names to load
 */
const getThemeChunks = (themeId) => {
    // Different themes require different chunks
    if (themeId.startsWith('neon-')) {
        return ['neon-base', 'neon-advanced'];
    }
    // Default theme needs only basic styling
    return ['neon-base'];
};
exports.getThemeChunks = getThemeChunks;
/**
 * Initialize essential theme parts immediately,
 * defer loading of non-critical theme components
 */
const initializeThemeLoader = () => {
    // Register theme loaded observer
    if ('requestIdleCallback' in window) {
        // Load advanced theme features when browser is idle
        window.requestIdleCallback(() => {
            (0, exports.loadThemeStyles)('neon-advanced');
        });
        // After everything else is loaded, consider animations
        window.addEventListener('load', () => {
            window.requestIdleCallback(() => {
                (0, exports.loadThemeStyles)('neon-animations');
            }, { timeout: 2000 }); // 2 second timeout as fallback
        });
    }
    else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            (0, exports.loadThemeStyles)('neon-advanced');
            // After a longer delay, load animations
            setTimeout(() => {
                (0, exports.loadThemeStyles)('neon-animations');
            }, 2000);
        }, 1000);
    }
};
exports.initializeThemeLoader = initializeThemeLoader;
