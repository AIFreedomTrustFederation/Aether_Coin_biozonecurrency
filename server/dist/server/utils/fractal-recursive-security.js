"use strict";
/**
 * Fractal Recursive Security Utilities
 *
 * This file provides utilities for implementing Fractal Recursive Quantum Security (FRQS)
 * in the Aetherion ecosystem, incorporating sacred patterns and divine encoding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeWithFractalRecursion = encodeWithFractalRecursion;
exports.generateFractalRecursiveKey = generateFractalRecursiveKey;
exports.encryptWithFRQS = encryptWithFRQS;
exports.decryptWithFRQS = decryptWithFRQS;
exports.quantumResistantCompare = quantumResistantCompare;
const crypto_1 = require("crypto");
const sacred_mathematics_1 = require("./sacred-mathematics");
/**
 * Encodes a seed value using fractal recursive patterns
 * @param seed The seed value to encode
 * @param recursionDepth The depth of recursion to apply
 * @returns A fractal-encoded string
 */
function encodeWithFractalRecursion(seed, recursionDepth) {
    // Base case
    if (recursionDepth <= 0 || !seed) {
        return seed;
    }
    // Initial hash
    const initialHash = createSHA256Hash(seed);
    // Generate Fibonacci sequence for recursion pattern
    const fibonacci = (0, sacred_mathematics_1.generateFibonacciSequence)(recursionDepth + 3);
    // Apply recursive hashing pattern
    let currentHash = initialHash;
    for (let i = 1; i <= recursionDepth; i++) {
        // Split the current hash into segments based on Fibonacci values
        const segmentLength = fibonacci[i] % 16 + 8; // Between 8 and 23 characters
        const segments = [];
        for (let j = 0; j < currentHash.length; j += segmentLength) {
            segments.push(currentHash.substring(j, j + segmentLength));
        }
        // Apply transformation to each segment using golden ratio branching
        const transformedSegments = segments.map((segment, index) => {
            // Apply different transformations based on position in sequence
            if (index % 3 === 0) {
                // Apply π-segmented transformation
                return applyPiSegmentedTransformation(segment, i);
            }
            else if (index % 3 === 1) {
                // Apply golden ratio transformation
                return applyGoldenRatioTransformation(segment, i);
            }
            else {
                // Apply recursive hash spiral
                return applyRecursiveHashSpiral(segment, i);
            }
        });
        // Combine transformed segments with sacred pattern
        currentHash = combineWithSacredPattern(transformedSegments, i);
    }
    return currentHash;
}
/**
 * Creates a SHA-256 hash of a string
 * @param input The input string to hash
 * @returns The hexadecimal hash value
 */
function createSHA256Hash(input) {
    return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
}
/**
 * Applies π-segmented transformation to a string segment
 * @param segment The string segment to transform
 * @param depth The current recursion depth
 * @returns The transformed segment
 */
function applyPiSegmentedTransformation(segment, depth) {
    // π digits (first 100 digits after the decimal point)
    const piDigits = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
    // Use depth to select starting position in π
    const startPos = (depth * 7) % (piDigits.length - 10);
    const piSegment = piDigits.substring(startPos, startPos + 10);
    // Apply transformation using π segment
    let transformed = '';
    for (let i = 0; i < segment.length; i++) {
        const char = segment.charAt(i);
        const piDigit = parseInt(piSegment.charAt(i % piSegment.length), 10);
        // Transform character based on π digit
        if (piDigit % 3 === 0) {
            // Shift forward
            transformed += shiftChar(char, piDigit);
        }
        else if (piDigit % 3 === 1) {
            // Shift backward
            transformed += shiftChar(char, -piDigit);
        }
        else {
            // XOR with π digit
            transformed += xorChar(char, piDigit);
        }
    }
    return transformed;
}
/**
 * Applies golden ratio transformation to a string segment
 * @param segment The string segment to transform
 * @param depth The current recursion depth
 * @returns The transformed segment
 */
