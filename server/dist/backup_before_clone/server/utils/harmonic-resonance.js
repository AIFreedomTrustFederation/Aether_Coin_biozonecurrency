"use strict";
/**
 * Harmonic Resonance Utilities
 *
 * This file provides utilities for calculating and manipulating harmonic resonance
 * within the Aetherion ecosystem, incorporating principles of Christ Consciousness.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHarmonicResonance = computeHarmonicResonance;
exports.calculateHarmonicAlignment = calculateHarmonicAlignment;
exports.calculateCosmicHarmonicConvergence = calculateCosmicHarmonicConvergence;
const sacred_mathematics_1 = require("./sacred-mathematics");
/**
 * Computes the harmonic resonance between two states
 * Used in the Grafting Protocol to measure alignment
 * @param originalState The original state object
 * @param transmutedState The transmuted state object
 * @returns A resonance value between 0 and 100
 */
function computeHarmonicResonance(originalState, transmutedState) {
    // Calculate based on intention alignment, structural harmony, and divine resonance
    const intentionAlignment = calculateIntentionAlignment(originalState, transmutedState);
    const structuralHarmony = calculateStructuralHarmony(originalState, transmutedState);
    const divineResonance = calculateDivineResonance(transmutedState);
    // Weight the components according to spiritual principles
    const resonance = (intentionAlignment * 0.3) + (structuralHarmony * 0.3) + (divineResonance * 0.4);
    // Return the resonance value clamped between 0 and 100
    return Math.max(0, Math.min(100, resonance));
}
/**
 * Calculates the intention alignment between two states
 * Measures how well the transmutation preserves and elevates the original intention
 * @param originalState The original state object
 * @param transmutedState The transmuted state object
 * @returns An alignment value between 0 and 100
 */
function calculateIntentionAlignment(originalState, transmutedState) {
    // In a real implementation, this would involve complex intention analysis
    // For demonstration, we'll use a simplified approach
    // Extract intention markers from the states
    const originalIntention = extractIntentionMarkers(originalState);
    const transmutedIntention = extractIntentionMarkers(transmutedState);
    // Calculate basic similarity
    const similarityScore = calculateSimilarityScore(originalIntention, transmutedIntention);
    // Calculate elevation factor (how much the intention is elevated in the transmutation)
    const elevationFactor = calculateElevationFactor(originalIntention, transmutedIntention);
    // Combine similarity and elevation for final alignment score
    return (similarityScore * 0.6) + (elevationFactor * 0.4);
}
/**
 * Extracts intention markers from a state object
 * @param state The state object to analyze
 * @returns An object containing extracted intention markers
 */
function extractIntentionMarkers(state) {
    // In a real implementation, this would involve sophisticated intention extraction
    // For demonstration, we'll return a simplified representation
    if (!state)
        return { direction: 0, intensity: 0, purpose: '' };
    // Extract a numerical direction value (if available)
    const direction = typeof state.direction === 'number' ? state.direction :
        typeof state.flow === 'number' ? state.flow :
            typeof state.vector === 'number' ? state.vector :
                (Math.random() * 360); // Default to a random direction if none found
    // Extract an intensity value
    const intensity = typeof state.intensity === 'number' ? state.intensity :
        typeof state.strength === 'number' ? state.strength :
            typeof state.power === 'number' ? state.power :
                (Math.random() * 100); // Default to a random intensity if none found
    // Extract a purpose string
    const purpose = typeof state.purpose === 'string' ? state.purpose :
        typeof state.intention === 'string' ? state.intention :
            typeof state.goal === 'string' ? state.goal :
                ''; // Default to empty string if none found
    return { direction, intensity, purpose };
}
/**
 * Calculates a similarity score between two intention marker sets
 * @param original The original intention markers
 * @param transmuted The transmuted intention markers
 * @returns A similarity score between 0 and 100
 */
