import type { GazeDataPoint } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectIntersectListener, GazeInteractionObjectIntersectPayload } from './GazeInteractionObjectIntersect.settings';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectIntersectEvent, GazeInteractionObjectIntersectEvents } from './GazeInteractionObjectIntersect.event';
import type { GazeInteractionObjectIntersectSettingsType } from './GazeInteractionObjectIntersect.settings';

/**
 * Gaze interaction object for intersect events.
 * On every gaze data point, the object checks if the gaze point intersects with the target element.
 * If not, target fields is an empty array.
 */
export class GazeInteractionObjectIntersect extends GazeInteractionObject<GazeInteractionObjectIntersectEvents, GazeDataPoint, GazeInteractionObjectIntersectPayload> {

	defaultSettings: GazeInteractionObjectIntersectSettingsType = {
		bufferSize: 100,
		onIntersect: () => {}
	};

	private triggeredListeners: GazeInteractionObjectIntersectListener[] = [];

	private preAllocatedEvent: GazeInteractionObjectIntersectEvent = {
		sessionId: '',
		timestamp: 0,
		type: 'intersect',
		target: [],
		settings: [],
		gazeData: {} as GazeDataPoint
	};

	/**
	 * Evaluates the listener for dwell events and calls the callbacks if valid.
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for dwell events.
	 */
	evaluateListener(data: GazeDataPoint, listener: GazeInteractionObjectIntersectListener) {
		const { element, settings } = listener;
		const { bufferSize } = settings;
		const { x, y } = data;

		if (this.isInside(element, x, y, bufferSize)) {
			this.triggeredListeners.push(listener);
		}
	}

	evaluate(data: GazeDataPoint): void {
		super.evaluate(data);

		// generate event
		this.updateIntersectEvent(this.triggeredListeners, data.timestamp, data);

		// call the callback functions
		this.triggeredListeners.forEach(listener => listener.settings.onIntersect(this.preAllocatedEvent));

		// Reset the triggered listeners array without reallocating
		this.triggeredListeners.length = 0;

		// emit the event
		this.emit('intersect', this.preAllocatedEvent);
	}

	updateIntersectEvent(listeners: GazeInteractionObjectIntersectListener[], timestamp: number, data: GazeDataPoint): void {
		this.preAllocatedEvent.timestamp = timestamp;
		this.preAllocatedEvent.sessionId = data.sessionId;
		this.preAllocatedEvent.gazeData = data;

		// Update the target and settings arrays in place
		const length = listeners.length;
		this.preAllocatedEvent.target.length = length;  // Adjust array size
		this.preAllocatedEvent.settings.length = length; // Adjust array size

		for (let i = 0; i < length; i++) {
			this.preAllocatedEvent.target[i] = listeners[i].element;
			this.preAllocatedEvent.settings[i] = listeners[i].settings;
		}
	}

	/**
	 * Generates a listener object for dwell events.
	 * There is a timestamp property to keep track of the dwell time. Null if the dwell is not active.
	 * @param element to attach the listener to.
	 * @param settings for the dwell events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectIntersectListener['settings']): GazeInteractionObjectIntersectListener {
		return {
			element,
			settings
		};
	}
}