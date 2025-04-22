"use strict";
/**
 * Bot Simulation Utilities
 *
 * Helper functions for the Aetherion bot simulation system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomInt = getRandomInt;
exports.getRandomElement = getRandomElement;
exports.sleep = sleep;
exports.generateRandomWalletAddress = generateRandomWalletAddress;
exports.getRandomDate = getRandomDate;
exports.formatNumber = formatNumber;
exports.formatCurrency = formatCurrency;
exports.getRandomBoolean = getRandomBoolean;
exports.shuffleArray = shuffleArray;
exports.generateTransactionHash = generateTransactionHash;
exports.deepClone = deepClone;
/**
 * Get a random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Get a random element from an array
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Generate a random wallet address
 */
function generateRandomWalletAddress() {
    return `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`;
}
/**
 * Get a random date between start and end
 */
function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
/**
 * Format number with commas as thousands separator
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * Format currency amount
 */
function formatCurrency(amount, currency = 'ATC') {
    return `${formatNumber(amount)} ${currency}`;
}
/**
 * Get a random boolean with a specified probability
 */
function getRandomBoolean(probability = 0.5) {
    return Math.random() < probability;
}
/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
/**
 * Generate a random transaction hash
 */
function generateTransactionHash() {
    const characters = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return hash;
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
