import type { GazeInteractionObjectFixationPayload } from './GazeInteractionObjectFixation.settings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectFixationEvent, GazeInteractionObjectFixationEvents} from './GazeInteractionObjectFixation.event';
import type { GazeInteractionScreenFixationEvent } from './GazeInteractionScreenFixation.event';

/**
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectFixation extends GazeInteractionObject<GazeInteractionObjectFixationEvents, GazeInteractionScreenFixationEvent, GazeInteractionObjectFixationPayload> {

	triggeredTargets: Element[] = [];
	triggeredSettings: GazeInteractionObjectFixationPayload["listener"]["settings"][] = [];

	defaultSettings: GazeInteractionObjectFixationPayload["listener"]["settings"] = {
		bufferSize: 100,
		fixationObjectStart: () => {},
		fixationObjectEnd: () => {},
		fixationObjectProgress: () => {}
	};

	/**
	 * Generates a listener object for fixation events.
	 * There is a timestamp property to keep track of the fixation time. Null if the fixation is not active.
	 * @param element to attach the listener to.
	 * @param settings for the fixation events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectFixationPayload['listener']['settings']): GazeInteractionObjectFixationPayload['listener'] {
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
	evaluateListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectFixationPayload['listener']) {
		if (!this.isInside(listener.element, data.gazeData.x, data.gazeData.y, listener.settings.bufferSize)) return
		this.evaluateActiveListener(data, listener);
	}

	evaluate(data: GazeInteractionScreenFixationEvent): void {
		this.triggeredTargets = [];
		this.triggeredSettings = [];

		super.evaluate(data); // This is the original code from the parent class evaluating each listener for activation

		const eventType = data.type === 'fixationStart' ? 'fixationObjectStart' : data.type === 'fixationEnd' ? 'fixationObjectEnd' : 'fixationObjectProgress' as const;
		const event = this.createFixationEvent(eventType, this.triggeredTargets, this.triggeredSettings, data);
		this.listeners.forEach((listener) => {

			listener.settings[event.type](event);
		});
		this.emit(eventType, event);
	}

	evaluateActiveListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectFixationPayload['listener']): void {
		this.triggeredTargets.push(listener.element);
		this.triggeredSettings.push(listener.settings);
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
			type: GazeInteractionObjectFixationEvent["type"],
			elements: Element[],
			settings: GazeInteractionObjectFixationPayload["listener"]["settings"][],
			data: GazeInteractionScreenFixationEvent
		): GazeInteractionObjectFixationEvent {
			return {
				...data,
				type,
				target: elements,
				settings,
				fixationId: data.fixationId,
			};
		}

}