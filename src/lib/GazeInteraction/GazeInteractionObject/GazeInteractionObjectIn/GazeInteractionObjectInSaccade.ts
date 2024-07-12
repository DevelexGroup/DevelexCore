import type { GazeInteractionScreenSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccadeEvent';
import { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSaccade';
import type { GazeInteractionObjectInSaccadeEvent, GazeInteractionObjectInSaccadeEvents } from './GazeInteractionObjectInSaccadeEvent';
import type { GazeInteractionObjectInSaccadeListener, GazeInteractionObjectInSaccadePayload, GazeInteractionObjectInSaccadeSettings } from './GazeInteractionObjectInSaccadeSettings';

/**
 * 
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectInSaccade extends GazeInteractionObjectSaccade<GazeInteractionObjectInSaccadeEvents, GazeInteractionObjectInSaccadePayload> {

	defaultSettings: GazeInteractionObjectInSaccadeSettings = {
		bufferSize: 100,
		saccadeFrom: () => {},
		saccadeTo: () => {}
	};

	evaluateActiveListener(data: GazeInteractionScreenSaccadeEvent, listener: GazeInteractionObjectInSaccadePayload['listener'], isTo: boolean) {
		const eventType = isTo ? 'saccadeTo' : 'saccadeFrom';
		const event = this.createSaccadeEvent(eventType, listener, data);
		this.emit(event.type, event);
		listener.settings[event.type](event);
	}

	/**
	 * Creates an event object for the fixation event.
	 * @param type - The type of the fixation event ('fixationProgress', 'fixationFinish', 'fixationCancel').
	 * @param listener - The listener object for the fixation event.
	 * @param timestamp - The timestamp of the fixation event.
	 * @param elapsed - The elapsed time of the fixation event.
	 * @param data - The gaze data associated with the fixation event.
	 * @returns The created fixation event object.
	 */
	createSaccadeEvent(
		type: GazeInteractionObjectInSaccadeEvent['type'],
		listener: GazeInteractionObjectInSaccadeListener,
		data: GazeInteractionScreenSaccadeEvent,
	): GazeInteractionObjectInSaccadeEvent {
		const { element, settings } = listener;
		return {
            ...data,
			type,
			target: element,
			settings
		};
	}
}