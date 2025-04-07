/**
 * Fractal Algorithms for AetherCoin BioZoeCurrency
 * 
 * Contains mathematical functions based on:
 * - Fibonacci sequence
 * - Golden Ratio
 * - Mandelbrot set
 * - Toroidal flow dynamics
 * - Quantum entanglement
 */

import { GrowthParameters, BioZoeLifecycleState } from './types';

// Universal constants
export const GOLDEN_RATIO = 1.618033988749895;
export const PI = 3.14159265358979323846;
export const PHI = GOLDEN_RATIO; // Alias for phi (φ)
export const QUANTUM_CONSTANT = 137.035999084; // Fine structure constant (α⁻¹)
export const MANDELBROT_MAX_ITERATIONS = 1000;

// Default growth parameters based on natural constants
export const DEFAULT_GROWTH_PARAMETERS: GrowthParameters = {
  // Fibonacci
  fibonacciBase: 1,
  fibonacciExpansionRate: 0.05,
  
  // Mandelbrot
  mandelbrotDepthWeight: 0.05,
  mandelbrotBoundary: 2.0,
  
  // Golden Ratio
  goldenRatio: GOLDEN_RATIO,
  goldenRatioWeight: 0.618, // Golden ratio conjugate (1/φ)
  
  // Lifecycle
  seedMaturationRate: 0.0314, // Based on π/100
  growthAccelerationFactor: 0.05,
  floweringThreshold: 2.618, // φ²
  legacyContributionFactor: 0.1618, // φ/10
  
  // Quantum entanglement
  entanglementStrengthGrowth: 0.01,
  entanglementEnergyTransfer: 0.85,
  
  // Torus field
  toroidalFlowResistance: 0.1,
  toroidalFlowAcceleration: 0.05
};

/**
 * Generate Fibonacci sequence up to a certain length
 * @param length Number of elements in sequence
 * @returns Array of Fibonacci numbers
 */
export function generateFibonacciSequence(length: number): number[] {
  if (length <= 0) return [];
  if (length === 1) return [1];
  
  const sequence = [1, 1];
  for (let i = 2; i < length; i++) {
    sequence.push(sequence[i-1] + sequence[i-2]);
  }
  
  return sequence;
}

/**
 * Get nth Fibonacci number
 * @param n Position in sequence (0-indexed)
 * @returns The Fibonacci number at position n
 */
export function getFibonacciNumber(n: number): number {
  if (n <= 0) return 0;
  if (n === 1 || n === 2) return 1;
  
  // For larger numbers, use Binet's formula with the golden ratio
  // This is more efficient than computing the entire sequence
  return Math.round((Math.pow(GOLDEN_RATIO, n) - Math.pow(1 - GOLDEN_RATIO, n)) / Math.sqrt(5));
}

/**
 * Calculate the number of Mandelbrot iterations for a complex point
 * This determines if a point is in the Mandelbrot set and its "depth"
 * 
 * @param real Real component of complex number
 * @param imaginary Imaginary component of complex number
 * @param maxIterations Maximum iterations to check
 * @returns Number of iterations before escaping, or maxIterations if in set
 */
export function calculateMandelbrotIterations(
  real: number, 
  imaginary: number, 
  maxIterations: number = MANDELBROT_MAX_ITERATIONS
): number {
  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;
  let iteration = 0;
  
  // Iterate z = z² + c until |z| > 2 or we reach max iterations
  while (x2 + y2 <= 4 && iteration < maxIterations) {
    y = 2 * x * y + imaginary;
    x = x2 - y2 + real;
    x2 = x * x;
    y2 = y * y;
    iteration++;
  }
  
  return iteration;
}

/**
 * Get Mandelbrot set "potential" for a point
 * Represents how "deep" a point is in the set, normalized between 0-1
 * 
 * @param real Real component of complex number
 * @param imaginary Imaginary component of complex number
 * @returns Potential value between 0-1
 */
export function getMandelbrotPotential(real: number, imaginary: number): number {
  const iterations = calculateMandelbrotIterations(real, imaginary);
  
  // Normalize to 0-1 range using logarithmic scaling for visual appeal
  if (iterations < MANDELBROT_MAX_ITERATIONS) {
    return Math.log(iterations + 1) / Math.log(MANDELBROT_MAX_ITERATIONS);
  } else {
    return 1.0; // In the set
  }
}

/**
 * Calculate a point on the edge of the Mandelbrot set cardioid
 * The main cardioid is the heart-shaped region of the Mandelbrot set
 * 
 * @param angle Angle in radians (0 to 2π)
 * @returns Complex point [real, imaginary]
 */
