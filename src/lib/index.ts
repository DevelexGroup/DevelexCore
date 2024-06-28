/**
 * The main functionality of the library. Creating an instance of an eye tracking input. Immutable!
 */ 
export { createETInput } from '$lib/ETInput/index.js';

/**
 * Configuration types for the input.
 */
export type { ETInputConfig, ETInputConfigGazePoint, ETInputConfigDummy, ETInputConfigWithFixations } from '$lib/ETInput/ETInputConfig.js';