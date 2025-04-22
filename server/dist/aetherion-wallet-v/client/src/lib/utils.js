"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.nanoid = nanoid;
exports.isMobile = isMobile;
exports.getMobileOS = getMobileOS;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
// Simple function to generate a random ID
function nanoid(length = 8) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
/**
 * Detect if current device is a mobile device
 */
function isMobile() {
    if (typeof navigator === 'undefined')
        return false;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouchPoints = navigator.maxTouchPoints ? navigator.maxTouchPoints > 2 : false;
    return isMobileDevice || hasTouchPoints;
}
/**
 * Detect specific mobile OS
 */
function getMobileOS() {
    if (typeof navigator === 'undefined')
        return 'other';
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    return 'other';
}