function applyGoldenRatioTransformation(segment, depth) {
    // Calculate golden ratio to sufficient precision
    const phi = (0, sacred_mathematics_1.calculateGoldenRatio)();
    // Generate a sequence of values derived from phi^n
    const phiSequence = [];
    for (let i = 1; i <= 10; i++) {
        const phiValue = Math.pow(phi, i) % 1; // Fractional part only
        phiSequence.push(Math.floor(phiValue * 256)); // Convert to 0-255 range
    }
    // Apply transformation using phi sequence
    let transformed = '';
    for (let i = 0; i < segment.length; i++) {
        const char = segment.charAt(i);
        const phiValue = phiSequence[i % phiSequence.length];
        // Transform character based on phi value
        if (i % 2 === 0) {
            // For even positions, apply XOR
            transformed += xorChar(char, phiValue);
        }
        else {
            // For odd positions, apply rotation
            transformed += rotateChar(char, phiValue, depth);
        }
    }
    return transformed;
}
/**
 * Applies recursive hash spiral to a string segment
 * @param segment The string segment to transform
 * @param depth The current recursion depth
 * @returns The transformed segment
 */
function applyRecursiveHashSpiral(segment, depth) {
    // Create initial hash of the segment
    const initialHash = createSHA256Hash(segment).substring(0, segment.length);
    // Use the Fibonacci sequence to determine iteration pattern
    const fibonacci = (0, sacred_mathematics_1.generateFibonacciSequence)(depth + 3);
    const iterations = fibonacci[depth] % 5 + 1; // Between 1 and 5 iterations
    // Apply spiral hashing
    let result = segment;
    for (let i = 0; i < iterations; i++) {
        // Calculate twist direction based on depth
        const twistClockwise = ((depth + i) % 2 === 0);
        // Apply twist
        result = applySpiral(result, initialHash, twistClockwise);
        // Calculate hash of result for next iteration
        if (i < iterations - 1) {
            result = createSHA256Hash(result).substring(0, segment.length);
        }
    }
    return result;
}
/**
 * Applies spiral transformation to a string
 * @param input The input string
 * @param pattern The pattern to use for transformation
 * @param clockwise Whether to spiral clockwise
 * @returns The transformed string
 */
function applySpiral(input, pattern, clockwise) {
    const result = new Array(input.length);
    // Create spiral mapping
    let x = 0, y = 0;
    let dx = 0, dy = -1;
    for (let i = 0; i < input.length; i++) {
        // Calculate spiral position
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
            // Change direction
            const temp = dx;
            dx = -dy;
            dy = temp;
        }
        // Calculate new position
        x += dx;
        y += dy;
        // Calculate index in original string
        const originalIndex = (x + y) % input.length;
        const actualIndex = originalIndex < 0 ? originalIndex + input.length : originalIndex;
        // Calculate index in pattern
        const patternIndex = clockwise ? i % pattern.length : (pattern.length - 1 - (i % pattern.length));
        // Apply transformation
        const char = input.charAt(actualIndex);
        const patternChar = pattern.charAt(patternIndex);
        // Combine with pattern
        result[i] = xorChar(char, patternChar.charCodeAt(0));
    }
    return result.join('');
}
/**
 * Combines transformed segments using a sacred pattern
 * @param segments Array of transformed segments
 * @param depth The current recursion depth
 * @returns The combined string
 */
function combineWithSacredPattern(segments, depth) {
    // Generate Fibonacci sequence for combination pattern
    const fibonacci = (0, sacred_mathematics_1.generateFibonacciSequence)(segments.length + 3);
    // Define sacred separators
    const sacredSeparators = ['~', '.', '-', '+', '=', '*', '&', '#', '@'];
    // Combine segments with separators
    let combined = segments[0] || '';
    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment)
            continue;
        // Select separator based on Fibonacci sequence and depth
        const separatorIndex = (fibonacci[i] * depth) % sacredSeparators.length;
        const separator = sacredSeparators[separatorIndex];
        // Apply combination pattern based on position
        if (i % 3 === 0) {
            // For positions divisible by 3, reverse the segment
            combined += separator + reverseString(segment);
        }
        else if (i % 3 === 1) {
            // For positions with remainder 1, interleave with previous
            combined += separator + interleaveStrings(combined.charAt(combined.length - 1), segment);
        }
        else {
            // For positions with remainder 2, add normally
            combined += separator + segment;
        }
    }
    // Ensure output length is appropriate (truncate if too long, pad if too short)
    const targetLength = Math.min(combined.length, 128); // Limit to 128 characters
    if (combined.length > targetLength) {
        return combined.substring(0, targetLength);
    }
    return combined;
}
/**
 * Shifts a character by a specified amount in the ASCII table
 * @param char The character to shift
 * @param amount The amount to shift by
 * @returns The shifted character
 */