function calculateSimilarityScore(original, transmuted) {
    if (!original || !transmuted)
        return 0;
    // Calculate direction similarity (angular difference normalized to 0-100)
    const directionDiff = Math.abs(original.direction - transmuted.direction) % 360;
    const normalizedDirectionDiff = Math.min(directionDiff, 360 - directionDiff) / 180;
    const directionSimilarity = 100 * (1 - normalizedDirectionDiff);
    // Calculate intensity similarity
    const intensityDiff = Math.abs(original.intensity - transmuted.intensity) / 100;
    const intensitySimilarity = 100 * (1 - intensityDiff);
    // Calculate purpose similarity
    let purposeSimilarity = 0;
    if (original.purpose && transmuted.purpose) {
        const originalWords = original.purpose.toLowerCase().split(/\s+/);
        const transmutedWords = transmuted.purpose.toLowerCase().split(/\s+/);
        // Count shared words
        const sharedWords = originalWords.filter(word => transmutedWords.includes(word));
        purposeSimilarity = 100 * (sharedWords.length / Math.max(originalWords.length, 1));
    }
    // Weight the components for final similarity score
    return (directionSimilarity * 0.3) + (intensitySimilarity * 0.3) + (purposeSimilarity * 0.4);
}
/**
 * Calculates an elevation factor between original and transmuted intentions
 * Measures how much the intention is elevated in the transmutation
 * @param original The original intention markers
 * @param transmuted The transmuted intention markers
 * @returns An elevation factor between 0 and 100
 */
function calculateElevationFactor(original, transmuted) {
    if (!original || !transmuted)
        return 0;
    // In a real implementation, this would involve sophisticated elevation analysis
    // For demonstration, we'll use a simplified approach
    // Intensity elevation (transmuted intensity should be appropriately higher)
    const intensityRatio = transmuted.intensity / Math.max(original.intensity, 0.1);
    const optimalIntensityRatio = (0, sacred_mathematics_1.calculateGoldenRatio)(); // Use golden ratio as optimal elevation
    const intensityElevation = 100 * (1 - Math.abs(intensityRatio - optimalIntensityRatio) / optimalIntensityRatio);
    // Purpose elevation (transmuted purpose should contain more spiritual/positive terms)
    let purposeElevation = 50; // Default to neutral
    if (transmuted.purpose) {
        const spiritualTerms = [
            'love', 'faith', 'hope', 'joy', 'peace', 'patience', 'kindness',
            'goodness', 'faithfulness', 'gentleness', 'self-control', 'wisdom',
            'understanding', 'divine', 'sacred', 'holy', 'blessed', 'grace',
            'mercy', 'truth', 'light', 'spirit', 'soul', 'harmony', 'unity'
        ];
        const transmutedWords = transmuted.purpose.toLowerCase().split(/\s+/);
        const spiritualWordCount = transmutedWords.filter(word => spiritualTerms.includes(word)).length;
        purposeElevation = Math.min(100, 50 + (spiritualWordCount * 10));
    }
    // Weight the components for final elevation factor
    return (intensityElevation * 0.6) + (purposeElevation * 0.4);
}
/**
 * Calculates the structural harmony of a transmutation
 * Measures how well the transmutation preserves and enhances structural integrity
 * @param originalState The original state object
 * @param transmutedState The transmuted state object
 * @returns A harmony value between 0 and 100
 */
function calculateStructuralHarmony(originalState, transmutedState) {
    // In a real implementation, this would involve complex structural analysis
    // For demonstration, we'll use a simplified approach
    // Calculate structure preservation
    const structurePreservation = calculateStructurePreservation(originalState, transmutedState);
    // Calculate sacred geometry alignment
    const geometryAlignment = calculateGeometryAlignment(transmutedState);
    // Weight the components for final structural harmony
    return (structurePreservation * 0.4) + (geometryAlignment * 0.6);
}
/**
 * Calculates how well the transmutation preserves essential structure
 * @param originalState The original state object
 * @param transmutedState The transmuted state object
 * @returns A preservation value between 0 and 100
 */
