import type { GazeInteractionObjectSaccadeEvent } from './GazeInteractionObjectSaccadeEvent';

/**
 * Event callback type for GazeInteractionSaccade.
 * @param event The gaze dwell event object (either progress, cancel, or finish).
 */
export type GazeInteractionSaccadeCallbackType = (event: GazeInteractionObjectSaccadeEvent) => unknown;
