import type { GazeInteractionObjectFixationEvent } from './GazeInteractionObjectFixationEvent';

/**
 * Event callback type for GazeInteractionFixation.
 * @param event The gaze dwell event object (either progress, cancel, or finish).
 */
export type GazeInteractionFixationCallbackType = (event: GazeInteractionObjectFixationEvent) => unknown;
