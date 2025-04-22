"use strict";
/**
 * Fractal Algorithms for AetherCoin BioZoeCurrency
 *
 * Core mathematical functions implementing Mandelbrot set, Fibonacci sequence,
 * Golden Ratio, and Toroidal flow calculations for the BioZoeCurrency system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GROWTH_PARAMETERS = exports.PI = exports.GOLDEN_RATIO = void 0;
exports.generateFibonacciSequence = generateFibonacciSequence;
exports.getFibonacciNumber = getFibonacciNumber;
exports.calculateMandelbrotIterations = calculateMandelbrotIterations;
exports.getMandelbrotPotential = getMandelbrotPotential;
exports.calculateTokenGrowth = calculateTokenGrowth;
exports.calculateToroidalPosition = calculateToroidalPosition;
exports.generateMandelbrotPosition = generateMandelbrotPosition;
exports.calculateToroidalFlow = calculateToroidalFlow;
exports.generateTokenDNA = generateTokenDNA;
exports.getLifecycleTransitionThreshold = getLifecycleTransitionThreshold;
exports.calculateLifecycleProgress = calculateLifecycleProgress;
exports.calculateEntanglementStrengthGrowth = calculateEntanglementStrengthGrowth;
exports.calculateTokenColor = calculateTokenColor;
const types_1 = require("./types");
// Mathematical constants
exports.GOLDEN_RATIO = 1.618033988749895;
exports.PI = 3.141592653589793;
// Maximum iterations for Mandelbrot calculations
const MAX_MANDELBROT_ITERATIONS = 1000;
// Default growth parameters
exports.DEFAULT_GROWTH_PARAMETERS = {
    lifecycleThresholds: {
        [types_1.BioZoeLifecycleState.SEED]: 1.5, // Growth threshold for seed
        [types_1.BioZoeLifecycleState.GROWTH]: 3.0, // Flowering threshold for growth
        [types_1.BioZoeLifecycleState.FLOWERING]: 5.0, // Legacy threshold for flowering
        [types_1.BioZoeLifecycleState.LEGACY]: 10.0 // Just for completeness
    },
    mandelbrotGrowthFactor: 0.05, // How much Mandelbrot position affects growth
    entanglementAmplification: 0.2, // How much entanglement amplifies growth
    fibonacciProgressionRate: 0.1, // Rate of progression through Fibonacci sequence
    mutationProbability: 0.05, // Probability of mutation per block
    toroidalFlowStrength: 0.15, // Strength of toroidal energy flows
    goldenRatioInfluence: 0.618, // Influence of Golden Ratio (φ-1)
    entropicDecayRate: 0.01 // Rate of entropy increase
};
/**
 * Generate a Fibonacci sequence up to the specified number of elements
 * @param count Number of elements
 * @returns Array containing the Fibonacci sequence
 */
