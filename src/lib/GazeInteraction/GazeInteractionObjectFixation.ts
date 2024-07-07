import { isGazeDataPointWithFixation, type GazeDataPoint, type GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectFixationListener, GazeInteractionObjectFixationPayload } from './GazeInteractionObjectFixationListener';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectFixationEvent } from './GazeInteractionObjectFixationEvent';
import type { GazeInteractionFixationSettingsType } from './GazeInteractionObjectFixationSettings';

/**
 * Manages fixation events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectFixation extends GazeInteractionObject<GazeInteractionObjectFixationPayload> {

    defaultSettings: GazeInteractionFixationSettingsType = {
        bufferSize: 100,
        onFixationStart: () => {},
        onFixationEnd: () => {},
        onFixationProgress: () => {}
    };

    evaluateListenerFor = {
        "start": this.evaluateListenerForStart.bind(this),
        "end": this.evaluateListenerForEnd.bind(this),
        "progress": this.evaluateListenerForProgress.bind(this),
        "start-end": this.evaluateListenerForStartEnd.bind(this),
        "none": () => {}
    }

    currentFixationStart: GazeDataPointWithFixation | null = null;
    currentFixationLastPoint: GazeDataPointWithFixation | null = null;
    currentFixationPhase: 'progress' | 'start' | 'end' | 'start-end' | 'none' = 'none';

    /**
     * Evaluates the input gaze data and updates the current fixation state.
     * It rewrited the method from the parent class to ensure processing after the evaluation of the listeners.
     * @param {GazeDataPoint} data - The gaze data to evaluate.
     */
    evaluateInputData(data: GazeDataPoint): void {
        super.evaluateInputData(data); // call the super method to evaluate the listeners
        switch (this.currentFixationPhase) {
            case 'start':
            case 'start-end':    
                this.currentFixationStart = data as GazeDataPointWithFixation;
                this.currentFixationLastPoint = data as GazeDataPointWithFixation;
                break;
            case 'progress':
                this.currentFixationLastPoint = data as GazeDataPointWithFixation;
                break;
            case 'end':
                this.currentFixationStart = null;
                this.currentFixationLastPoint = null;
                break;
        }
    }

	/**
	 * Listeners should be evaluated if the gaze data is valid. Either the left or right eye must be valid.
	 * @param data gaze data to evaluate.
	 * @returns boolean whether to evaluate the listeners or not.
	 */
	shouldEvaluateListeners(data: GazeDataPoint): GazeDataPoint | null {
        const fixationPhase = this.decideFixationPhase(data);
        this.currentFixationPhase = fixationPhase;
        if (fixationPhase !== null) return data;
        return null;
	}

	/**
	 * Generates a listener object for fixation events.
	 * There is a timestamp property to keep track of the fixation time. Null if the fixation is not active.
	 * @param element to attach the listener to.
	 * @param settings for the fixation events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectFixationListener['settings']): GazeInteractionObjectFixationListener {
		return {
			element,
			settings,
            isActive: false,
		};
	}

    /**
     * Determines the fixation phase based on incoming gaze data.
     * If the data corresponds to an ongoing fixation, returns 'progress'.
     * If a new fixation starts, returns 'start'.
     * If a fixation ends, returns 'end'.
     * @param data - The gaze data to evaluate.
     * @returns The determined fixation phase.
     */
       decideFixationPhase(data: GazeDataPoint): 'progress' | 'start' | 'end' | 'start-end' | 'none' {
        if (isGazeDataPointWithFixation(data)) {
            if (data.fixationId === this.currentFixationStart?.fixationId) {
                this.currentFixationLastPoint = data;
                return 'progress';
            } else {
                if (this.currentFixationLastPoint !== null) {
                    return 'start-end';
                } else {
                    return 'start';
                }
            }
        } else {
            if (this.currentFixationLastPoint !== null) {
                return 'end';
            } else {
                return 'none';
            }
        }
    }

	/**
	 * Evaluates the listener for fixation events and calls the callbacks if valid.
	 * @param data The eye-tracker data to evaluate.
	 * @param listener The listener to evaluate for fixation events.
	 */
	evaluateListener(data: GazeDataPoint, listener: GazeInteractionObjectFixationListener) {
        this.evaluateListenerFor[this.currentFixationPhase](data, listener);
	}

    /**
     * Evaluates the listener for fixation end events and calls the callback if valid.
     * @param data The eye-tracker data to evaluate.
     * @param listener The listener to evaluate for fixation end events.
     */
    evaluateListenerForEnd(data: GazeDataPoint, listener: GazeInteractionObjectFixationListener) {
        if (!listener.isActive) return;
        const { onFixationEnd } = listener.settings

        const duration = this.currentFixationLastPoint?.fixationDuration
        if (!duration) throw new Error('lastPoint is null');
        const event = this.createFixationEvent(
            'fixationEnd',
            listener,
            data.timestamp,
            duration,
            data
        );
        onFixationEnd(event);

        listener.isActive = false;
    }

    /**
     * Evaluates the listener for fixation start events and calls the callback if valid.
     * @param data The eye-tracker data to evaluate.
     * @param listener The listener to evaluate for fixation start events.
     */
    evaluateListenerForStart(data: GazeDataPoint, listener: GazeInteractionObjectFixationListener) {

        if (!this.isInside(listener.element, data.x, data.y, listener.settings.bufferSize)) return;

        const { onFixationStart } = listener.settings;
        
        const event = this.createFixationEvent(
            'fixationStart',
            listener,
            data.timestamp,
            0,
            data
        );
        onFixationStart(event);
        listener.isActive = true;
    }

    /**
     * Evaluates the listener for fixation start-end events and calls the callbacks if valid.
     * It first calls the end event, then the start event.
     * @param data The eye-tracker data to evaluate.
     * @param listener The listener to evaluate for fixation start-end events.
     */
    evaluateListenerForStartEnd(data: GazeDataPoint, listener: GazeInteractionObjectFixationListener) {
        this.evaluateListenerForEnd(data, listener);
        this.evaluateListenerForStart(data, listener);
    }
    
    /**
     * Evaluates the listener for fixation progress events and calls the callback if valid.
     * @param data The eye-tracker data to evaluate.
     * @param listener The listener to evaluate for fixation progress events.
     */
    evaluateListenerForProgress(data: GazeDataPoint, listener: GazeInteractionObjectFixationListener) {
        if (!listener.isActive) return;
        const { onFixationProgress } = listener.settings;

        const duration = (data as GazeDataPointWithFixation).fixationDuration;
        if (!duration) throw new Error('lastPoint is null');
        const event = this.createFixationEvent(
            'fixationProgress',
            listener,
            data.timestamp,
            duration,
            data
        );
        onFixationProgress(event);
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
		type: 'fixationProgress' | 'fixationStart' | 'fixationEnd',
		listener: GazeInteractionObjectFixationListener,
		timestamp: number,
		duration: number,
		data: GazeDataPoint
	): GazeInteractionObjectFixationEvent {
		const { element, settings } = listener;
		return {
			type,
			timestamp,
			duration,
			target: element,
			settings,
			gazeData: data
		};
	}
}