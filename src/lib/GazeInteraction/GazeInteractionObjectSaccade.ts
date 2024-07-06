import { type GazeDataPoint, type GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectSaccadeListener } from './GazeInteractionObjectSaccadeListener';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectSaccadeEvent } from './GazeInteractionObjectSaccadeEvent';
import { decideFixationPhase } from './GazeInteractionHelperFixation';

/**
 * Manages saccade events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 */
export class GazeInteractionObjectSaccade extends GazeInteractionObject<GazeInteractionObjectSaccadeListener> {

    endOfFirstFixation: GazeDataPointWithFixation | null = null;
    startOfSecondFixation: GazeDataPointWithFixation | null = null;
    lastfixationPoint: GazeDataPointWithFixation | null = null;

    private processFixationPhase = {
        "start": this.processFixationPhaseStart.bind(this),
        "end": this.processFixationPhaseEnd.bind(this),
        "start-end": this.processFixationPhaseStartEnd.bind(this),
        "progress": this.processFixationPhaseNone.bind(this),
        "none": this.processFixationPhaseNone.bind(this)
    }

	/**
	 * Listeners should be evaluated if the gaze data is valid. Either the left or right eye must be valid.
	 * @param data gaze data to evaluate.
	 * @returns boolean whether to evaluate the listeners or not.
	 */
	shouldEvaluateListeners(data: GazeDataPoint): boolean {
        const phaseAndFixationPoint = decideFixationPhase(data, this.lastfixationPoint);
        this.lastfixationPoint = phaseAndFixationPoint.fixationPoint;
        return this.processFixationPhase[phaseAndFixationPoint.fixationPhase](phaseAndFixationPoint);
	}

    /**
     * Listeners should not be evaluated for the 'none' or 'progress' phase.
     * No changes in the saccade state.
     * @param data The eye-tracker data to evaluate.
     * @returns false - no evaluation needed.
     */
    private processFixationPhaseNone(): boolean {
        return false;
    }

    /**
     * Listeners should be evaluated for the 'start' phase if it is the second fixation.
     * The first fixation is stored as the end of the first fixation.
     * @param data The eye-tracker data to evaluate.
     * @returns boolean whether to evaluate the listeners or not.
     */
    private processFixationPhaseStart(data: ReturnType<typeof decideFixationPhase>) {
        if (this.startOfSecondFixation === null) {
            this.startOfSecondFixation = data.fixationPoint;
            return true;
        }
        this.startOfSecondFixation = null;
        this.endOfFirstFixation = null;
        return false;
    }

    /**
     * Listeners should not be evaluated for the 'end' phase. However, the end of the first fixation is stored.
     * @param data The eye-tracker data to evaluate.
     * @returns false - no evaluation needed.
     */
    private processFixationPhaseEnd(data: ReturnType<typeof decideFixationPhase>) {
        if (this.endOfFirstFixation === null) this.endOfFirstFixation = data.fixationPoint;
        return false;
    }

    /**
     * Won't happen often, but if so, just call end and start.
     * @param data The eye-tracker data to evaluate.
     * @returns boolean whether to evaluate the listeners or not.
     */
    private processFixationPhaseStartEnd(data: ReturnType<typeof decideFixationPhase>) {
        this.processFixationPhaseEnd(data);
        return this.processFixationPhaseStart(data);
    }

	/**
	 * Generates a listener object for saccade events.
	 * There is a timestamp property to keep track of the saccade time. Null if the saccade is not active.
	 * @param element to attach the listener to.
	 * @param settings for the saccade events.
	 * @returns the generated listener object.
	 */
	generateListener(element: Element, settings: GazeInteractionObjectSaccadeListener['settings']): GazeInteractionObjectSaccadeListener {
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
	evaluateListener(data: GazeDataPoint, listener: GazeInteractionObjectSaccadeListener) {
        const { element, settings } = listener;
        const { bufferSize } = settings;
        const point1 = this.endOfFirstFixation as GazeDataPointWithFixation; // assumption due to shouldEvaluateListeners
        const point2 = this.startOfSecondFixation as GazeDataPointWithFixation; // assumption due to shouldEvaluateListeners

        /**todo tomorrow
         * 1. Calculate the angle between the two points.
        if (this.isInside(element, x, y, bufferSize)) {
            this.emitSaccadeEvent('saccadeTo', listener, timestamp, data);
        } else {
            this.emitSaccadeEvent('saccadeFrom', listener, timestamp, data);
        }
            */
	}

    /**
     * Calculates the angle to the horizontal screen axis.
     * @param x1 x-coordinate of the first point.
     * @param y1 y-coordinate of the first point.
     * @param x2 x-coordinate of the second point. 
     * @param y2 y-coordinate of the second point. 
     * @returns the angle to the horizontal screen axis.
     */
    calculateAngleToScreen(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

	/**
	 * Creates an event object for the saccade event.
	 * @param type - The type of the saccade event ('saccadeProgress', 'saccadeFinish', 'saccadeCancel').
	 * @param listener - The listener object for the saccade event.
	 * @param timestamp - The timestamp of the saccade event.
	 * @param elapsed - The elapsed time of the saccade event.
	 * @param data - The gaze data associated with the saccade event.
	 * @returns The created saccade event object.
	 */
	createSaccadeEvent(
		type: 'saccadeTo' | 'saccadeFrom',
		listener: GazeInteractionObjectSaccadeListener,
		timestamp: number,
		duration: number,
		data: GazeDataPoint
	): GazeInteractionObjectSaccadeEvent {
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