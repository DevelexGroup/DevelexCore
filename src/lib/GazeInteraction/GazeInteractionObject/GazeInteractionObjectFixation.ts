import type { GazeInteractionObjectFixationPayload } from './GazeInteractionObjectFixationSettings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectFixationEvents } from './GazeInteractionObjectFixationEvent';
import type { GazeInteractionScreenFixationEvent } from '../GazeInteractionScreen/GazeInteractionScreenFixationEvent';
import type { GazeInteractionScreenFixation } from '../GazeInteractionScreen/GazeInteractionScreenFixation';

/**
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export abstract class GazeInteractionObjectFixation<
	TInteractionEvents extends GazeInteractionObjectFixationEvents,
	TListenerPayload extends GazeInteractionObjectFixationPayload
> extends GazeInteractionObject<TInteractionEvents, GazeInteractionScreenFixationEvent, TListenerPayload> {

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
	generateListener(element: Element, settings: TListenerPayload['listener']['settings']): TListenerPayload['listener'] {
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
	evaluateListener(data: GazeInteractionScreenFixationEvent, listener: TListenerPayload['listener']) {
		if (!this.isInside(listener.element, data.gazeData.x, data.gazeData.y, listener.settings.bufferSize)) return
		this.evaluateActiveListener(data, listener);
	}

	abstract evaluateActiveListener(data: GazeInteractionScreenFixationEvent, listener: TListenerPayload['listener']): void;

}