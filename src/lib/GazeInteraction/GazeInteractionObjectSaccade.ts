import type { GazeInteractionObjectSaccadePayload, GazeInteractionObjectSaccadeSettings } from './GazeInteractionObjectSaccade.settings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectSaccadeEvent, GazeInteractionObjectSaccadeEvents } from './GazeInteractionObjectSaccade.event';
import type { GazeInteractionScreenSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionScreenSaccadeEvent';

/**
 * Manages saccade events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSaccade<
	TInteractionEvents extends GazeInteractionObjectSaccadeEvents,
	TListenerPayload extends GazeInteractionObjectSaccadePayload
> extends GazeInteractionObject<TInteractionEvents, GazeInteractionScreenSaccadeEvent, TListenerPayload> {

	triggeredTargetsTo: Element[] = [];
	triggeredSettingsTo: GazeInteractionObjectSaccadeSettings[] = [];
	triggeredTargetsFrom: Element[] = [];
	triggeredSettingsFrom: GazeInteractionObjectSaccadeSettings[] = [];

	defaultSettings: GazeInteractionObjectSaccadeSettings = {
		bufferSize: 100,
		saccadeObjectTo: () => {},
		saccadeObjectFrom: () => {}
	};

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

	evaluate(data: GazeInteractionScreenSaccadeEvent): void {
		this.triggeredTargetsTo = [];
		this.triggeredSettingsTo = [];
		this.triggeredTargetsFrom = [];
		this.triggeredSettingsFrom = [];

		super.evaluate(data); // This is the original code from the parent class evaluating each listener for activation

		const eventTo = this.createSaccadeEvent('saccadeObjectTo', this.triggeredTargetsTo, this.triggeredSettingsTo, data);
		const eventFrom = this.createSaccadeEvent('saccadeObjectFrom', this.triggeredTargetsFrom, this.triggeredSettingsFrom, data);

		this.listeners.forEach((listener) => listener.settings.saccadeObjectFrom(eventFrom));
		this.listeners.forEach((listener) => listener.settings.saccadeObjectTo(eventTo));

		this.emit(eventTo.type, eventTo);
		this.emit(eventFrom.type, eventFrom);
		
	}

	evaluateActiveListener(data: GazeInteractionScreenSaccadeEvent, listener: GazeInteractionObjectSaccadePayload['listener'], isTo: boolean) {
		if (isTo) {
			this.triggeredTargetsTo.push(listener.element);
			this.triggeredSettingsTo.push(listener.settings);
		} else {
			this.triggeredTargetsFrom.push(listener.element);
			this.triggeredSettingsFrom.push(listener.settings);
		}
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
	createSaccadeEvent(
		type: GazeInteractionObjectSaccadeEvent['type'],
		target: Element[],
		settings: GazeInteractionObjectSaccadeSettings[],
		data: GazeInteractionScreenSaccadeEvent,
	): GazeInteractionObjectSaccadeEvent {
		return {
            ...data,
			type,
			target,
			settings
		};
	}
}