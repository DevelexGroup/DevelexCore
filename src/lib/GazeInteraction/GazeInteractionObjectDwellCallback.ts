import type { GazeInteractionObjectDwellEvent } from './GazeInteractionObjectDwellEvent';

/**
 * Event callback type for GazeInteractionDwell.
 * @param event The gaze dwell event object (either progress, cancel, or finish).
 */
export type GazeInteractionDwellCallbackType = (event: GazeInteractionObjectDwellEvent) => unknown;
