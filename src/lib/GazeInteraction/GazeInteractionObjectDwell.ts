import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectDwellListener, GazeInteractionObjectDwellPayload } from './GazeInteractionObjectDwell.settings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectDwellEvent, GazeInteractionObjectDwellEvents } from './GazeInteractionObjectDwell.event';
import type { GazeInteractionDwellSettingsType } from './GazeInteractionObjectDwell.settings';
import { getISO8601TimestampFromUnix } from '$lib/utils/timeUtils';

/**
 * Manages dwell events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 * 
 * Implements a forgiving tolerance mechanism: When the gaze briefly moves outside 
 * the element but returns within the toleranceTime window, the dwell continues 
 * to progress as if the gaze never left. This helps accommodate tracking noise,
 * microsaccades, and slight jitter, making the interaction more natural and robust.
 */
export class GazeInteractionObjectDwell extends GazeInteractionObject<GazeInteractionObjectDwellEvents, GazeDataPoint, GazeInteractionObjectDwellPayload> {

	defaultSettings: GazeInteractionDwellSettingsType = {
		dwellTime: 1000,
		bufferSize: 100,
		toleranceTime: 0, // Time in ms to allow gaze to be outside before canceling (0 = no tolerance)
		onDwellProgress: () => {},
		onDwellFinish: () => {},
		onDwellCancel: () => {}
	};

	/**
	 * Evaluates the listener for dwell events and calls the callbacks if valid.
	 * Implements a forgiving tolerance mechanism where dwell continues to progress
	 * even during brief excursions outside the element, as long as they are shorter
	 * than the specified toleranceTime.
	 * 
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for dwell events.
	 */
	evaluateListener(data: GazeDataPoint, listener: GazeInteractionObjectDwellListener) {
		const { element, settings, timestamp, lastOutsideTimestamp } = listener;
		const { dwellTime, bufferSize, toleranceTime, onDwellProgress, onDwellFinish, onDwellCancel } = settings;
		const { x, y } = data;
		const currentTime = Date.now();
		const isInside = this.isInside(element, x, y, bufferSize);

		// Start a new dwell if not already started
		if (timestamp === null && isInside) {
			const startDwellEvent = this.createDwellEvent(
				'dwellProgress',
				listener,
				getISO8601TimestampFromUnix(currentTime),
				0,
				data
			);
			onDwellProgress(startDwellEvent);
			this.emit('dwellProgress', startDwellEvent);
			this.emit('dwell', startDwellEvent);
			listener.timestamp = currentTime;
			listener.lastOutsideTimestamp = null;
			return;
		}

		// If no active dwell, nothing more to do
		if (timestamp === null) return;

		if (isInside) {
			// Reset the outside timestamp if we're back inside
			listener.lastOutsideTimestamp = null;
		} else {
			// Gaze is outside the element
			if (lastOutsideTimestamp === null) {
				// First sample outside - mark the time
				listener.lastOutsideTimestamp = currentTime;
			} else {
				// Check if we've exceeded the tolerance time
				const timeOutside = currentTime - lastOutsideTimestamp;
				if (timeOutside >= toleranceTime) {
					// Exceeded tolerance, cancel the dwell
					const timeElapsed = currentTime - timestamp;
					const cancelDwellEvent = this.createDwellEvent(
						'dwellCancel',
						listener,
						getISO8601TimestampFromUnix(currentTime),
						timeElapsed,
						data
					);
					onDwellCancel(cancelDwellEvent);
					this.emit('dwellCancel', cancelDwellEvent);
					this.emit('dwell', cancelDwellEvent);
					listener.timestamp = null;
					listener.lastOutsideTimestamp = null;
					return;
				}
				// Otherwise, continue processing as if inside (tolerance is still valid)
			}
		}

		// Continue dwell progression (whether inside or within tolerance period)
		const timeElapsed = currentTime - timestamp;
		const isOverDwellTime = timeElapsed >= dwellTime;

		if (isOverDwellTime) {
			const finishDwellEvent = this.createDwellEvent(
				'dwellFinish',
				listener,
				getISO8601TimestampFromUnix(currentTime),
				timeElapsed,
				data
			);
			onDwellFinish(finishDwellEvent);
			this.emit('dwellFinish', finishDwellEvent);
			this.emit('dwell', finishDwellEvent);
			listener.timestamp = null;
			listener.lastOutsideTimestamp = null;
		} else {
			const progressDwellEvent = this.createDwellEvent(
				'dwellProgress',
				listener,
				getISO8601TimestampFromUnix(currentTime),
				timeElapsed,
				data
			);
			onDwellProgress(progressDwellEvent);
			this.emit('dwellProgress', progressDwellEvent);
			this.emit('dwell', progressDwellEvent);
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
		timestamp: string,
		duration: number,
		data: GazeDataPoint
	): GazeInteractionObjectDwellEvent {
		const { element, settings } = listener;
		return {
			type,
			timestamp,
			sessionId: data.sessionId,
			duration,
			target: [element],
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
			timestamp: null,
			lastOutsideTimestamp: null // Track when gaze went outside
		};
	}
}