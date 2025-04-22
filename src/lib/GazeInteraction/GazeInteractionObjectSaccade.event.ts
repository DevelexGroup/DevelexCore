import type { FixationDataPoint } from '../GazeData/GazeData';
import type { GazeInteractionEvent } from './GazeInteraction.event';
import type { GazeInteractionObjectSaccadeSettings } from './GazeInteractionObjectSaccade.settings';

export type GazeInteractionObjectSaccadeEvents = {
	'saccadeObjectFrom': GazeInteractionObjectSaccadeEvent,
	'saccadeObjectTo': GazeInteractionObjectSaccadeEvent
};

/**
 * Fired when a saccade event occurs.
 * @property {'saccadeTo' | 'saccadeFrom'} type of the event.
 * @property {number} timestamp of the event.
 * @property {number} duration time since the saccade started.
 * @property {number} distance of the saccade event.
 * @property {number} angleToScreen of the saccade event. Always present.
 * @property {number} angleToPrevious of the saccade event.
 * @property {number} angleToPreviousInvalidityTime of the saccade event.
 * @property {Element} target of the saccade event.
 * @property {Element} originTarget of the saccade event.
 * @property {FixationDataPoint} originFixation of the saccade event.
 * @property {FixationDataPoint} targetFixation of the saccade event.
 * @property {GazeInteractionSaccadeSettings} settings for the saccade event, including the saccade time and callbacks.
 */
export interface GazeInteractionObjectSaccadeEvent extends GazeInteractionEvent {
	duration: number;
	distance: number;
    angleToScreen: number;
    angleToPrevious?: number;
    angleToPreviousInvalidityTime?: number;
	originFixation: FixationDataPoint;
    targetFixation: FixationDataPoint;
	type: 'saccadeObjectTo' | 'saccadeObjectFrom';
	target: Element[];
	settings: GazeInteractionObjectSaccadeSettings[];
}