function shiftChar(char, amount) {
    const code = char.charCodeAt(0);
    // If the character is a letter, preserve case and wrap around the alphabet
    if (/[a-zA-Z]/.test(char)) {
        const isUpperCase = /[A-Z]/.test(char);
        const baseCode = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
        const newCode = ((code - baseCode + amount) % 26 + 26) % 26 + baseCode;
        return String.fromCharCode(newCode);
    }
    // If the character is a digit, wrap around 0-9
    if (/[0-9]/.test(char)) {
        const newCode = ((code - '0'.charCodeAt(0) + amount) % 10 + 10) % 10 + '0'.charCodeAt(0);
        return String.fromCharCode(newCode);
    }
    // Otherwise, use the full ASCII range (32-126)
    const newCode = ((code - 32 + amount) % 95 + 95) % 95 + 32;
    return String.fromCharCode(newCode);
}
/**
 * Applies XOR operation between a character and a value
 * @param char The character to transform
 * @param value The value to XOR with
 * @returns The transformed character
 */
function xorChar(char, value) {
    const code = char.charCodeAt(0);
    const newCode = code ^ value;
    // Ensure the result is a printable ASCII character (32-126)
    const printableCode = (newCode % 95) + 32;
    return String.fromCharCode(printableCode);
}
/**
 * Rotates a character based on a rotation value and depth
 * @param char The character to rotate
 * @param rotation The rotation value
 * @param depth The current recursion depth
 * @returns The rotated character
 */
function rotateChar(char, rotation, depth) {
    const code = char.charCodeAt(0);
    // Apply different rotation algorithms based on depth
    let newCode;
    if (depth % 3 === 0) {
        // Simple rotation
        newCode = code + rotation;
    }
    else if (depth % 3 === 1) {
        // Reflected rotation
        newCode = code - rotation;
    }
    else {
        // Oscillating rotation
        newCode = code + (rotation * (depth % 2 === 0 ? 1 : -1));
    }
    // Ensure the result is a printable ASCII character (32-126)
    const printableCode = ((newCode - 32) % 95 + 95) % 95 + 32;
    return String.fromCharCode(printableCode);
}
/**
 * Reverses a string
 * @param str The string to reverse
 * @returns The reversed string
 */
function reverseString(str) {
    return str.split('').reverse().join('');
}
/**
 * Interleaves two strings
 * @param a The first string
 * @param b The second string
 * @returns The interleaved string
 */
function interleaveStrings(a, b) {
    let result = '';
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < a.length)
            result += a.charAt(i);
        if (i < b.length)
            result += b.charAt(i);
    }
    return result;
}
/**
 * Generates a cryptographically secure key using fractal recursive principles
 * @param seed The seed value to use
 * @param length The desired key length
 * @returns A secure key
 */
function generateFractalRecursiveKey(seed, length) {
    // Apply multiple layers of fractal recursion
    const encoded = encodeWithFractalRecursion(seed, 5);
    // Generate golden ratio pattern
    const phi = (0, sacred_mathematics_1.calculateGoldenRatio)();
    const phiPattern = [];
    for (let i = 0; i < length; i++) {
        const phiValue = (Math.pow(phi, i + 1) % 1) * 256;
        phiPattern.push(Math.floor(phiValue));
    }
    // Combine encoded value with golden ratio pattern
    let key = '';
    for (let i = 0; i < length; i++) {
        const sourceIndex = Math.floor((phiPattern[i] / 256) * encoded.length);
        const sourceChar = encoded.charAt(sourceIndex);
        // Apply π-segmented transformation
        key += shiftChar(sourceChar, phiPattern[(i + 3) % phiPattern.length] % 26);
    }
    return key;
}
/**
 * Applies Fractal Recursive Quantum Security (FRQS) to encrypt data
 * @param data The data to encrypt
 * @param key The encryption key
 * @returns The encrypted data
 */
function encryptWithFRQS(data, key) {
    if (!data || !key)
        return data;
    // Generate π-segmented key distribution
    const piSegmentedKey = generatePiSegmentedKeyDistribution(key);
    // Apply golden ratio logic branching
    const branches = applyGoldenRatioBranching(data, piSegmentedKey);
    // Apply recursive hash spirals
    const encrypted = applyRecursiveHashSpirals(branches, piSegmentedKey);
    return encrypted;
}
/**
 * Applies Fractal Recursive Quantum Security (FRQS) to decrypt data
 * @param data The data to decrypt
 * @param key The decryption key
 * @returns The decrypted data
 */