export function getMandelbrotCardioidPoint(angle: number): [number, number] {
  // Cardioid formula: r = 0.5 - 0.5 * cos(angle)
  const r = 0.5 - 0.5 * Math.cos(angle);
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  
  // Adjust to center the cardioid at the standard position
  return [x - 0.25, y];
}

/**
 * Calculate token growth based on Fibonacci, Golden Ratio, and Mandelbrot principles
 * 
 * @param age Token age in blocks
 * @param lifeState Current lifecycle state
 * @param fibonacciIndex Position in Fibonacci sequence
 * @param mandelbrotPosition Complex position in Mandelbrot set
 * @param entanglementStrength Connection strength (0-1)
 * @param parameters Growth algorithm parameters
 * @returns Growth factor multiplier
 */
export function calculateTokenGrowth(
  age: number,
  lifeState: BioZoeLifecycleState,
  fibonacciIndex: number,
  mandelbrotPosition: { re: number, im: number },
  entanglementStrength: number,
  parameters: GrowthParameters = DEFAULT_GROWTH_PARAMETERS
): number {
  // Base growth from Fibonacci progression
  const fibonacciGrowth = getFibonacciNumber(fibonacciIndex) / 100;
  
  // Mandelbrot influence
  const mandelbrotIterations = calculateMandelbrotIterations(
    mandelbrotPosition.re,
    mandelbrotPosition.im
  );
  const mandelbrotGrowth = mandelbrotIterations / MANDELBROT_MAX_ITERATIONS * parameters.mandelbrotDepthWeight;
  
  // Golden Ratio influence
  const goldenRatioGrowth = Math.pow(parameters.goldenRatio, age / 1000) * parameters.goldenRatioWeight;
  
  // Lifecycle state modifiers
  let lifecycleModifier = 1.0;
  switch (lifeState) {
    case BioZoeLifecycleState.SEED:
      lifecycleModifier = 1.0 + (age * parameters.seedMaturationRate);
      break;
    case BioZoeLifecycleState.GROWTH:
      lifecycleModifier = 1.0 + (age * parameters.growthAccelerationFactor);
      break;
    case BioZoeLifecycleState.FLOWERING:
      // Flowering growth follows golden ratio squared pattern
      lifecycleModifier = Math.pow(parameters.goldenRatio, 2);
      break;
    case BioZoeLifecycleState.LEGACY:
      // Legacy tokens contribute based on lifetime
      lifecycleModifier = 1.0 + (parameters.legacyContributionFactor * Math.log(age + 1));
      break;
  }
  
  // Entanglement bonus (quantum connection boost)
  const entanglementBonus = entanglementStrength * 0.5;
  
  // Combine all growth factors
  const totalGrowth = (
    fibonacciGrowth + 
    mandelbrotGrowth + 
    goldenRatioGrowth
  ) * lifecycleModifier * (1 + entanglementBonus);
  
  return 1.0 + totalGrowth;
}

/**
 * Calculate a position in the toroidal field for token placement
 * 
 * @param seed Seed value for deterministic generation
 * @returns Toroidal coordinates {theta, phi, r}
 */
export function calculateToroidalPosition(seed: number): { theta: number, phi: number, r: number } {
  // Create a deterministic but well-distributed value from the seed
  const normalizedSeed = ((seed * 9301 + 49297) % 233280) / 233280;
  
  // Calculate toroidal coordinates
  const theta = normalizedSeed * 2 * PI; // Angular coordinate (0 to 2π)
  const phi = (normalizedSeed * 7919) % 1 * 2 * PI; // Poloidal coordinate (0 to 2π)
  
  // Radius follows golden ratio distribution
  const r = 1 + (GOLDEN_RATIO - 1) * ((normalizedSeed * 104729) % 1);
  
  return { theta, phi, r };
}

/**
 * Generate a Mandelbrot position based on a token's properties
 * 
 * @param seed Deterministic seed value
 * @param depth How deep in the set to target (0-1)
 * @returns Complex position in Mandelbrot set {re, im}
 */
export function generateMandelbrotPosition(seed: number, depth: number = 0.7): { re: number, im: number } {
  // Generate a seeded random angle
  const angle = ((seed * 9301 + 49297) % 233280) / 233280 * 2 * PI;
  
  // Get a point on the main cardioid
  const [baseRe, baseIm] = getMandelbrotCardioidPoint(angle);
  
  // Move toward the center based on depth to ensure interesting behavior
  const centerRe = -0.75;
  const centerIm = 0;
  
  const finalRe = baseRe + (centerRe - baseRe) * (1 - depth);
  const finalIm = baseIm + (centerIm - baseIm) * (1 - depth);
  
  return { re: finalRe, im: finalIm };
}

