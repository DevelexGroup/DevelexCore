import type { GazeInteractionObjectFixationListener } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationSettings';
import type { GazeInteractionObjectFixationInEvents, GazeInteractionObjectFixationInEvent } from './GazeInteractionObjectInFixationEvent';
import type { GazeInteractionScreenFixationEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenFixationEvent';
import { GazeInteractionObjectFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixation';
import type { GazeInteractionFixationInSettings, GazeInteractionObjectFixationInPayload } from './GazeInteractionObjectInFixationSettings';

/**
 * 
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectInFixation extends GazeInteractionObjectFixation<GazeInteractionObjectFixationInEvents, GazeInteractionObjectFixationInPayload> {

	defaultSettings: GazeInteractionFixationInSettings = {
		bufferSize: 100,
		fixationInStart: () => {},
		fixationInEnd: () => {},
		fixationInProgress: () => {}
	};

	evaluateActiveListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectFixationInPayload['listener']): void {
		const eventType = data.type === 'fixationStart' ? 'fixationInStart' : data.type === 'fixationEnd' ? 'fixationInEnd' : 'fixationInProgress';
		const event = this.createFixationEvent(eventType, listener, data);
		this.emit(event.type, event);
		listener.settings[event.type](event);
	}

	/**
	 * Creates an event object for the fixation event.
	 * @param type - The type of the fixation event ('fixationProgress', 'fixationFinish', 'fixationCancel').
	 * @param listener - The listener object for the fixation event.
	 * @param timestamp - The timestamp of the fixation event.
	 * @param duration - The duration time of the fixation event.
	 * @param data - The gaze data associated with the fixation event.
	 * @returns The created fixation event object.
	 */
	createFixationEvent(
		type: GazeInteractionObjectFixationInEvent['type'],
		listener: GazeInteractionObjectFixationInPayload['listener'],
		data: GazeInteractionScreenFixationEvent
	): GazeInteractionObjectFixationInEvent {
		const { element, settings } = listener;
		return {
            ...data,
			type,
			target: element,
			settings
		};
	}
}