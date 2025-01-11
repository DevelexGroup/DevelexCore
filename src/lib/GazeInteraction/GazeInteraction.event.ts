/**
 * Base interface for all gaze interaction events with mandatory properties.
 * @property {string} type of the event.
 * @property {string} sessionId of the event.
 * @property {string} timestamp of the event in ISO 8601 format.
 */
export interface GazeInteractionEvent {
	type: string;
    sessionId: string;
	timestamp: string;
}