import type { GazeDataPoint } from '../GazeData/GazeData';
import type { GazeInteractionEvent } from './GazeInteraction.event';
import type { GazeInteractionObjectIntersectSettingsType } from './GazeInteractionObjectIntersect.settings';

export type GazeInteractionObjectIntersectEvents = {
	'intersect': GazeInteractionObjectIntersectEvent;
}; // it must be a type otherwise it won't be recognized by the Emitter

/**
 * Fired when a dwell event occurs.
 * @property {'intersect'} type of the event.
 * @property {Element[]} target of the intersect event.
 * @property {GazeInteractionObjectIntersectType} settings for the intersect event.
 */
export interface GazeInteractionObjectIntersectEvent extends GazeInteractionEvent {
	type: 'intersect';
	target: Element[];
	settings: GazeInteractionObjectIntersectSettingsType[];
	gazeData: GazeDataPoint;
}
