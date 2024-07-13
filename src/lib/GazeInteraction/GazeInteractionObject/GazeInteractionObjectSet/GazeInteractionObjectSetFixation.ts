import type { GazeInteractionObjectSetFixationEvents, GazeInteractionObjectSetFixationEvent } from './GazeInteractionObjectSetFixationEvent';
import type { GazeInteractionScreenFixationEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenFixationEvent';
import { GazeInteractionObjectFixation } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectFixation';
import type { GazeInteractionObjectSetFixationSettings, GazeInteractionObjectSetFixationPayload } from './GazeInteractionObjectSetFixationSettings';

/**
 * 
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSetFixation extends GazeInteractionObjectFixation<GazeInteractionObjectSetFixationEvents, GazeInteractionObjectSetFixationPayload> {

	triggeredTargets: Element[] = [];
	triggeredSettings: GazeInteractionObjectSetFixationPayload["listener"]["settings"][] = [];

	defaultSettings: GazeInteractionObjectSetFixationPayload["listener"]["settings"] = {
		bufferSize: 100,
		fixationSetStart: () => {},
		fixationSetEnd: () => {},
		fixationSetProgress: () => {}
	};

	evaluateInputData(data: GazeInteractionScreenFixationEvent): void {
		this.triggeredTargets = [];
		this.triggeredSettings = [];

		super.evaluateInputData(data); // This is the original code from the parent class evaluating each listener for activation

		const eventType = data.type === 'fixationStart' ? 'fixationSetStart' : data.type === 'fixationEnd' ? 'fixationSetEnd' : 'fixationSetProgress' as const;
		if (eventType === 'fixationSetEnd')	console.log('fixationSetEnd');
		const event = this.createFixationEvent(eventType, this.triggeredTargets, this.triggeredSettings, data);
		this.listeners.forEach((listener) => listener.settings[event.type](event));
	}

	evaluateActiveListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectSetFixationPayload['listener']): void {
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
		type: GazeInteractionObjectSetFixationEvent['type'],
		elements: Element[],
		settings: GazeInteractionObjectSetFixationPayload["listener"]["settings"][],
		data: GazeInteractionScreenFixationEvent
	): GazeInteractionObjectSetFixationEvent {
		return {
            ...data,
			type,
			target: elements,
			settings
		};
	}
}