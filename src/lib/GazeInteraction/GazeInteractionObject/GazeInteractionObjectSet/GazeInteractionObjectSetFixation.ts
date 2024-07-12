import type { GazeInteractionObjectFixationListener } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixationSettings';
import type { GazeInteractionObjectInFixationEvents, GazeInteractionObjectInFixationEvent } from './GazeInteractionObjectSetFixationEvent';
import type { GazeInteractionScreenFixationEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenFixationEvent';
import { GazeInteractionObjectFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixation';
import type { GazeInteractionInFixationSettings, GazeInteractionObjectInFixationPayload } from './GazeInteractionObjectSetFixationSettings';

/**
 * 
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSetFixation extends GazeInteractionObjectFixation<GazeInteractionObjectInFixationEvents, GazeInteractionObjectInFixationPayload> {

	defaultSettings: GazeInteractionInFixationSettings = {
		bufferSize: 100,
		fixationSetStart: () => {},
		fixationSetEnd: () => {},
		fixationSetProgress: () => {}
	};

	evaluateActiveListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectInFixationPayload['listener']): void {
		const eventType = data.type === 'fixationStart' ? 'fixationSetStart' : data.type === 'fixationEnd' ? 'fixationSetEnd' : 'fixationSetProgress';
		const event = this.createFixationEvent(eventType, listener, data);
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
	createFixationEvent(
		type: GazeInteractionObjectInFixationEvent['type'],
		listener: GazeInteractionObjectFixationListener,
		data: GazeInteractionScreenFixationEvent
	): GazeInteractionObjectInFixationEvent {
		const { element, settings } = listener;
		return {
            ...data,
			type,
			target: element,
			settings
		};
	}
}