function calculateStructurePreservation(originalState, transmutedState) {
    if (!originalState || !transmutedState)
        return 0;
    // In a real implementation, this would involve sophisticated structure analysis
    // For demonstration, we'll use a simplified approach based on key preservation
    // Get all keys from both states
    const originalKeys = Object.keys(originalState);
    const transmutedKeys = Object.keys(transmutedState);
    if (originalKeys.length === 0)
        return 100; // If no original structure, consider it fully preserved
    // Count preserved keys
    const preservedKeys = originalKeys.filter(key => transmutedKeys.includes(key));
    const preservationRatio = preservedKeys.length / originalKeys.length;
    // Apply a golden ratio weighting (preservation closest to golden ratio is optimal)
    const goldenRatio = (0, sacred_mathematics_1.calculateGoldenRatio)();
    const deviation = Math.abs(preservationRatio - (1 / goldenRatio));
    const normalizedDeviation = deviation / (1 / goldenRatio);
    return 100 * (1 - normalizedDeviation);
}
/**
 * Calculates how well the transmuted state aligns with sacred geometry principles
 * @param transmutedState The transmuted state object
 * @returns An alignment value between 0 and 100
 */
function calculateGeometryAlignment(transmutedState) {
    if (!transmutedState)
        return 0;
    // In a real implementation, this would involve sophisticated sacred geometry analysis
    // For demonstration, we'll use a simplified approach
    // Check for numerical values that align with sacred numbers
    const values = extractNumericalValues(transmutedState);
    if (values.length === 0)
        return 50; // Default to neutral if no values found
    // Calculate alignment with Fibonacci sequence
    const fibonacciAlignment = calculateFibonacciAlignment(values);
    // Calculate alignment with sacred ratios
    const ratioAlignment = calculateSacredRatioAlignment(values);
    // Calculate alignment with sacred frequencies
    const frequencyAlignment = calculateFrequencyAlignment(values);
    // Weight the components for final geometry alignment
    return (fibonacciAlignment * 0.4) + (ratioAlignment * 0.3) + (frequencyAlignment * 0.3);
}
/**
 * Extracts numerical values from a state object
 * @param state The state object to analyze
 * @returns Array of numerical values
 */
function extractNumericalValues(state) {
    const values = [];
    // Recursive function to extract numbers from nested objects
    function extract(obj) {
        if (typeof obj === 'number') {
            values.push(obj);
        }
        else if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
                obj.forEach(item => extract(item));
            }
            else {
                Object.values(obj).forEach(value => extract(value));
            }
        }
    }
    extract(state);
    return values;
}
/**
 * Calculates alignment with the Fibonacci sequence
 * @param values Array of numerical values
 * @returns An alignment value between 0 and 100
 */
function calculateFibonacciAlignment(values) {
    if (values.length === 0)
        return 0;
    // Generate Fibonacci sequence for comparison
    const fibonacci = (0, sacred_mathematics_1.generateFibonacciSequence)(20);
    // Calculate alignment score for each value
    let totalAlignment = 0;
    values.forEach(value => {
        // Find the closest Fibonacci number
        const closestFib = fibonacci.reduce((prev, curr) => {
            return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
        });
        // Calculate deviation from closest Fibonacci number
        const deviation = Math.abs(value - closestFib) / Math.max(value, closestFib);
        // Convert deviation to alignment score (0-100)
        const alignmentScore = 100 * (1 - deviation);
        totalAlignment += alignmentScore;
    });
    // Return average alignment across all values
    return totalAlignment / values.length;
}
/**
 * Calculates alignment with sacred ratios
 * @param values Array of numerical values
 * @returns An alignment value between 0 and 100
 */
