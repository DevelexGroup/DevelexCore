import type { FixationDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionEvent } from './GazeInteraction.event';

export type GazeInteractionScreenSaccadeEvents = {
    'saccade': GazeInteractionScreenSaccadeEvent
};

/**
 * Fired when a saccade event occurs.
 * @property {'saccadeEnd'} type of the event.
 * @property {number} duration time since the saccade started (in milliseconds).
 * @property {number} distance of the saccade event.
 * @property {number} angleToScreen of the saccade event. Always present.
 * @property {number} angleToPrevious of the saccade event.
 * @property {number} angleToPreviousInvalidityTime time between end of previous fixation and the last saccade (in milliseconds).
 * @property {Element} target of the saccade event.
 * @property {Element} originTarget of the saccade event.
 * @property {FixationDataPoint} targetFixation of the saccade event.
 * @property {FixationDataPoint} originFixation of the saccade event.
 * @property {GazeInteractionSaccadeSettingsType} settings for the saccade event, including the saccade time and callbacks.
 */
export type GazeInteractionScreenSaccadeEvent = {
	type: 'saccade';
	duration: number;
	distance: number;
    angleToScreen: number;
    angleToPrevious?: number;
    angleToPreviousInvalidityTime?: number;
	targetFixation: FixationDataPoint;
    originFixation: FixationDataPoint;
} & GazeInteractionEvent;