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

	triggeredTargets: Element[] = [];
	triggeredSettings: GazeInteractionInFixationSettings[] = [];

	defaultSettings: GazeInteractionInFixationSettings = {
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
		const event = this.createFixationEvent(eventType, this.triggeredTargets, this.triggeredSettings, data);
		this.emit(event.type, event);
		this.triggeredSettings.forEach((settings) => settings[event.type](event));
	}

	evaluateActiveListener(data: GazeInteractionScreenFixationEvent, listener: GazeInteractionObjectInFixationPayload['listener']): void {
		this.triggeredTargets.push(listener.element);
		this.triggeredSettings.push(listener.settings);
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
		elements: Element[],
		settings: GazeInteractionInFixationSettings[],
		data: GazeInteractionScreenFixationEvent
	): GazeInteractionObjectInFixationEvent {
		return {
            ...data,
			type,
			target: elements,
			settings
		};
	}
}