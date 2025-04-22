"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
/**
 * Utility function to merge Tailwind CSS classes
 *
 * Uses clsx and tailwind-merge to handle conditional classes
 * and proper merging of Tailwind utility classes
 */
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