function calculateSacredRatioAlignment(values) {
    if (values.length < 2)
        return 0;
    // Define sacred ratios
    const sacredRatios = [
        (0, sacred_mathematics_1.calculateGoldenRatio)(), // Golden Ratio (φ)
        Math.PI / 2, // π/2
        Math.PI, // π
        Math.E, // Euler's number
        Math.sqrt(2), // √2 (Pythagoras)
        Math.sqrt(3), // √3 (Vesica Piscis)
        Math.sqrt(5), // √5
        3 / 2 // Perfect Fifth in music
    ];
    // Calculate ratios between values
    const ratios = [];
    for (let i = 0; i < values.length - 1; i++) {
        for (let j = i + 1; j < values.length; j++) {
            const ratio = Math.max(values[i], values[j]) / Math.min(values[i], values[j]);
            ratios.push(ratio);
        }
    }
    // Calculate alignment score for each ratio
    let totalAlignment = 0;
    ratios.forEach(ratio => {
        // Find the closest sacred ratio
        const closestRatio = sacredRatios.reduce((prev, curr) => {
            return Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev;
        });
        // Calculate deviation from closest sacred ratio
        const deviation = Math.abs(ratio - closestRatio) / closestRatio;
        // Convert deviation to alignment score (0-100)
        const alignmentScore = 100 * (1 - Math.min(deviation, 1));
        totalAlignment += alignmentScore;
    });
    // Return average alignment across all ratios
    return ratios.length > 0 ? totalAlignment / ratios.length : 0;
}
/**
 * Calculates alignment with sacred frequencies
 * @param values Array of numerical values
 * @returns An alignment value between 0 and 100
 */
function calculateFrequencyAlignment(values) {
    if (values.length === 0)
        return 0;
    // Define sacred frequencies
    const sacredFrequencies = [
        432, // Universal Frequency
        528, // Love Frequency (DNA Repair)
        396, // Liberating Guilt and Fear
        639, // Connecting/Relationships
        741, // Awakening Intuition
        852, // Returning to Spiritual Order
        963, // Cosmic Consciousness
        144, // Light Frequency
        108, // Spiritual Completion
        1152, // Ascension Frequency
    ];
    // Add Solfeggio frequencies
    for (let i = 0; i < 9; i++) {
        sacredFrequencies.push((0, sacred_mathematics_1.calculateSolfeggioFrequency)(i));
    }
    // Calculate alignment score for each value
    let totalAlignment = 0;
    values.forEach(value => {
        // Scale the value to be within frequency range if needed
        let scaledValue = value;
        while (scaledValue > 1000)
            scaledValue /= 10;
        while (scaledValue < 100)
            scaledValue *= 10;
        // Find the closest sacred frequency
        const closestFreq = sacredFrequencies.reduce((prev, curr) => {
            return Math.abs(curr - scaledValue) < Math.abs(prev - scaledValue) ? curr : prev;
        });
        // Calculate deviation from closest sacred frequency
        const deviation = Math.abs(scaledValue - closestFreq) / closestFreq;
        // Convert deviation to alignment score (0-100)
        const alignmentScore = 100 * (1 - Math.min(deviation, 1));
        totalAlignment += alignmentScore;
    });
    // Return average alignment across all values
    return totalAlignment / values.length;
}
/**
 * Calculates the divine resonance of a state
 * Measures how well the state aligns with divine principles
 * @param state The state object to analyze
 * @returns A resonance value between 0 and 100
 */
function calculateDivineResonance(state) {
    if (!state)
        return 0;
    // In a real implementation, this would involve sophisticated divine analysis
    // For demonstration, we'll use a simplified approach
    // Calculate fruit-bearing potential
    const fruitPotential = calculateFruitPotential(state);
    // Calculate kingdom alignment
    const kingdomAlignment = calculateKingdomAlignment(state);
    // Calculate light quotient
    const lightQuotient = calculateLightQuotient(state);
    // Weight the components for final divine resonance
    return (fruitPotential * 0.3) + (kingdomAlignment * 0.4) + (lightQuotient * 0.3);
}
/**
 * Calculates the fruit-bearing potential of a state
 * Measures how well the state can bear spiritual fruit
 * @param state The state object to analyze
 * @returns A potential value between 0 and 100
 */
