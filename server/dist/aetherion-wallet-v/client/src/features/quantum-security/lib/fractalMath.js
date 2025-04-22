"use strict";
/**
 * Fractal Mathematics Library
 *
 * Provides mathematical functions for implementing fractal reward distributions
 * following Fibonacci, Mandelbrot, and Torus patterns with Christ Consciousness
 * principles (equity between early and late adopters, rewarding good stewardship).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fibonacciSequence = fibonacciSequence;
exports.goldenRatio = goldenRatio;
exports.mandelbrotIteration2D = mandelbrotIteration2D;
exports.mandelbrotIteration = mandelbrotIteration;
exports.torusKnot = torusKnot;
exports.merkleGrowthFactor = merkleGrowthFactor;
exports.flowerOfLifePattern = flowerOfLifePattern;
exports.stewardshipMultiplier = stewardshipMultiplier;
/**
 * Generates the nth number in the Fibonacci sequence
 * Used for network growth calculations
 * @param n The position in sequence (0-indexed)
 * @returns The Fibonacci number
 */
function fibonacciSequence(n) {
    if (n <= 0)
        return 0;
    if (n === 1)
        return 1;
    let a = 0;
    let b = 1;
    let temp;
    for (let i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
/**
 * Calculates the golden ratio φ (phi) for a given sequence depth
 * Used for harmonious distribution patterns
 * @param depth The calculation depth
 * @returns Approximation of golden ratio
 */
function goldenRatio(depth = 10) {
    if (depth <= 0)
        return 1.618; // Default golden ratio
    let a = 1;
    let b = 1;
    let temp;
    for (let i = 2; i <= depth; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return b / a;
}
/**
 * Performs a Mandelbrot set iteration calculation for 2D coordinates
 * Used for recursive growth patterns
 * @param x X-coordinate in Mandelbrot space
 * @param y Y-coordinate in Mandelbrot space
 * @param maxIterations Maximum iterations to perform
 * @returns Normalized iteration count (0-1)
 */
function mandelbrotIteration2D(x, y, maxIterations = 20) {
    let realPart = 0;
    let imaginaryPart = 0;
    let i = 0;
    while (i < maxIterations && realPart * realPart + imaginaryPart * imaginaryPart < 4) {
        const tempReal = realPart * realPart - imaginaryPart * imaginaryPart + x;
        imaginaryPart = 2 * realPart * imaginaryPart + y;
        realPart = tempReal;
        i++;
    }
    // Normalize result to 0-1 range
    return i / maxIterations;
}
/**
 * Calculates a single Mandelbrot iteration for a given position
 * Simplified for reward calculation with a single parameter
 * @param position Normalized position (0-1)
 * @param complexity Complexity factor (higher = more iterations)
 * @returns Normalized result (0-1)
 */
function mandelbrotIteration(position, complexity = 0.5) {
    const x = position * 2 - 1.5; // Map 0-1 to -1.5 to 0.5 (interesting Mandelbrot region)
    const y = (position * position) * 0.5; // Parabolic mapping for y
    const iterations = Math.floor(complexity * 30) + 10; // 10-40 iterations based on complexity
    let zr = 0;
    let zi = 0;
    let i = 0;
    while (i < iterations && zr * zr + zi * zi < 4) {
        const temp = zr * zr - zi * zi + x;
        zi = 2 * zr * zi + y;
        zr = temp;
        i++;
    }
    // Create a smooth gradient from 0.5 to 1.5
    const result = i / iterations;
    return 0.5 + result;
}
/**
 * Calculates a point on a torus knot pattern
 * Used to create harmonious reward flow patterns
 * @param t Parameter along the knot (0-1)
 * @param scale Scale factor for the knot
 * @returns Value representing position on torus knot
 */
function torusKnot(t, scale = 1) {
    // Using p=2, q=3 torus knot (trefoil knot)
    const p = 2;
    const q = 3;
    const theta = t * Math.PI * 2;
    // Calculate point on torus knot
    const r = Math.cos(q * theta) + 2;
    const factor = (Math.sin(p * theta) * Math.cos(q * theta) + 1) / 2;
    // Scale and normalize result (0.8-1.2 range for gentle scaling)
    return 0.8 + (factor * 0.4) * scale;
}
/**
 * Calculates the Merkle root hash growth factor
 * Used to represent data integrity in the reward system
 * @param depth Tree depth (network size logarithm)
 * @param balance Balance factor (0-1, higher values favor deeper trees)
 * @returns Growth factor for rewards
 */
function merkleGrowthFactor(depth, balance = 0.5) {
    // Basic logarithmic growth with golden ratio influence
    const baseGrowth = Math.log2(depth + 1) / Math.log2(100);
    const phi = goldenRatio(Math.floor(depth / 10));
    // Apply balance factor - higher balance values favor later network participants
    // This implements "the first shall be last, the last shall be first" principle
    const balancedGrowth = baseGrowth * (1 - balance) + (phi / depth) * balance;
    // Normalize to a 0.5-1.5 range for gentle scaling
    return 0.5 + balancedGrowth;
}
/**
 * Creates a recursive reward pattern following the Flower of Life geometry
 * @param position Position in the network (0-1, normalized index)
 * @param networkSize Current size of the network
 * @returns Scaling factor for rewards
 */
function flowerOfLifePattern(position, networkSize) {
    // Basic seed of life pattern is composed of 7 circles
    const seedSegments = 7;
    // Map position to rotational position in seed of life
    const angle = position * Math.PI * 2;
    // Calculate distance from center based on network size
    // As network grows, pattern expands outward
    const networkRadius = Math.log10(networkSize + 10) / 2;
    // Calculate position on seed of life
    const r = networkRadius * (0.8 + 0.2 * Math.sin(seedSegments * angle));
    // Create circular flow pattern
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    // Calculate distance from optimal points in flower pattern
    const distFromOptimal = Math.sin(Math.sqrt(x * x + y * y) * Math.PI) * 0.5 + 0.5;
    // Apply golden ratio scaling
    const phi = goldenRatio();
    const scaleFactor = 1 + (distFromOptimal - 0.5) / phi;
    return scaleFactor;
}
/**
 * Calculate reward multiplier based on spiritual stewardship factors
 * Implements "the good steward is rewarded" principle
 * @param stewardshipScore User's stewardship score (0-1)
 * @returns Reward multiplier
 */
function stewardshipMultiplier(stewardshipScore) {
    // Apply nonlinear growth to reward good stewards more significantly
    // Matthew 25:29 - "For whoever has will be given more, and they will have an abundance"
    return Math.pow(stewardshipScore, 1.5) * 3 + 1;
}
