import type { GazeInteractionSaccadeInSettings, GazeInteractionObjectSaccadeInListener, GazeInteractionObjectSaccadeInPayload } from './GazeInteractionObjectSaccadeSettings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectSaccadeInEvents, GazeInteractionObjectSaccadeInEvent } from './GazeInteractionObjectSaccadeEvent';
import type { GazeInteractionScreenSaccadeEvent } from './GazeInteractionScreenSaccadeEvent';
import type { GazeInteractionScreenSaccade } from './GazeInteractionScreenSaccade';

/**
 * Manages saccade events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSaccade extends GazeInteractionObject<GazeInteractionObjectSaccadeInEvents, GazeInteractionScreenSaccadeEvent, GazeInteractionObjectSaccadeInPayload> {

	defaultSettings: GazeInteractionSaccadeInSettings = {
		bufferSize: 100,
		saccadeTo: () => {},
		saccadeFrom: () => {},
	};

    connect(input: GazeInteractionScreenSaccade): void {
        input.on('saccade', this.inputCallback);
    }

    disconnect(input: GazeInteractionScreenSaccade): void {
        input.off('saccade', this.inputCallback);
    }

	/**
	 * Generates a listener object for saccade events.
	 * There is a timestamp property to keep track of the saccade time. Null if the saccade is not active.
	 * @param element to attach the listener to.
	 * @param settings for the saccade events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectSaccadeInListener['settings']): GazeInteractionObjectSaccadeInListener {
		return {
			element,
			settings
		};
	}

	/**
	 * Evaluates the listener for saccade events and calls the callbacks if valid.
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for saccade events.
	 */
	evaluateListener(data: GazeInteractionScreenSaccadeEvent, listener: GazeInteractionObjectSaccadeInListener) {
		const isTo = this.isInside(listener.element, data.gazeData.x, data.gazeData.y, listener.settings.bufferSize);
		const isFrom = this.isInside(listener.element, data.originGazeData.x, data.originGazeData.y, listener.settings.bufferSize);
		if (!isTo && !isFrom) return;
		const eventType = isTo ? 'saccadeTo' : 'saccadeFrom';
		const event = this.createSaccadeEvent(eventType, listener, data);
		this.emit(event.type, event);
		listener.settings[event.type](event);
	}

	/**
	 * Creates an event object for the saccade event.
	 * @param type - The type of the saccade event ('saccadeProgress', 'saccadeFinish', 'saccadeCancel').
	 * @param listener - The listener object for the saccade event.
	 * @param timestamp - The timestamp of the saccade event.
	 * @param elapsed - The elapsed time of the saccade event.
	 * @param data - The gaze data associated with the saccade event.
	 * @returns The created saccade event object.
	 */
	createSaccadeEvent(
		type: GazeInteractionObjectSaccadeInEvent['type'],
		listener: GazeInteractionObjectSaccadeInListener,
		data: GazeInteractionScreenSaccadeEvent
	): GazeInteractionObjectSaccadeInEvent {
		const { element, settings } = listener;
		return {
            ...data,
			type,
			target: element,
			settings
		};
	}
}