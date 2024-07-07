/**
 * The main functionality of the library. Creating an instance of an eye tracking input. Immutable!
 */ 
export { createGazeInput } from '$lib/GazeInput/index.js';

/**
 * Configuration types for the input.
 */
export type { GazeInputConfig, GazeInputConfigGazePoint, GazeInputConfigSMI, GazeInputConfigEyelogic, GazeInputConfigDummy, GazeInputConfigWithFixations } from '$lib/GazeInput/GazeInputConfig.js';


export { type GazeDataPoint, type GazeDataPointWithFixation, isGazeDataPointWithFixation } from '$lib/GazeData/GazeData.js';

export { GazeInteractionObjectFixation } from '$lib/GazeInteraction/GazeInteractionObjectFixation.js';

export { GazeInteractionObjectDwell } from '$lib/GazeInteraction/GazeInteractionObjectDwell.js';

export { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/GazeInteractionObjectSaccade.js';