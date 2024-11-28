/**
 * Base interface for all gaze interaction events with mandatory properties.
 * @property {string} type of the event.
 * @property {string} sessionId of the event.
 * @property {number} timestamp of the event.
 */
export interface GazeInteractionEvent {
	type: string;
    sessionId: string;
	timestamp: number;
}