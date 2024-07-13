import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectDwellListener, GazeInteractionObjectDwellPayload } from './GazeInteractionObjectDwellListener';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectDwellEvent } from './GazeInteractionObjectDwellEvent';
import type { GazeInteractionDwellSettingsType } from './GazeInteractionObjectDwellSettings';
import type { GazeInteractionEvents } from '../GazeInteraction';
import type { GazeInput } from '$lib/GazeInput/GazeInput';
import type { GazeInputConfig } from '$lib/GazeInput/GazeInputConfig';

/**
 * Manages dwell events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 * TODO: Implement spatial indexing to improve performance!!! quadtree or something similar.
 */
export class GazeInteractionObjectDwell extends GazeInteractionObject<GazeInteractionEvents, GazeDataPoint, GazeInteractionObjectDwellPayload> {

	defaultSettings: GazeInteractionDwellSettingsType = {
		dwellTime: 1000,
		bufferSize: 100,
		onDwellProgress: () => {},
		onDwellFinish: () => {},
		onDwellCancel: () => {}
	};

	connect(input: GazeInput<GazeInputConfig>): void {
		input.on('data', this.inputCallback);
	}

	disconnect(input: GazeInput<GazeInputConfig>): void {
		input.off('data', this.inputCallback);
	}

	/**
	 * Evaluates the listener for dwell events and calls the callbacks if valid.
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for dwell events.
	 */
	evaluateListener(data: GazeDataPoint, listener: GazeInteractionObjectDwellListener) {
		const { element, settings, timestamp } = listener;
		const { dwellTime, bufferSize, onDwellProgress, onDwellFinish, onDwellCancel } = settings;
		const { x, y } = data;
		const currentTime = Date.now();

		if (this.isInside(element, x, y, bufferSize)) {
			if (timestamp === null) {
				const startDwellEvent = this.createDwellEvent(
					'dwellProgress',
					listener,
					currentTime,
					0,
					data
				);
				onDwellProgress(startDwellEvent);
				listener.timestamp = Date.now();
				return;
			}

			const timeElapsed = currentTime - timestamp;
			const isOverDwellTime = timeElapsed >= dwellTime;

			if (isOverDwellTime) {
				const finishDwellEvent = this.createDwellEvent(
					'dwellFinish',
					listener,
					currentTime,
					timeElapsed,
					data
				);
				onDwellFinish(finishDwellEvent);
				listener.timestamp = null;
				return;
			}

			const progressDwellEvent = this.createDwellEvent(
				'dwellProgress',
				listener,
				currentTime,
				timeElapsed,
				data
			);
			onDwellProgress(progressDwellEvent);
			return;
		}

		if (timestamp !== null) {
			const timeElapsed = currentTime - timestamp;
			const cancelDwellEvent = this.createDwellEvent(
				'dwellCancel',
				listener,
				currentTime,
				timeElapsed,
				data
			);
			onDwellCancel(cancelDwellEvent);
			listener.timestamp = null;
		}
	}

	/**
	 * Creates an event object for the dwell event.
	 * @param type - The type of the dwell event ('dwellProgress', 'dwellFinish', 'dwellCancel').
	 * @param listener - The listener object for the dwell event.
	 * @param timestamp - The timestamp of the dwell event.
	 * @param duration - The duration time of the dwell event.
	 * @param data - The gaze data associated with the dwell event.
	 * @returns The created dwell event object.
	 */
	createDwellEvent(
		type: 'dwellProgress' | 'dwellFinish' | 'dwellCancel',
		listener: GazeInteractionObjectDwellListener,
		timestamp: number,
		duration: number,
		data: GazeDataPoint
	): GazeInteractionObjectDwellEvent {
		const { element, settings } = listener;
		return {
			type,
			timestamp,
			sessionId: data.sessionId,
			duration,
			target: element,
			settings,
			gazeData: data
		};
	}

	/**
	 * Listeners should be evaluated if the gaze data is valid. Either the left or right eye must be valid.
	 * @param data gaze data to evaluate.
	 * @returns boolean whether to evaluate the listeners or not.
	 */
	shouldEvaluateListeners(data: GazeDataPoint): GazeDataPoint | null {
		if (data.validityL || data.validityR) return data;
		return null;
	}

	/**
	 * Generates a listener object for dwell events.
	 * There is a timestamp property to keep track of the dwell time. Null if the dwell is not active.
	 * @param element to attach the listener to.
	 * @param settings for the dwell events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectDwellListener['settings']): GazeInteractionObjectDwellListener {
		return {
			element,
			settings,
			timestamp: null
		};
	}
}
