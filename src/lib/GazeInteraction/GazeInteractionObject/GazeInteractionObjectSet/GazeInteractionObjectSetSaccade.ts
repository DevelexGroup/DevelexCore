import type { GazeInteractionScreenSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccadeEvent';
import { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSaccade';
import type { GazeInteractionObjectSetSaccadeEvent, GazeInteractionObjectSetSaccadeEvents } from './GazeInteractionObjectSetSaccadeEvent';
import type { GazeInteractionObjectSetSaccadeListener, GazeInteractionObjectSetSaccadePayload, GazeInteractionObjectSetSaccadeSettings } from './GazeInteractionObjectSetSaccadeSettings';

/**
 * 
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSetSaccade extends GazeInteractionObjectSaccade<GazeInteractionObjectSetSaccadeEvents, GazeInteractionObjectSetSaccadePayload> {

	defaultSettings: GazeInteractionObjectSetSaccadeSettings = {
		bufferSize: 100,
		saccadeFrom: () => {},
		saccadeTo: () => {}
	};

	evaluateActiveListener(data: GazeInteractionScreenSaccadeEvent, listener: GazeInteractionObjectSetSaccadePayload['listener'], isTo: boolean) {
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
		type: GazeInteractionObjectSetSaccadeEvent['type'],
		listener: GazeInteractionObjectSetSaccadeListener,
		data: GazeInteractionScreenSaccadeEvent,
	): GazeInteractionObjectSetSaccadeEvent {
		const { element, settings } = listener;
		return {
            ...data,
			type,
			target: element,
			settings
		};
	}
}