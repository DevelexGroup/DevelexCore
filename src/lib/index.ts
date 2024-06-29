/**
 * The main functionality of the library. Creating an instance of an eye tracking input. Immutable!
 */ 
export { createGazeInput } from '$lib/GazeInput/index.js';

/**
 * Configuration types for the input.
 */
export type { GazeInputConfig, GazeInputConfigGazePoint, GazeInputConfigDummy, GazeInputConfigWithFixations } from '$lib/GazeInput/GazeInputConfig.js';