/**
 * Calculate energy flow in the torus field
 * 
 * @param position Current position in torus {theta, phi}
 * @param networkDensity Density of tokens in network (0-1)
 * @param parameters Growth parameters
 * @returns Flow vector {direction, magnitude}
 */
export function calculateToroidalFlow(
  position: { theta: number, phi: number },
  networkDensity: number,
  parameters: GrowthParameters = DEFAULT_GROWTH_PARAMETERS
): { direction: number, magnitude: number } {
  // Direction follows a pattern based on position
  const direction = (position.theta + position.phi / 2) % (2 * PI);
  
  // Magnitude follows a fibonacci-related pattern
  const phiNormalized = position.phi / (2 * PI);
  const thetaNormalized = position.theta / (2 * PI);
  
  const fibValue = getFibonacciNumber(Math.floor(thetaNormalized * 10) + 1);
  const resistanceFactor = 1 / (1 + parameters.toroidalFlowResistance * networkDensity);
  
  // Calculate flow magnitude based on position and network density
  const magnitude = (
    0.1 + // Base flow
    0.2 * Math.sin(phiNormalized * 2 * PI) + // Sinusoidal component
    0.1 * (fibValue % 10) / 10 // Fibonacci influence
  ) * resistanceFactor * parameters.toroidalFlowAcceleration;
  
  return { direction, magnitude };
}

/**
 * Generate a DNA sequence for a token based on its properties
 * DNA represents the token's unique characteristics and history
 * 
 * @param tokenId Token identifier
 * @param mandelbrotPosition Position in Mandelbrot set
 * @param lifeState Current lifecycle state
 * @returns DNA sequence string
 */
export function generateTokenDNA(
  tokenId: string,
  mandelbrotPosition: { re: number, im: number },
  lifeState: BioZoeLifecycleState
): string {
  // Convert the token ID to a number for seeding
  const seedValue = parseInt(tokenId.replace(/[^0-9]/g, '').substring(0, 10), 10) || 0;
  
  // Calculate Mandelbrot iterations for this position
  const iterations = calculateMandelbrotIterations(
    mandelbrotPosition.re,
    mandelbrotPosition.im,
    100 // Limit to 100 for DNA generation
  );
  
  // Generate a binary pattern based on the iterations
  let pattern = '';
  for (let i = 0; i < 32; i++) {
    const bitValue = (iterations >> i) & 1;
    pattern += bitValue.toString();
  }
  
  // Add lifecycle encoding
  const lifecodeMap = {
    [BioZoeLifecycleState.SEED]: 'AA',
    [BioZoeLifecycleState.GROWTH]: 'GG',
    [BioZoeLifecycleState.FLOWERING]: 'TT',
    [BioZoeLifecycleState.LEGACY]: 'CC'
  };
  
  // Create segments with biological-like encoding
  const segment1 = lifecodeMap[lifeState];
  const segment2 = seedValue.toString(16).padStart(8, '0');
  const segment3 = pattern.substring(0, 16);
  const segment4 = (mandelbrotPosition.re * 1000).toFixed(0).padStart(4, '0');
  const segment5 = (mandelbrotPosition.im * 1000).toFixed(0).padStart(4, '0');
  
  // Combine into DNA-like sequence
  return `${segment1}-${segment2}-${segment3}-${segment4}-${segment5}`;
}

/**
 * Determine the lifecycle transition threshold based on token properties
 * 
 * @param currentState Current lifecycle state
 * @param growthFactor Current growth factor
 * @param age Token age in blocks
 * @param parameters Growth parameters
 * @returns Threshold value for transition to next state
 */
export function getLifecycleTransitionThreshold(
  currentState: BioZoeLifecycleState,
  growthFactor: number,
  age: number,
  parameters: GrowthParameters = DEFAULT_GROWTH_PARAMETERS
): number {
  switch (currentState) {
    case BioZoeLifecycleState.SEED:
      // Seeds transition to Growth based on maturation rate and age
      return 1.0 + (parameters.seedMaturationRate * age);
      
    case BioZoeLifecycleState.GROWTH:
      // Growth transitions to Flowering at golden ratio squared threshold
      return parameters.floweringThreshold;
      
    case BioZoeLifecycleState.FLOWERING:
      // Flowering transitions to Legacy based on energy potential
      return 3.14159; // Pi-based threshold
      
    case BioZoeLifecycleState.LEGACY:
      // Legacy tokens don't transition further
      return Infinity;
      
    default:
      return 1.0;
  }
}

/**
 * Calculate the lifecycle progress percentage
 * 
 * @param currentState Current lifecycle state
 * @param growthFactor Current growth factor
 * @param age Token age in blocks
 * @param parameters Growth parameters
 * @returns Progress percentage (0-100)
 */
