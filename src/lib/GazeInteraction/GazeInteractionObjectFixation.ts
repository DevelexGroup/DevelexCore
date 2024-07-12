import type { GazeInteractionFixationSettings, GazeInteractionObjectFixationListener, GazeInteractionObjectFixationPayload } from './GazeInteractionObjectFixationSettings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectFixationInEvents, GazeInteractionObjectFixationInEvent } from './GazeInteractionObjectFixationEvent';
import type { GazeInteractionScreenFixationEvent } from './GazeInteractionScreenFixationEvent';
import type { GazeInteractionScreenFixation } from './GazeInteractionScreenFixation';

/**
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectFixation extends GazeInteractionObject<GazeInteractionObjectFixationInEvents, GazeInteractionScreenFixationEvent, GazeInteractionObjectFixationPayload> {

	defaultSettings: GazeInteractionFixationSettings = {
		bufferSize: 100,
		fixationInStart: () => {},
		fixationInEnd: () => {},
		fixationInProgress: () => {}
	};

    connect(input: GazeInteractionScreenFixation): void {
        input.on('fixation', this.inputCallback);
    }

    disconnect(input: GazeInteractionScreenFixation): void {
        input.off('fixation', this.inputCallback);
    }

	/**
	 * Generates a listener object for fixation events.
	 * There is a timestamp property to keep track of the fixation time. Null if the fixation is not active.
	 * @param element to attach the listener to.
	 * @param settings for the fixation events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectFixationListener['settings']): GazeInteractionObjectFixationListener {
		return {
			element,
			settings
		};
	}

	/**
	 * Evaluates the listener for fixation events and calls the callbacks if valid.
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for fixation events.
	 */
	evaluateListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectFixationListener) {
		if (!this.isInside(listener.element, data.gazeData.x, data.gazeData.y, listener.settings.bufferSize)) return
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
	 * @param elapsed - The elapsed time of the fixation event.
	 * @param data - The gaze data associated with the fixation event.
	 * @returns The created fixation event object.
	 */
	createFixationEvent(
		type: GazeInteractionObjectFixationInEvent['type'],
		listener: GazeInteractionObjectFixationListener,
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