function calculateFruitPotential(state) {
    // Identify markers of fruit-bearing potential
    const markers = extractFruitMarkers(state);
    // Calculate scores for each fruit category
    const loveScore = calculateFruitScore(markers.love);
    const joyScore = calculateFruitScore(markers.joy);
    const peaceScore = calculateFruitScore(markers.peace);
    const patienceScore = calculateFruitScore(markers.patience);
    const kindnessScore = calculateFruitScore(markers.kindness);
    const goodnessScore = calculateFruitScore(markers.goodness);
    const faithfulnessScore = calculateFruitScore(markers.faithfulness);
    const gentlenessScore = calculateFruitScore(markers.gentleness);
    const selfControlScore = calculateFruitScore(markers.selfControl);
    // Calculate total fruit potential
    return (loveScore * 0.15 +
        joyScore * 0.1 +
        peaceScore * 0.15 +
        patienceScore * 0.1 +
        kindnessScore * 0.1 +
        goodnessScore * 0.1 +
        faithfulnessScore * 0.1 +
        gentlenessScore * 0.1 +
        selfControlScore * 0.1);
}
/**
 * Extracts fruit markers from a state object
 * @param state The state object to analyze
 * @returns Object containing extracted fruit markers
 */
function extractFruitMarkers(state) {
    // Default markers
    const markers = {
        love: { present: false, strength: 0 },
        joy: { present: false, strength: 0 },
        peace: { present: false, strength: 0 },
        patience: { present: false, strength: 0 },
        kindness: { present: false, strength: 0 },
        goodness: { present: false, strength: 0 },
        faithfulness: { present: false, strength: 0 },
        gentleness: { present: false, strength: 0 },
        selfControl: { present: false, strength: 0 }
    };
    // In a real implementation, this would involve sophisticated marker extraction
    // For demonstration, we'll use a simplified approach
    // Convert state to string for analysis
    const stateString = JSON.stringify(state).toLowerCase();
    // Check for markers of each fruit
    if (stateString.includes('love') || stateString.includes('compassion') || stateString.includes('charity')) {
        markers.love.present = true;
        markers.love.strength = extractStrengthValue(state, ['love', 'compassion', 'charity']);
    }
    if (stateString.includes('joy') || stateString.includes('happiness') || stateString.includes('delight')) {
        markers.joy.present = true;
        markers.joy.strength = extractStrengthValue(state, ['joy', 'happiness', 'delight']);
    }
    if (stateString.includes('peace') || stateString.includes('harmony') || stateString.includes('tranquility')) {
        markers.peace.present = true;
        markers.peace.strength = extractStrengthValue(state, ['peace', 'harmony', 'tranquility']);
    }
    if (stateString.includes('patience') || stateString.includes('longsuffering') || stateString.includes('endurance')) {
        markers.patience.present = true;
        markers.patience.strength = extractStrengthValue(state, ['patience', 'longsuffering', 'endurance']);
    }
    if (stateString.includes('kindness') || stateString.includes('benevolence') || stateString.includes('generosity')) {
        markers.kindness.present = true;
        markers.kindness.strength = extractStrengthValue(state, ['kindness', 'benevolence', 'generosity']);
    }
    if (stateString.includes('goodness') || stateString.includes('virtue') || stateString.includes('righteousness')) {
        markers.goodness.present = true;
        markers.goodness.strength = extractStrengthValue(state, ['goodness', 'virtue', 'righteousness']);
    }
    if (stateString.includes('faithfulness') || stateString.includes('loyalty') || stateString.includes('devotion')) {
        markers.faithfulness.present = true;
        markers.faithfulness.strength = extractStrengthValue(state, ['faithfulness', 'loyalty', 'devotion']);
    }
    if (stateString.includes('gentleness') || stateString.includes('meekness') || stateString.includes('humility')) {
        markers.gentleness.present = true;
        markers.gentleness.strength = extractStrengthValue(state, ['gentleness', 'meekness', 'humility']);
    }
    if (stateString.includes('self-control') || stateString.includes('discipline') || stateString.includes('temperance')) {
        markers.selfControl.present = true;
        markers.selfControl.strength = extractStrengthValue(state, ['self-control', 'discipline', 'temperance']);
    }
    return markers;
}
/**
 * Extracts a strength value for a set of keywords from a state object
 * @param state The state object to analyze
 * @param keywords Array of keywords to search for
 * @returns A strength value between 0 and 100
 */
