import type { GazeInteractionObjectSaccadePayload } from './GazeInteractionObjectSaccadeSettings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectSaccadeEvents } from './GazeInteractionObjectSaccadeEvent';
import type { GazeInteractionScreenSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccadeEvent';
import type { GazeInteractionScreenSaccade } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccade';

/**
 * Manages saccade events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export abstract class GazeInteractionObjectSaccade<
	TInteractionEvents extends GazeInteractionObjectSaccadeEvents,
	TListenerPayload extends GazeInteractionObjectSaccadePayload
> extends GazeInteractionObject<TInteractionEvents, GazeInteractionScreenSaccadeEvent, TListenerPayload> {

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
	generateListener(element: Element, settings: TListenerPayload['listener']['settings']): TListenerPayload['listener'] {
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
	evaluateListener(data: GazeInteractionScreenSaccadeEvent, listener: TListenerPayload['listener']) {
		const isTo = this.isInside(listener.element, data.gazeData.x, data.gazeData.y, listener.settings.bufferSize);
		const isFrom = this.isInside(listener.element, data.originGazeData.x, data.originGazeData.y, listener.settings.bufferSize);
		if (!isTo && !isFrom) return;
		this.evaluateActiveListener(data, listener, isTo);
	}

	abstract evaluateActiveListener(data: GazeInteractionScreenSaccadeEvent, listener: TListenerPayload['listener'], isTo: boolean): void;
}