import { GazeInput } from '$lib/GazeInput/GazeInput';
import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionDwellSettingsType } from './GazeInteractionDwellSettingsType';
import type { GazeInteractionDwellListenerType } from './GazeInteractionDwellListenerType';
import type { GazeInteractionDwellEventType } from './GazeInteractionDwellEventType';
import type { GazeInputConfig } from '../GazeInput/GazeInputConfig';

/**
 * Manages dwell events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 * TODO: Implement spatial indexing to improve performance!!! quadtree or something
 *
 * @property {GazeInteractionDwellListenerType[]} listeners The list of registered elements and their settings.
 * @property {ET} eyetracker The eye-tracker to listen to.
 * @property {(data: GazeDataPoint) => void} eyetrackerCallback The callback function to be called when the eye-tracker sends new data.
 */
export class GazeInteractionDwell {
	listeners: GazeInteractionDwellListenerType[];
	eyetracker: GazeInput<GazeInputConfig>;
	readonly eyetrackerCallback: (data: GazeDataPoint) => void = (data) =>
		this.evaluateEyeTrackerData(data);

	constructor(eyetracker: GazeInput<GazeInputConfig>) {
		this.listeners = [];
		this.eyetracker = eyetracker;
		this.init();
	}

	/**
	 * Registers an element for dwell events.
	 * @param element to register for dwell events.
	 * @param settings for the dwell events, including the dwell time and callbacks when the dwell is activated, finished, or canceled.
	 */
	register(element: Element, settings: GazeInteractionDwellSettingsType) {
		this.listeners.push({ element, settings, timestamp: null });
	}

	/**
	 * Unregisters an element from dwell events.
	 * @param element to unregister from dwell events.
	 */
	unregister(element: Element) {
		this.listeners = this.listeners.filter((e) => e.element !== element);
	}

	/**
	 * Activates listening to the eye-tracker for data. Called in the constructor.
	 */
	init() {
		this.eyetracker.on('data', this.eyetrackerCallback);
	}

	/**
	 * Deactivates listening to the eye-tracker for data. Called in the destructor.
	 */
	deactivate() {
		this.eyetracker.off('data', this.eyetrackerCallback);
	}

	/**
	 * Calls the listeners' callbacks if valid for dwell events.
	 * TODO: Implement spatial indexing to improve performance, quadtree or something
	 * @param data The eye-tracker data to evaluate.
	 */
	evaluateEyeTrackerData(data: GazeDataPoint) {
		if (!(data.validityL || data.validityR)) return;
		this.listeners.forEach((listener) => {
			this.evaluateListener(data, listener);
		});
	}

	/**
	 * Evaluates the listener for dwell events and calls the callbacks if valid.
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for dwell events.
	 */
	evaluateListener(data: GazeDataPoint, listener: GazeInteractionDwellListenerType) {
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
	 * Checks if the given coordinates are inside the given element's bounding box.
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

	/**
	 * Creates an event object for the dwell event.
	 * @param type - The type of the dwell event ('dwellProgress', 'dwellFinish', 'dwellCancel').
	 * @param listener - The listener object for the dwell event.
	 * @param timestamp - The timestamp of the dwell event.
	 * @param elapsed - The elapsed time of the dwell event.
	 * @param data - The gaze data associated with the dwell event.
	 * @returns The created dwell event object.
	 */
	createDwellEvent(
		type: 'dwellProgress' | 'dwellFinish' | 'dwellCancel',
		listener: GazeInteractionDwellListenerType,
		timestamp: number,
		elapsed: number,
		data: GazeDataPoint
	): GazeInteractionDwellEventType {
		const { element, settings } = listener;
		return {
			type,
			timestamp,
			elapsed,
			target: element,
			settings,
			gazeData: data
		};
	}
}