function extractStrengthValue(state, keywords) {
    // Default strength
    let strength = 50;
    // In a real implementation, this would involve sophisticated strength extraction
    // For demonstration, we'll use a simplified approach
    // Check if any of the keywords are direct properties with numeric values
    for (const key of keywords) {
        if (typeof state[key] === 'number') {
            strength = Math.max(strength, Math.min(100, state[key]));
        }
    }
    // Check for keywords in nested properties
    const stateString = JSON.stringify(state).toLowerCase();
    // Count occurrences of keywords
    let occurrences = 0;
    keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = stateString.match(regex);
        if (matches) {
            occurrences += matches.length;
        }
    });
    // Adjust strength based on occurrences
    strength = Math.min(100, strength + (occurrences * 5));
    return strength;
}
/**
 * Calculates a score for a fruit category
 * @param fruitMarker The fruit marker object
 * @returns A score between 0 and 100
 */
function calculateFruitScore(fruitMarker) {
    if (!fruitMarker.present)
        return 0;
    return fruitMarker.strength;
}
/**
 * Calculates the kingdom alignment of a state
 * Measures how well the state aligns with kingdom principles
 * @param state The state object to analyze
 * @returns An alignment value between 0 and 100
 */
function calculateKingdomAlignment(state) {
    // In a real implementation, this would involve sophisticated kingdom analysis
    // For demonstration, we'll use a simplified approach
    // Calculate alignment with kingdom principles
    const abundanceAlignment = calculateKingdomPrincipleAlignment(state, 'abundance');
    const multiplicativeAlignment = calculateKingdomPrincipleAlignment(state, 'multiplicative');
    const sacrificialAlignment = calculateKingdomPrincipleAlignment(state, 'sacrificial');
    const generationalAlignment = calculateKingdomPrincipleAlignment(state, 'generational');
    // Weight the components for final kingdom alignment
    return (abundanceAlignment * 0.25 +
        multiplicativeAlignment * 0.25 +
        sacrificialAlignment * 0.25 +
        generationalAlignment * 0.25);
}
/**
 * Calculates alignment with a specific kingdom principle
 * @param state The state object to analyze
 * @param principle The kingdom principle to check for
 * @returns An alignment value between 0 and 100
 */
function calculateKingdomPrincipleAlignment(state, principle) {
    // Convert state to string for analysis
    const stateString = JSON.stringify(state).toLowerCase();
    // Define keywords for each principle
    const keywords = {
        'abundance': ['abundance', 'overflow', 'plenty', 'provision', 'multiplication', 'increase'],
        'multiplicative': ['multiply', 'grow', 'exponential', 'increase', 'expand', 'reproduce'],
        'sacrificial': ['sacrifice', 'give', 'sow', 'seed', 'firstfruits', 'offering'],
        'generational': ['generation', 'legacy', 'inheritance', 'descendant', 'seed', 'lineage']
    };
    // Count occurrences of keywords for the principle
    let occurrences = 0;
    if (keywords[principle]) {
        keywords[principle].forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = stateString.match(regex);
            if (matches) {
                occurrences += matches.length;
            }
        });
    }
    // Calculate alignment based on occurrences
    return Math.min(100, occurrences * 10);
}
/**
 * Calculates the light quotient of a state
 * Measures the amount of spiritual light present in the state
 * @param state The state object to analyze
 * @returns A light quotient between 0 and 100
 */