export function calculateLifecycleProgress(
  currentState: BioZoeLifecycleState,
  growthFactor: number,
  age: number,
  parameters: GrowthParameters = DEFAULT_GROWTH_PARAMETERS
): number {
  const threshold = getLifecycleTransitionThreshold(
    currentState,
    growthFactor,
    age,
    parameters
  );
  
  let progress = 0;
  
  switch (currentState) {
    case BioZoeLifecycleState.SEED:
      // Progress based on growth factor compared to threshold
      progress = (growthFactor - 1.0) / (threshold - 1.0);
      break;
      
    case BioZoeLifecycleState.GROWTH:
      // Progress based on growth factor compared to flowering threshold
      progress = (growthFactor - 1.0) / (parameters.floweringThreshold - 1.0);
      break;
      
    case BioZoeLifecycleState.FLOWERING:
      // Flowering progress based on energy accumulation
      progress = (growthFactor - parameters.floweringThreshold) / 
                (threshold - parameters.floweringThreshold);
      break;
      
    case BioZoeLifecycleState.LEGACY:
      // Legacy tokens are always at 100%
      progress = 1.0;
      break;
  }
  
  // Ensure progress is between 0-100%
  return Math.max(0, Math.min(1, progress)) * 100;
}

/**
 * Calculate quantum entanglement strength growth between two tokens
 * 
 * @param initialStrength Starting entanglement strength
 * @param token1Position Position of first token in Mandelbrot set
 * @param token2Position Position of second token in Mandelbrot set 
 * @param blocksSinceConnection Number of blocks since connection was made
 * @param parameters Growth parameters
 * @returns New entanglement strength (0-1)
 */
export function calculateEntanglementStrengthGrowth(
  initialStrength: number,
  token1Position: { re: number, im: number },
  token2Position: { re: number, im: number },
  blocksSinceConnection: number,
  parameters: GrowthParameters = DEFAULT_GROWTH_PARAMETERS
): number {
  // Calculate compatibility between the tokens based on Mandelbrot positions
  const distance = Math.sqrt(
    Math.pow(token1Position.re - token2Position.re, 2) +
    Math.pow(token1Position.im - token2Position.im, 2)
  );
  
  // Closer tokens have better compatibility
  const compatibility = 1 / (1 + distance * 10);
  
  // Calculate growth over time using logistic function
  const timeGrowth = parameters.entanglementStrengthGrowth * blocksSinceConnection;
  const logisticGrowth = 1 / (1 + Math.exp(-timeGrowth));
  
  // Combine factors for final strength
  let newStrength = initialStrength + 
                   (1 - initialStrength) * logisticGrowth * compatibility;
  
  // Ensure strength stays between 0-1
  return Math.max(0, Math.min(1, newStrength));
}

/**
 * Calculate a visually pleasing color for a token based on its properties
 * 
 * @param mandelbrotPosition Position in Mandelbrot set
 * @param lifeState Current lifecycle state
 * @param entanglementStrength Quantum connection strength
 * @returns Hex color string
 */
export function calculateTokenColor(
  mandelbrotPosition: { re: number, im: number },
  lifeState: BioZoeLifecycleState,
  entanglementStrength: number
): string {
  // Calculate Mandelbrot iterations for this position (normalized 0-1)
  const iterations = calculateMandelbrotIterations(
    mandelbrotPosition.re,
    mandelbrotPosition.im
  );
  const iterationsNormalized = iterations / MANDELBROT_MAX_ITERATIONS;
  
  // Base hue from Mandelbrot iterations (0-360)
  let hue = iterationsNormalized * 360;
  
  // Adjust hue based on lifecycle state
  switch (lifeState) {
    case BioZoeLifecycleState.SEED:
      // Seeds are in green spectrum
      hue = (hue + 120) % 360;
      break;
    case BioZoeLifecycleState.GROWTH:
      // Growth tokens in blue-green spectrum
      hue = (hue + 180) % 360;
      break;
    case BioZoeLifecycleState.FLOWERING:
      // Flowering tokens in purple-pink spectrum
      hue = (hue + 300) % 360;
      break;
    case BioZoeLifecycleState.LEGACY:
      // Legacy tokens in blue spectrum
      hue = (hue + 240) % 360;
      break;
  }
  
  // Saturation based on entanglement (more entangled = more vibrant)
  const saturation = 0.5 + entanglementStrength * 0.5;
  
  // Lightness based on mandelbrot position
  const lightness = 0.3 + 0.4 * ((mandelbrotPosition.re + 2) / 4);
  
  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness - c / 2;
  
  let r, g, b;
  
  if (hue < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hue < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hue < 180) {
    [r, g, b] = [0, c, x];
  } else if (hue < 240) {
    [r, g, b] = [0, x, c];
  } else if (hue < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  // Convert to hex
  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
`