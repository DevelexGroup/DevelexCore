import type { GazeInteractionScreenSaccadeEvent } from '$lib/GazeInteraction/GazeInteractionScreen/GazeInteractionScreenSaccadeEvent';
import { GazeInteractionObjectSaccade } from '$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSaccade';
import type { GazeInteractionObjectSetSaccadeEvent, GazeInteractionObjectSetSaccadeEvents } from './GazeInteractionObjectSetSaccadeEvent';
import type { GazeInteractionObjectSetSaccadePayload, GazeInteractionObjectSetSaccadeSettings } from './GazeInteractionObjectSetSaccadeSettings';

/**
 * 
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSetSaccade extends GazeInteractionObjectSaccade<GazeInteractionObjectSetSaccadeEvents, GazeInteractionObjectSetSaccadePayload> {

	triggeredTargetsTo: Element[] = [];
	triggeredSettingsTo: GazeInteractionObjectSetSaccadeSettings[] = [];
	triggeredTargetsFrom: Element[] = [];
	triggeredSettingsFrom: GazeInteractionObjectSetSaccadeSettings[] = [];

	defaultSettings: GazeInteractionObjectSetSaccadeSettings = {
		bufferSize: 100,
		saccadeFrom: () => {},
		saccadeTo: () => {}
	};

	evaluateInputData(data: GazeInteractionScreenSaccadeEvent): void {
		this.triggeredTargetsTo = [];
		this.triggeredSettingsTo = [];
		this.triggeredTargetsFrom = [];
		this.triggeredSettingsFrom = [];

		super.evaluateInputData(data); // This is the original code from the parent class evaluating each listener for activation

		const eventTo = this.createSaccadeEvent('saccadeTo', this.triggeredTargetsTo, this.triggeredSettingsTo, data);
		const eventFrom = this.createSaccadeEvent('saccadeFrom', this.triggeredTargetsFrom, this.triggeredSettingsFrom, data);

		this.triggeredSettingsFrom.forEach((settings) => settings.saccadeFrom(eventFrom));
		this.triggeredSettingsTo.forEach((settings) => settings.saccadeTo(eventTo));

		this.emit(eventTo.type, eventTo);
		this.emit(eventFrom.type, eventFrom);
	}

	evaluateActiveListener(data: GazeInteractionScreenSaccadeEvent, listener: GazeInteractionObjectSetSaccadePayload['listener'], isTo: boolean) {
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
	 * @param elapsed - The elapsed time of the fixation event.
	 * @param data - The gaze data associated with the fixation event.
	 * @returns The created fixation event object.
	 */
	createSaccadeEvent(
		type: GazeInteractionObjectSetSaccadeEvent['type'],
		target: Element[],
		settings: GazeInteractionObjectSetSaccadeSettings[],
		data: GazeInteractionScreenSaccadeEvent,
	): GazeInteractionObjectSetSaccadeEvent {
		return {
            ...data,
			type,
			target,
			settings
		};
	}
}