function generateFibonacciSequence(count) {
    if (count <= 0)
        return [];
    if (count === 1)
        return [1];
    if (count === 2)
        return [1, 1];
    const sequence = [1, 1];
    for (let i = 2; i < count; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
}
/**
 * Get the nth Fibonacci number
 * @param n Position in Fibonacci sequence (1-based)
 * @returns The nth Fibonacci number
 */
function getFibonacciNumber(n) {
    if (n <= 0)
        return 0;
    if (n === 1 || n === 2)
        return 1;
    let a = 1, b = 1;
    for (let i = 3; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
/**
 * Calculate the number of iterations for a point to escape the Mandelbrot set
 * @param real Real part of complex number
 * @param imag Imaginary part of complex number
 * @returns Number of iterations before escape (or MAX_ITERATIONS)
 */
function calculateMandelbrotIterations(real, imag) {
    let zReal = 0;
    let zImag = 0;
    let iteration = 0;
    // z = z² + c until |z| > 2 or max iterations reached
    while (zReal * zReal + zImag * zImag <= 4 && iteration < MAX_MANDELBROT_ITERATIONS) {
        const nextZReal = zReal * zReal - zImag * zImag + real;
        zImag = 2 * zReal * zImag + imag;
        zReal = nextZReal;
        iteration++;
    }
    return iteration;
}
/**
 * Get Mandelbrot potential based on position
 * Higher values mean closer to the boundary of the set
 * @param real Real part of complex number
 * @param imag Imaginary part of complex number
 * @returns Potential value (0-1 range)
 */
function getMandelbrotPotential(real, imag) {
    const iterations = calculateMandelbrotIterations(real, imag);
    // If inside the set, return 0
    if (iterations === MAX_MANDELBROT_ITERATIONS) {
        return 0;
    }
    // Calculate smooth potential based on escape iterations
    // Higher = closer to boundary
    return 1 - Math.log(iterations) / Math.log(MAX_MANDELBROT_ITERATIONS);
}
/**
 * Calculate token growth based on multiple factors
 * @param age Token age
 * @param lifeState Current lifecycle state
 * @param fibonacciIndex Current position in Fibonacci sequence
 * @param mandelbrotPosition Position in Mandelbrot set
 * @param entanglementStrength Strength of quantum entanglement
 * @param params Growth parameters
 * @returns Updated growth factor
 */
function calculateTokenGrowth(age, lifeState, fibonacciIndex, mandelbrotPosition, entanglementStrength, params) {
    // Base growth from age (logarithmic growth)
    const baseGrowth = Math.log(age + 1) * 0.1;
    // Fibonacci growth factor
    const fibGrowth = getFibonacciNumber(fibonacciIndex) / 1000;
    // Mandelbrot-based growth
    const mandelbrotPotential = getMandelbrotPotential(mandelbrotPosition.re, mandelbrotPosition.im);
    const mandelbrotGrowth = mandelbrotPotential * params.mandelbrotGrowthFactor;
    // Entanglement contribution
    const entanglementGrowth = entanglementStrength * params.entanglementAmplification;
    // Golden Ratio influence (creates cyclical patterns)
    const goldenRatioEffect = Math.sin(age * params.goldenRatioInfluence / exports.GOLDEN_RATIO) * 0.1;
    // State-specific modifiers
    let stateModifier = 1.0;
    switch (lifeState) {
        case types_1.BioZoeLifecycleState.SEED:
            // Seeds grow slowly at first, then accelerate
            stateModifier = 0.5 + (age / 100) * 0.5;
            break;
        case types_1.BioZoeLifecycleState.GROWTH:
            // Growth state has steady growth
            stateModifier = 1.0;
            break;
        case types_1.BioZoeLifecycleState.FLOWERING:
            // Flowering has enhanced growth
            stateModifier = 1.2;
            break;
        case types_1.BioZoeLifecycleState.LEGACY:
            // Legacy tokens grow very slowly
            stateModifier = 0.2;
            break;
    }
    // Combine all factors
    const totalGrowth = (baseGrowth +
        fibGrowth +
        mandelbrotGrowth +
        entanglementGrowth +
        goldenRatioEffect) * stateModifier;
    // Growth should always be positive to ensure progress
    return Math.max(0.01, totalGrowth);
}
/**
 * Calculate toroidal field position from a seed value
 * @param seed Numeric seed
 * @returns Torus coordinates
 */
function calculateToroidalPosition(seed) {
    // Use Golden Ratio to distribute points evenly on torus
    const goldenAngle = exports.GOLDEN_RATIO * 2 * exports.PI;
    // Derive theta angle (around the tube)
    const theta = (seed * goldenAngle) % (2 * exports.PI);
    // Derive phi angle (around the circle)
    const phi = (seed * exports.PI / exports.GOLDEN_RATIO) % (2 * exports.PI);
    return { theta, phi };
}
/**
 * Generate a position in the Mandelbrot set based on a seed
 * @param seed Numeric seed value
 * @returns Position in Mandelbrot set
 */
function generateMandelbrotPosition(seed) {
    // Generate a position that's likely to be in an interesting region
    // Most interesting regions are near the boundary of the Mandelbrot set
    // Use seed to generate a value in the main cardioid or period-2 bulb
    const t = (seed % 1000) / 1000 * 2 * Math.PI;
    let re, im;
    if (seed % 3 === 0) {
        // Main cardioid: z = e^(it)/2 - e^(2it)/4
        re = 0.5 * Math.cos(t) - 0.25 * Math.cos(2 * t);
        im = 0.5 * Math.sin(t) - 0.25 * Math.sin(2 * t);
    }
    else if (seed % 3 === 1) {
        // Period-2 bulb: z = -1 + 0.25*e^(it)
        re = -1 + 0.25 * Math.cos(t);
        im = 0.25 * Math.sin(t);
    }
    else {
        // Slightly randomized position in the complex plane
        re = -0.7 + (seed % 100) / 500;
        im = (seed % 200) / 1000 - 0.1;
    }
    return { re, im };
}
/**
 * Calculate toroidal energy flow at a given position
 * @param position Position on torus
 * @param networkDensity Network density parameter
 * @param params Growth parameters
 * @returns Flow direction and magnitude
 */
function calculateToroidalFlow(position, networkDensity, params) {
    // Calculate base flow direction using position and Golden Ratio
    const baseDirection = (position.theta + position.phi * exports.GOLDEN_RATIO) % (2 * exports.PI);
    // Perturb direction based on network density
    const perturbation = Math.sin(position.phi * 3) * networkDensity * 0.2;
    const direction = (baseDirection + perturbation) % (2 * exports.PI);
    // Calculate flow magnitude using network density and position
    let magnitude = params.toroidalFlowStrength * (0.5 + networkDensity * 0.5);
    // Modify flow based on position (create vortices at specific points)
    // Creates four vortices around the torus
    for (let i = 0; i < 4; i++) {
        const vortexTheta = i * exports.PI / 2;
        const vortexPhi = i * exports.PI / 2;
        // Distance to vortex center
        const thetaDiff = Math.min(Math.abs(position.theta - vortexTheta), 2 * exports.PI - Math.abs(position.theta - vortexTheta));
        const phiDiff = Math.min(Math.abs(position.phi - vortexPhi), 2 * exports.PI - Math.abs(position.phi - vortexPhi));
        const distance = Math.sqrt(thetaDiff * thetaDiff + phiDiff * phiDiff);
        // Vortex effect decreases with distance
        if (distance < exports.PI / 2) {
            // Inside vortex influence
            const vortexStrength = (exports.PI / 2 - distance) / (exports.PI / 2) * 0.5;
            magnitude += vortexStrength;
        }
    }
    return { direction, magnitude };
}
/**
 * Generate a DNA-like sequence for a token based on its properties
 * @param tokenId Token ID
 * @param position Mandelbrot position
 * @param lifecycleState Initial lifecycle state
 * @returns DNA sequence string
 */
function generateTokenDNA(tokenId, position, lifecycleState) {
    // Initialize parts of the DNA
    const dnaBase = tokenId.substring(0, 12); // First part from token ID
    // Convert position to DNA segments
    const posPart = Math.abs(position.re).toFixed(6) + Math.abs(position.im).toFixed(6);
    const positionDNA = posPart.replace(/\./g, '').substring(0, 8);
    // Lifecycle state encoding
    let stateCode;
    switch (lifecycleState) {
        case types_1.BioZoeLifecycleState.SEED:
            stateCode = 'ATGC';
            break;
        case types_1.BioZoeLifecycleState.GROWTH:
            stateCode = 'GCTA';
            break;
        case types_1.BioZoeLifecycleState.FLOWERING:
            stateCode = 'TACG';
            break;
        case types_1.BioZoeLifecycleState.LEGACY:
            stateCode = 'CGAT';
            break;
        default: stateCode = 'ATGC';
    }
    // Generate DNA with segments that encode different properties
    let dna = '';
    // First segment: base ID segment
    dna += dnaBase;
    // Second segment: state code
    dna += '-' + stateCode;
    // Third segment: position encoding
    dna += '-' + positionDNA;
    // Fourth segment: Golden Ratio encoding
    const goldenPart = (exports.GOLDEN_RATIO * 1000000).toString().substring(0, 6);
    dna += '-' + goldenPart;
    return dna;
}
/**
 * Get threshold for transitioning to the next lifecycle state
 * @param state Current lifecycle state
 * @param growthFactor Current growth factor
 * @param age Token age
 * @param params Growth parameters
 * @returns Threshold value for transition
 */
function getLifecycleTransitionThreshold(state, growthFactor, age, params) {
    // Base threshold from parameters
    let threshold = params.lifecycleThresholds[state];
    // Modify based on age
    if (state === types_1.BioZoeLifecycleState.SEED) {
        // Seeds need more time to mature as they age
        threshold -= Math.min(0.5, age / 1000);
    }
    else if (state === types_1.BioZoeLifecycleState.GROWTH) {
        // Growth state has a steady threshold
        threshold += Math.min(0.3, growthFactor / 10);
    }
    else if (state === types_1.BioZoeLifecycleState.FLOWERING) {
        // Flowering threshold increases with age
        threshold += Math.min(1.0, age / 500);
    }
    // Ensure threshold is always positive
    return Math.max(0.1, threshold);
}
/**
 * Calculate lifecycle progress as percentage
 * @param state Current lifecycle state
 * @param growthFactor Current growth factor
 * @param age Token age
 * @param params Growth parameters
 * @returns Progress percentage (0-100)
 */
function calculateLifecycleProgress(state, growthFactor, age, params) {
    const threshold = getLifecycleTransitionThreshold(state, growthFactor, age, params);
    let progress = 0;
    switch (state) {
        case types_1.BioZoeLifecycleState.SEED:
        case types_1.BioZoeLifecycleState.GROWTH:
        case types_1.BioZoeLifecycleState.FLOWERING:
            progress = (growthFactor / threshold) * 100;
            break;
        case types_1.BioZoeLifecycleState.LEGACY:
            // Legacy tokens don't progress to another state, so use age instead
            progress = Math.min(100, (age / 1000) * 100);
            break;
    }
    // Ensure progress is between 0-100
    return Math.min(100, Math.max(0, progress));
}
/**
 * Calculate entanglement strength growth between two tokens
 * @param currentStrength Current entanglement strength
 * @param position1 First token's Mandelbrot position
 * @param position2 Second token's Mandelbrot position
 * @param age Token age
 * @param params Growth parameters
 * @returns New entanglement strength
 */
function calculateEntanglementStrengthGrowth(currentStrength, position1, position2, age, params) {
    // Calculate normalized distance between positions in Mandelbrot set
    const dRe = position1.re - position2.re;
    const dIm = position1.im - position2.im;
    const distance = Math.sqrt(dRe * dRe + dIm * dIm);
    // Closer positions have stronger potential entanglement
    const proximityFactor = 1 / (1 + distance * 5);
    // Calculate growth rate based on golden ratio
    const growthRate = params.entanglementAmplification * proximityFactor * (1 / exports.GOLDEN_RATIO);
    // Apply growth with diminishing returns as strength approaches 1
    const newStrength = currentStrength + growthRate * (1 - currentStrength);
    // Ensure strength is between 0-1
    return Math.min(1, Math.max(0, newStrength));
}
/**
 * Calculate a color for a token based on its properties
 * @param position Mandelbrot position
 * @param state Lifecycle state
 * @param entanglementStrength Entanglement strength
 * @returns CSS color string
 */
function calculateTokenColor(position, state, entanglementStrength) {
    // Get base color from lifecycle state
    let r = 0, g = 0, b = 0;
    switch (state) {
        case types_1.BioZoeLifecycleState.SEED:
            // Green for seed
            r = 50;
            g = 205;
            b = 50;
            break;
        case types_1.BioZoeLifecycleState.GROWTH:
            // Blue-green for growth
            r = 0;
            g = 150;
            b = 200;
            break;
        case types_1.BioZoeLifecycleState.FLOWERING:
            // Purple for flowering
            r = 186;
            g = 85;
            b = 211;
            break;
        case types_1.BioZoeLifecycleState.LEGACY:
            // Blue for legacy
            r = 65;
            g = 105;
            b = 225;
            break;
    }
    // Modify based on Mandelbrot position
    const mandelbrotPotential = getMandelbrotPotential(position.re, position.im);
    const potentialFactor = mandelbrotPotential * 0.3;
    r = Math.min(255, r * (1 + potentialFactor));
    g = Math.min(255, g * (1 + potentialFactor));
    b = Math.min(255, b * (1 + potentialFactor));
    // Modify brightness based on entanglement strength
    const brightnessFactor = 0.7 + entanglementStrength * 0.3;
    r = Math.min(255, r * brightnessFactor);
    g = Math.min(255, g * brightnessFactor);
    b = Math.min(255, b * brightnessFactor);
    // Return as hex color
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
