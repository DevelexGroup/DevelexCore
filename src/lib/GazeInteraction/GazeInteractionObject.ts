import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import { GazeInteraction } from "./GazeInteraction";

export type GazeInteractionObjectSettings = Object;

export type GazeInteractionObjectListener = { element: Element; settings: GazeInteractionObjectSettings };

export abstract class GazeInteractionObject<T extends GazeInteractionObjectListener> extends GazeInteraction {
    
    listeners: T[] = [];

    /**
	 * Registers an element for object events with the given settings.
     * @param {Element} element - Element to register for object events.
	 * @param {T} settings - Settings for the events, including callbacks when the event is activated, finished, or canceled.
	 */
    register(element: Element, settings: T['settings']): void {
        this.listeners.push(this.generateListener(element, settings));
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
	 * @param {GazeDataPoint} data - The eye-tracker data to evaluate.
	 */
    evaluateInputData(data: GazeDataPoint): void {
        if (!this.shouldEvaluateListeners(data)) return;
        this.listeners.forEach((listener) => {
            this.evaluateListener(data, listener);
        });
    }

    abstract generateListener(element: Element, settings: T['settings']): T;

    /**
	 * Abstract method to determine if listeners should be evaluated based on input data.
	 * @param {GazeDataPoint} data - The eye-tracker data to evaluate.
	 * @returns {boolean} - Whether to evaluate the listeners or not.
	 */
    abstract shouldEvaluateListeners(data: GazeDataPoint): boolean;

    /**
	 * Abstract method to evaluate a listener for object events.
	 * @param data - The eye-tracker data to evaluate.
	 * @param listener - The listener object to evaluate.
	 */
    abstract evaluateListener(data: GazeDataPoint, listener: T): void;
}
