import type { ETDwellEventType } from './ETDwellEventType';

/**
 * Event callback type for ETDwell.
 * @param event The gaze dwell event object (either progress, cancel, or finish).
 */
export type ETDwellCallbackType = (event: ETDwellEventType) => unknown;