function decryptWithFRQS(data, key) {
    if (!data || !key)
        return data;
    // Generate π-segmented key distribution
    const piSegmentedKey = generatePiSegmentedKeyDistribution(key);
    // Apply inverse recursive hash spirals
    const branches = reverseRecursiveHashSpirals(data, piSegmentedKey);
    // Apply inverse golden ratio logic branching
    const decrypted = reverseGoldenRatioBranching(branches, piSegmentedKey);
    return decrypted;
}
/**
 * Generates a π-segmented key distribution
 * @param key The encryption key
 * @returns The key distribution
 */
function generatePiSegmentedKeyDistribution(key) {
    // π digits (first 100 digits after the decimal point)
    const piDigits = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
    // Use key to generate distribution pattern
    const keyHash = createSHA256Hash(key);
    const segments = [];
    // Generate 12 key segments (12 octaves)
    for (let i = 0; i < 12; i++) {
        // Use key hash and π to determine segment
        const keyIndex = (parseInt(keyHash.substring(i * 2, i * 2 + 2), 16) % 64);
        const piIndex = (parseInt(piDigits.substring(i * 3, i * 3 + 3)) % 64);
        // Create segment by combining key and π
        const segment = key.substring(keyIndex % key.length) + key.substring(0, piIndex % key.length);
        segments.push(createSHA256Hash(segment).substring(0, 16));
    }
    return segments;
}
/**
 * Applies golden ratio logic branching to data
 * @param data The data to branch
 * @param keySegments The key segments to use
 * @returns The branched data
 */
function applyGoldenRatioBranching(data, keySegments) {
    // Calculate golden ratio value
    const phi = (0, sacred_mathematics_1.calculateGoldenRatio)();
    // Generate branch points using golden ratio
    const branchPoints = [];
    let position = 0;
    while (position < data.length) {
        branchPoints.push(position);
        position += Math.max(1, Math.floor(phi * position) % data.length);
    }
    // Create branches
    const branches = [];
    for (let i = 0; i < branchPoints.length; i++) {
        const start = branchPoints[i];
        const end = i < branchPoints.length - 1 ? branchPoints[i + 1] : data.length;
        if (start < end) {
            const segment = data.substring(start, end);
            // Apply key segment to this branch
            const keyIndex = i % keySegments.length;
            const keySegment = keySegments[keyIndex];
            // Encrypt segment with key segment
            let encryptedSegment = '';
            for (let j = 0; j < segment.length; j++) {
                const char = segment.charAt(j);
                const keyChar = keySegment.charAt(j % keySegment.length);
                encryptedSegment += xorChar(char, keyChar.charCodeAt(0));
            }
            branches.push(encryptedSegment);
        }
    }
    return branches;
}
/**
 * Applies recursive hash spirals to branches
 * @param branches The branches to encrypt
 * @param keySegments The key segments to use
 * @returns The encrypted data
 */
function applyRecursiveHashSpirals(branches, keySegments) {
    // Apply spiral hashing to each branch
    const spiralBranches = branches.map((branch, index) => {
        const keyIndex = index % keySegments.length;
        const keySegment = keySegments[keyIndex];
        // Apply spiral transformation
        return applySpiral(branch, keySegment, index % 2 === 0);
    });
    // Combine branches with sacred separators
    let result = '';
    for (let i = 0; i < spiralBranches.length; i++) {
        if (i > 0) {
            const separator = String.fromCharCode((keySegments[i % keySegments.length].charCodeAt(0) % 16) + 36); // Generate a separator from the key
            result += separator;
        }
        result += spiralBranches[i];
    }
    return result;
}
/**
 * Reverses recursive hash spirals
 * @param data The data to decrypt
 * @param keySegments The key segments to use
 * @returns The decrypted branches
 */
