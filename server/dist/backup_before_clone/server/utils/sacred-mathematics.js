"use strict";
/**
 * Sacred Mathematics Utilities
 *
 * This file provides mathematical utilities related to sacred geometry
 * and divine patterns for use in the Aetherion ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFibonacciSequence = generateFibonacciSequence;
exports.calculateGoldenRatio = calculateGoldenRatio;
exports.generatePiSegmentedKey = generatePiSegmentedKey;
exports.generatePiDigits = generatePiDigits;
exports.calculateVesicaPiscisRatio = calculateVesicaPiscisRatio;
exports.calculateFlowerOfLifeGrid = calculateFlowerOfLifeGrid;
exports.calculateMetatronsCube = calculateMetatronsCube;
exports.calculateNoteFrequency = calculateNoteFrequency;
exports.calculateSolfeggioFrequency = calculateSolfeggioFrequency;
exports.calculatePythagoreanComma = calculatePythagoreanComma;
exports.calculatePhi = calculatePhi;
exports.generateHarmonicSeries = generateHarmonicSeries;
exports.calculateDivineProportionSequence = calculateDivineProportionSequence;
/**
 * Generates a Fibonacci sequence up to a specified length
 * @param length The number of elements in the sequence
 * @returns Array containing the Fibonacci sequence
 */
function generateFibonacciSequence(length) {
    if (length <= 0)
        return [];
    if (length === 1)
        return [1];
    const sequence = [1, 1];
    for (let i = 2; i < length; i++) {
        sequence[i] = sequence[i - 1] + sequence[i - 2];
    }
    return sequence;
}
/**
 * Calculates the Golden Ratio (φ)
 * The divine proportion found throughout nature and sacred geometry
 * @returns The Golden Ratio (approximately 1.618033988749895)
 */
function calculateGoldenRatio() {
    return (1 + Math.sqrt(5)) / 2;
}
/**
 * Generates a key based on segments of Pi
 * Pi is a transcendental number with divine significance
 * @param seed Seed value to determine which segments of Pi to use
 * @returns A string representing the Pi-segmented key
 */
function generatePiSegmentedKey(seed) {
    // First 1000 digits of Pi (excluding the 3 before the decimal)
    const piDigits = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
    // Generate a numeric value from the seed
    const seedValue = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    // Use the seed value to determine which segments of Pi to use
    const segments = [];
    let segmentLength = 7; // Length of each segment
    for (let i = 0; i < 5; i++) {
        const startPos = (seedValue + i * 83) % (piDigits.length - segmentLength);
        segments.push(piDigits.substring(startPos, startPos + segmentLength));
    }
    // Join the segments with separators based on their positions in the golden ratio sequence
    const goldenRatioSequence = generateFibonacciGoldenRatioSequence(5);
    const separators = ['-', '~', '_', '=', '.'];
    let key = segments[0];
    for (let i = 1; i < segments.length; i++) {
        const separatorIndex = Math.floor(goldenRatioSequence[i] * 10) % separators.length;
        key += separators[separatorIndex] + segments[i];
    }
    return key;
}
/**
 * Generates a sequence of numbers approaching the Golden Ratio
 * @param length The number of elements in the sequence
 * @returns Array containing the sequence of ratios
 */
function generateFibonacciGoldenRatioSequence(length) {
    if (length <= 0)
        return [];
    if (length === 1)
        return [1];
    const fibonacci = generateFibonacciSequence(length + 1);
    const sequence = [];
    for (let i = 1; i < fibonacci.length; i++) {
        sequence.push(fibonacci[i] / fibonacci[i - 1]);
    }
    return sequence;
}
/**
 * Generates the first n digits of Pi
 * Used for when more precise Pi values are needed
 * @param digits Number of digits to generate (including the 3 before the decimal)
 * @returns Pi to the specified number of digits
 */
function generatePiDigits(digits) {
    if (digits <= 0)
        return "";
    if (digits === 1)
        return "3";
    // This is a simplified version - in reality, calculating arbitrary digits of Pi
    // requires more sophisticated algorithms like the Bailey–Borwein–Plouffe formula
    return "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
}
/**
 * Calculates the Vesica Piscis ratio
 * A sacred geometric figure formed by the intersection of two circles
 * @returns The Vesica Piscis ratio (√3)
 */
function calculateVesicaPiscisRatio() {
    return Math.sqrt(3);
}
/**
 * Calculates the Flower of Life grid coordinates
 * The Flower of Life is a sacred geometry pattern composed of multiple evenly-spaced, overlapping circles
 * @param rings Number of rings in the Flower of Life pattern
 * @returns Array of [x, y] coordinates for circle centers
 */
