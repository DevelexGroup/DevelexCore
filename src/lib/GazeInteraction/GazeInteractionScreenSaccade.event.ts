import type { GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionEvent } from './GazeInteraction.event';

export type GazeInteractionScreenSaccadeEvents = {
    'saccade': GazeInteractionScreenSaccadeEvent
};

/**
 * Fired when a saccade event occurs.
 * @property {'saccadeEnd'} type of the event.
 * @property {number} duration time since the saccade started.
 * @property {number} angleToScreen of the saccade event. Always present.
 * @property {number} angleToPrevious of the saccade event.
 * @property {number} angleToPreviousInvalidityTime of the saccade event.
 * @property {Element} target of the saccade event.
 * @property {Element} originTarget of the saccade event.
 * @property {GazeDataPoint} gazeData of the saccade event. I.e. the first gaze data point of the saccade.
 * @property {GazeDataPoint} originGazeData of the saccade event.
 * @property {GazeInteractionSaccadeSettingsType} settings for the saccade event, including the saccade time and callbacks.
 */
export type GazeInteractionScreenSaccadeEvent = {
	type: 'saccade';
	duration: number;
	distance: number;
    angleToScreen: number;
    angleToPrevious?: number;
    angleToPreviousInvalidityTime?: number;
	gazeData: GazeDataPointWithFixation;
    originGazeData: GazeDataPointWithFixation;
} & GazeInteractionEvent;