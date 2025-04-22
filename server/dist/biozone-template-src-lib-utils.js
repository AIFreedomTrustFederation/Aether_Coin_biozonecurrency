"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.truncateString = truncateString;
exports.formatAddress = formatAddress;
exports.delay = delay;
exports.getRandomItem = getRandomItem;
exports.generateId = generateId;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
/**
 * Combines class names with Tailwind CSS utility classes
 */
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
/**
 * Formats a number as a currency string
 */
function formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
}
/**
 * Formats a date string
 */
function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
}
/**
 * Truncates a string to a specified length
 */
function truncateString(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return `${str.slice(0, maxLength)}...`;
}
/**
 * Formats a blockchain address by truncating the middle
 */
function formatAddress(address) {
    if (!address)
        return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
/**
 * Adds a delay using a promise
 */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Gets a random item from an array
 */
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
/**
 * Generates a unique ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