function calculateFlowerOfLifeGrid(rings) {
    // This would be a complex implementation involving hexagonal grid calculations
    // For demonstration purposes, we'll return a simplified version
    const coordinates = [];
    const centerX = 0;
    const centerY = 0;
    const radius = 1;
    // Add center circle
    coordinates.push([centerX, centerY]);
    // Add first ring (6 circles)
    if (rings >= 1) {
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            coordinates.push([
                centerX + radius * 2 * Math.cos(angle),
                centerY + radius * 2 * Math.sin(angle)
            ]);
        }
    }
    // In a full implementation, we would continue adding more rings
    return coordinates;
}
/**
 * Calculates the Metatron's Cube vertex coordinates
 * Metatron's Cube is a sacred geometry figure that contains all 5 Platonic solids
 * @returns Object containing vertex coordinates for the Metatron's Cube
 */
function calculateMetatronsCube() {
    // This would be a complex implementation involving 3D geometry
    // For demonstration purposes, we'll return a simplified 2D projection
    const vertices = [];
    const centerX = 0;
    const centerY = 0;
    const radius = 1;
    // Add center point
    vertices.push([centerX, centerY]);
    // Add inner ring (6 vertices)
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        vertices.push([
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        ]);
    }
    // Add outer ring (6 vertices)
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        vertices.push([
            centerX + radius * 2 * Math.cos(angle),
            centerY + radius * 2 * Math.sin(angle)
        ]);
    }
    // Define edges (connections between vertices)
    // This is a simplified version of the full Metatron's Cube
    const edges = [
        // Connect center to inner ring
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
        // Connect inner ring (hexagon)
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
        // Connect inner ring to outer ring
        [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
        // Connect outer ring (hexagon)
        [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7]
    ];
    return { vertices, edges };
}
/**
 * Calculates the frequency for a specific musical note
 * based on sacred sound principles
 * @param note The note name (e.g., 'A', 'C#')
 * @param octave The octave number
 * @returns The frequency in Hz
 */
function calculateNoteFrequency(note, octave) {
    // Reference frequencies (A4 = 432 Hz instead of standard 440 Hz for sacred tuning)
    const A4 = 432;
    const A4_OCTAVE = 4;
    // Note values relative to A
    const noteValues = {
        'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6,
        'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1,
        'Ab': -1, 'A': 0, 'A#': 1, 'Bb': 1, 'B': 2
    };
    if (!(note in noteValues)) {
        throw new Error(`Invalid note: ${note}`);
    }
    // Calculate semitone distance from A4
    const semitonesFromA4 = 12 * (octave - A4_OCTAVE) + noteValues[note];
    // Calculate frequency using equal temperament formula: f = f0 * 2^(n/12)
    const frequency = A4 * Math.pow(2, semitonesFromA4 / 12);
    return frequency;
}
/**
 * Calculates Solfeggio frequencies used in sacred music and healing
 * @param index Index of the frequency (0-8 for the 9 main Solfeggio frequencies)
 * @returns The Solfeggio frequency in Hz
 */
function calculateSolfeggioFrequency(index) {
    // The 9 main Solfeggio frequencies
    const frequencies = [
        174, // Reducing pain
        285, // Influence on energy field
        396, // Liberating guilt and fear
        417, // Undoing situations and facilitating change
        528, // Transformation and miracles (DNA repair)
        639, // Connecting/relationships
        741, // Awakening intuition
        852, // Returning to spiritual order
        963 // Connecting to the spiritual light and cosmic consciousness
    ];
    if (index < 0 || index >= frequencies.length) {
        throw new Error(`Invalid Solfeggio frequency index: ${index}`);
    }
    return frequencies[index];
}
/**
 * Calculates the Pythagorean comma
 * The difference between 12 perfect fifths and 7 octaves
 * @returns The Pythagorean comma ratio
 */
function calculatePythagoreanComma() {
    // 12 perfect fifths: (3/2)^12
    const twelveFifths = Math.pow(3 / 2, 12);
    // 7 octaves: 2^7
    const sevenOctaves = Math.pow(2, 7);
    // The Pythagorean comma is the ratio between these values
    return twelveFifths / sevenOctaves;
}
/**
 * Calculates the sacred geometrical value of Phi
 * @param n The precision level (number of iterations)
 * @returns Phi calculated through an iterative process
 */
function calculatePhi(n) {
    if (n <= 0)
        return 1;
    // Calculate Phi through continued fraction
    return 1 + 1 / calculatePhi(n - 1);
}
/**
 * Generates a series of harmonic frequencies based on a fundamental frequency
 * @param fundamental The fundamental frequency in Hz
 * @param harmonics Number of harmonics to generate
 * @returns Array of harmonic frequencies
 */
function generateHarmonicSeries(fundamental, harmonics) {
    const series = [fundamental];
    for (let i = 2; i <= harmonics; i++) {
        series.push(fundamental * i);
    }
    return series;
}
/**
 * Calculates the first n terms of the divine proportion sequence
 * Also known as the Fibonacci Sequence divided by its predecessor
 * @param terms Number of terms to calculate
 * @returns Array containing the divine proportion sequence
 */
function calculateDivineProportionSequence(terms) {
    if (terms <= 0)
        return [];
    const fibonacci = generateFibonacciSequence(terms + 1);
    const sequence = [];
    for (let i = 1; i < fibonacci.length; i++) {
        sequence.push(fibonacci[i] / fibonacci[i - 1]);
    }
    return sequence;
}