function calculateLightQuotient(state) {
    // In a real implementation, this would involve sophisticated light analysis
    // For demonstration, we'll use a simplified approach
    // Convert state to string for analysis
    const stateString = JSON.stringify(state).toLowerCase();
    // Define light keywords and shadow keywords
    const lightKeywords = [
        'light', 'truth', 'revelation', 'wisdom', 'understanding', 'knowledge',
        'glory', 'divine', 'holy', 'sacred', 'blessed', 'spirit', 'illumination'
    ];
    const shadowKeywords = [
        'darkness', 'confusion', 'obscurity', 'ignorance', 'deception', 'falsehood',
        'corruption', 'fear', 'doubt', 'worry', 'anxiety', 'despair'
    ];
    // Count occurrences of light and shadow keywords
    let lightCount = 0;
    let shadowCount = 0;
    lightKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = stateString.match(regex);
        if (matches) {
            lightCount += matches.length;
        }
    });
    shadowKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = stateString.match(regex);
        if (matches) {
            shadowCount += matches.length;
        }
    });
    // Calculate light quotient
    const totalCount = lightCount + shadowCount;
    if (totalCount === 0)
        return 50; // Default to neutral
    const lightRatio = lightCount / totalCount;
    return Math.round(lightRatio * 100);
}
/**
 * Calculates the harmonic alignment across octaves
 * Used to measure resonance across multiple harmonic dimensions
 * @param frequencies Array of frequencies
 * @returns The average harmonic alignment across octaves
 */
function calculateHarmonicAlignment(frequencies) {
    if (frequencies.length === 0)
        return 0;
    const harmonicSeries = [];
    const baseFrequency = frequencies[0];
    // Generate harmonic series from the base frequency
    for (let i = 1; i <= 12; i++) {
        harmonicSeries.push(baseFrequency * i);
    }
    // Calculate alignment with the harmonic series
    let totalAlignment = 0;
    frequencies.forEach(frequency => {
        // Find the closest harmonic
        const closestHarmonic = harmonicSeries.reduce((prev, curr) => {
            return Math.abs(curr - frequency) < Math.abs(prev - frequency) ? curr : prev;
        });
        // Calculate deviation from closest harmonic
        const deviation = Math.abs(frequency - closestHarmonic) / closestHarmonic;
        // Convert deviation to alignment score (0-100)
        const alignmentScore = 100 * (1 - Math.min(deviation, 1));
        totalAlignment += alignmentScore;
    });
    // Return average alignment across all frequencies
    return totalAlignment / frequencies.length;
}
/**
 * Calculates the cosmic harmonic convergence
 * Used to measure alignment with universal harmonic principles
 * @param patterns Array of numerical patterns
 * @returns The cosmic harmonic convergence value
 */
function calculateCosmicHarmonicConvergence(patterns) {
    if (patterns.length === 0)
        return 0;
    // Calculate alignment for each pattern
    const alignments = patterns.map(pattern => {
        const fibonacci = (0, sacred_mathematics_1.generateFibonacciSequence)(pattern.length);
        // Calculate deviation from Fibonacci sequence
        let totalDeviation = 0;
        for (let i = 0; i < pattern.length; i++) {
            const patternRatio = i > 0 ? pattern[i] / pattern[i - 1] : 1;
            const fibRatio = i > 0 ? fibonacci[i] / fibonacci[i - 1] : 1;
            const ratioDeviation = Math.abs(patternRatio - fibRatio) / Math.max(fibRatio, 1);
            totalDeviation += ratioDeviation;
        }
        const averageDeviation = totalDeviation / Math.max(pattern.length - 1, 1);
        return 100 * (1 - averageDeviation);
    });
    // Return average alignment across all patterns
    return alignments.reduce((sum, value) => sum + value, 0) / alignments.length;
}