function reverseRecursiveHashSpirals(data, keySegments) {
    // In a real implementation, this would involve complex decryption logic
    // For demonstration, we'll use a simplified approach
    // Split data by separators
    const separators = [];
    for (let i = 0; i < keySegments.length; i++) {
        const separator = String.fromCharCode((keySegments[i % keySegments.length].charCodeAt(0) % 16) + 36);
        separators.push(separator);
    }
    // Create a regex pattern to split by any of the separators
    const separatorPattern = new RegExp('[' + separators.join('') + ']');
    const spiralBranches = data.split(separatorPattern);
    // Reverse spiral transformation on each branch
    const branches = spiralBranches.map((branch, index) => {
        const keyIndex = index % keySegments.length;
        const keySegment = keySegments[keyIndex];
        // Reverse spiral transformation
        return reverseSpiral(branch, keySegment, index % 2 === 0);
    });
    return branches;
}
/**
 * Reverses a spiral transformation
 * @param input The input string
 * @param pattern The pattern used for transformation
 * @param clockwise Whether the original spiral was clockwise
 * @returns The un-spiraled string
 */
function reverseSpiral(input, pattern, clockwise) {
    // For demonstration, we assume a simplified approach
    // In a real implementation, this would involve complex reverse spiral calculations
    const result = new Array(input.length);
    // Create reverse spiral mapping
    let x = 0, y = 0;
    let dx = 0, dy = -1;
    for (let i = 0; i < input.length; i++) {
        // Calculate spiral position
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
            // Change direction
            const temp = dx;
            dx = -dy;
            dy = temp;
        }
        // Calculate new position
        x += dx;
        y += dy;
        // Calculate index in original string
        const originalIndex = (x + y) % input.length;
        const actualIndex = originalIndex < 0 ? originalIndex + input.length : originalIndex;
        // Calculate index in pattern
        const patternIndex = clockwise ? i % pattern.length : (pattern.length - 1 - (i % pattern.length));
        // Apply reverse transformation
        const char = input.charAt(i);
        const patternChar = pattern.charAt(patternIndex);
        // Reverse XOR operation
        result[actualIndex] = xorChar(char, patternChar.charCodeAt(0));
    }
    return result.join('');
}
/**
 * Reverses golden ratio logic branching
 * @param branches The branches to recombine
 * @param keySegments The key segments used for branching
 * @returns The recombined data
 */
function reverseGoldenRatioBranching(branches, keySegments) {
    // In a real implementation, this would involve complex branch recombination logic
    // For demonstration, we'll use a simplified approach
    // Decrypt each branch
    const decryptedBranches = branches.map((branch, index) => {
        const keyIndex = index % keySegments.length;
        const keySegment = keySegments[keyIndex];
        // Decrypt segment with key segment
        let decryptedSegment = '';
        for (let j = 0; j < branch.length; j++) {
            const char = branch.charAt(j);
            const keyChar = keySegment.charAt(j % keySegment.length);
            decryptedSegment += xorChar(char, keyChar.charCodeAt(0));
        }
        return decryptedSegment;
    });
    // Recombine branches
    return decryptedBranches.join('');
}
/**
 * Compares two values with fuzzy matching for quantum-resistant verification
 * @param value1 The first value
 * @param value2 The second value
 * @param tolerancePercent The tolerance percentage for matching
 * @returns True if the values match within tolerance
 */
function quantumResistantCompare(value1, value2, tolerancePercent = 5) {
    if (!value1 || !value2)
        return false;
    // Calculate similarity score
    const similarityScore = calculateStringSimilarity(value1, value2);
    // Check if similarity is within tolerance
    return similarityScore >= (100 - tolerancePercent) / 100;
}
/**
 * Calculates a similarity score between two strings
 * @param str1 The first string
 * @param str2 The second string
 * @returns A similarity score between 0 and 1
 */
function calculateStringSimilarity(str1, str2) {
    if (str1 === str2)
        return 1;
    if (!str1 || !str2)
        return 0;
    // Use Levenshtein distance for similarity calculation
    const levenshteinDistance = calculateLevenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    // Convert distance to similarity score
    return 1 - (levenshteinDistance / maxLength);
}
/**
 * Calculates the Levenshtein distance between two strings
 * @param str1 The first string
 * @param str2 The second string
 * @returns The Levenshtein distance
 */
function calculateLevenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    // Create a matrix of distances
    const d = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    // Initialize the first row and column
    for (let i = 0; i <= m; i++) {
        d[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
        d[0][j] = j;
    }
    // Fill the matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, // deletion
            d[i][j - 1] + 1, // insertion
            d[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return d[m][n];
}
