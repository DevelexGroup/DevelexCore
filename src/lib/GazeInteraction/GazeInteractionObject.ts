import type { EventMap } from "$lib/Emitter/Emitter";
import { GazeInteraction } from "./GazeInteraction";
import type { GazeInteractionObjectListenerPayload } from "./GazeInteractionObject.settings";

export abstract class GazeInteractionObject<
	TInteractionEvents extends EventMap,
	TInputData extends { type: string },
	TListenerPayload extends GazeInteractionObjectListenerPayload> extends GazeInteraction<TInteractionEvents, TInputData> {
    
    abstract defaultSettings: TListenerPayload['listener']['settings'];
	
	listeners: TListenerPayload['listener'][] = [];

    /**
	 * Registers an element for object events with the given settings.
     * @param element - Element to register for object events.
	 * @param settings - Settings for the events, including callbacks when the event is activated, finished, or canceled.
	 */
    register(element: Element, settings: Partial<TListenerPayload['listener']['settings']>): void {
		const mergedSettings = { ...this.defaultSettings, ...settings };
        this.listeners.push(this.generateListener(element, mergedSettings));
    }

    /**
	 * Unregisters an element from object events.
	 * @param {Element} element - Element to unregister from object events.
	 */
    unregister(element: Element): void {
        this.listeners = this.listeners.filter((listener) => listener.element !== element);
    }

    /**
	 * Calls the listeners' callbacks if valid for object events.
	 * If there is a need for further action, method should be overridden with using the super method to call the listeners' callbacks first.
	 * @param {GazeDataPoint} data - The eye-tracker data to evaluate.
	 */
    evaluate(data: TInputData): void {
		this.listeners.forEach((listener) => {
			this.evaluateListener(data, listener);
		});
    }

    /**
	 * Checks if the given coordinates are inside the given element's bounding box.
	 * 
	 * This should not be decoupled, yet, to a separate InteractionObject class, as
	 * every registered object in every interaction type can have different parameters.
	 * 
	 * @param element to check if the given coordinates are inside.
	 * @param x in pixels in the viewport.
	 * @param y in pixels in the viewport.
	 * @param bufferSize in pixels to expand the element's bounding box (to make it easier to trigger the dwell event).
	 * @returns
	 */
	isInside(element: Element, x: number, y: number, bufferSize: number): boolean {
		const { top, left, right, bottom } = element.getBoundingClientRect();
		return (
			x >= left - bufferSize &&
			x <= right + bufferSize &&
			y >= top - bufferSize &&
			y <= bottom + bufferSize
		);
	}

    abstract generateListener(element: Element, settings: TListenerPayload['listener']['settings']): TListenerPayload['listener'];

    /**
	 * Abstract method to evaluate a listener for object events.
	 * @param data - The eye-tracker data to evaluate.
	 * @param listener - The listener object to evaluate.
	 */
    abstract evaluateListener(data: TListenerPayload['data'], listener: TListenerPayload['listener']): void;
}
