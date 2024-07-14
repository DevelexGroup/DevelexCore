import type { GazeInteractionEvents } from './GazeInteraction/GazeInteraction';
import type { GazeInteractionListenerPayload, GazeInteractionObject } from './GazeInteraction/GazeInteractionObject/GazeInteractionObject';

/**
 * The main functionality of the library. Creating an instance of an eye tracking input. Immutable!
 */ 
export { createGazeInput } from '$lib/GazeInput/index.js';

/**
 * Configuration types for the input.
 */
export type { GazeInputConfig, GazeInputConfigGazePoint, GazeInputConfigSMI, GazeInputConfigEyelogic, GazeInputConfigDummy, GazeInputConfigWithFixations } from '$lib/GazeInput/GazeInputConfig.js';

export { type GazeInput, isGazeInputWithFixations } from '$lib/GazeInput/GazeInput.js';

export { type GazeDataPoint, type GazeDataPointWithFixation, isGazeDataPointWithFixation } from '$lib/GazeData/GazeData.js';

export { GazeInteractionObjectDwell } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectDwell.js';

export { GazeInteractionObjectInFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInFixation.js';

export { GazeInteractionObjectSetFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetFixation.js';

export { GazeInteractionObjectInSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectIn/GazeInteractionObjectInSaccade.js';

export { GazeInteractionObjectSetSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetSaccade.js';

export { GazeInteractionScreenFixation } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenFixation.js';

export { GazeInteractionScreenSaccade } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccade.js';

export interface GazeInteractionComponentProps<TInteractionEvents extends GazeInteractionEvents, TInputData extends { type: string}, TListenerPayload extends GazeInteractionListenerPayload> {
    gazeInteractionObject: GazeInteractionObject<TInteractionEvents, TInputData, TListenerPayload>;
    settings: Partial<TListenerPayload['listener']['settings']>;
}

export type GazeInteractionComponentPropsDefault = GazeInteractionComponentProps<GazeInteractionEvents, { type: string }, GazeInteractionListenerPayload>