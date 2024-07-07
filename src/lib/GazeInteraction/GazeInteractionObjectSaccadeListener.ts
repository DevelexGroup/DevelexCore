import type { GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionSaccadeSettingsType } from './GazeInteractionObjectSaccadeSettings';

/**
 * Listener object for GazeInteractionSaccade.
 * @property {GazeInteractionSaccadeSettingsType} settings for the listener, including the saccade time and callbacks.
 * @property {Element} element that the listener is attached to.
 */
export interface GazeInteractionObjectSaccadeListener {
	settings: GazeInteractionSaccadeSettingsType;
	element: Element
}

export interface GazeInteractionObjectSaccadeData {
    timestamp: number;
	duration: number;
	distance: number;
    angleToScreen: number;
    angleToPrevious?: number;
    angleToPreviousInvalidityTime?: number;
	gazeData: GazeDataPointWithFixation;
	originGazeData: GazeDataPointWithFixation;
}

export interface GazeInteractionObjectSaccadePayload {
	data: GazeInteractionObjectSaccadeData;
	listener: GazeInteractionObjectSaccadeListener;
}