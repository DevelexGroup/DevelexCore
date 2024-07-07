import { type GazeDataPoint, type GazeDataPointWithFixation } from '$lib/GazeData/GazeData';
import type { GazeInteractionObjectSaccadeData, GazeInteractionObjectSaccadeListener, GazeInteractionObjectSaccadePayload } from './GazeInteractionObjectSaccadeListener';
import { GazeInteractionObject } from './GazeInteractionObject';
import type { GazeInteractionObjectSaccadeEvent } from './GazeInteractionObjectSaccadeEvent';
import { decideFixationPhase } from './GazeInteractionHelperFixation';
import type { GazeInteractionSaccadeSettingsType } from './GazeInteractionObjectSaccadeSettings';


/**
 * Manages saccade events from the given eye-tracker input for elements,
 * that have been registered with the given settings.
 * 
 * It works on an interval between two fixations. So it is not a very accurate method.
 */
export class GazeInteractionObjectSaccade extends GazeInteractionObject<GazeInteractionObjectSaccadePayload> {

    defaultSettings: GazeInteractionSaccadeSettingsType = {
        bufferSize: 100,
        onSaccadeFrom: () => {},
        onSaccadeTo: () => {}
    };

    endOfFirstFixation: GazeDataPointWithFixation | null = null;
    startOfSecondFixation: GazeDataPointWithFixation | null = null;
    lastfixationPoint: GazeDataPointWithFixation | null = null;

    lastSaccadeData: GazeInteractionObjectSaccadeData | null = null;

    private processFixationPhase = {
        "start": (data: ReturnType<typeof decideFixationPhase>) => this.processFixationPhaseStart(data),
        "end": (data: ReturnType<typeof decideFixationPhase>) => this.processFixationPhaseEnd(data),
        "start-end": (data: ReturnType<typeof decideFixationPhase>) => this.processFixationPhaseStartEnd(data),
        "progress": () => this.processFixationPhaseProgress(),
        "none": () => this.processFixationPhaseNone()
    }

	/**
	 * Listeners should be evaluated if the gaze data is valid. Either the left or right eye must be valid.
	 * @param data gaze data to evaluate.
	 * @returns boolean whether to evaluate the listeners or not.
	 */
	shouldEvaluateListeners(data: GazeDataPoint): GazeInteractionObjectSaccadeData | null {
        const phaseAndFixationPoint = decideFixationPhase(data, this.lastfixationPoint);
        const isNewSaccade = this.processFixationPhase[phaseAndFixationPoint.fixationPhase](phaseAndFixationPoint);
        this.lastfixationPoint = phaseAndFixationPoint.fixationPoint;
        if (isNewSaccade) {
            const fixationOne = this.endOfFirstFixation as GazeDataPointWithFixation;
            const fixationTwo = this.startOfSecondFixation as GazeDataPointWithFixation;
            const saccadeData = this.createSaccadeData(fixationOne, fixationTwo);
            this.lastSaccadeData = saccadeData;
            return saccadeData;
        }
        return null;
	}

    createSaccadeData(fixationOne: GazeDataPointWithFixation, fixationTwo: GazeDataPointWithFixation): GazeInteractionObjectSaccadeData {
        const angleToScreen = this.calculateAngleToScreen(fixationOne.x, fixationOne.y, fixationTwo.x, fixationTwo.y);
        const distance = this.calculateDistance(fixationOne.x, fixationOne.y, fixationTwo.x, fixationTwo.y);
        const duration = fixationTwo.timestamp - fixationOne.timestamp;
        const timestamp = fixationOne.timestamp;

        if (this.lastSaccadeData === null) {
            return {
                timestamp,
                duration,
                distance,
                angleToScreen,
                gazeData: fixationTwo,
                originGazeData: fixationOne
            };
        }

        const angleToPrevious = this.calculateAngleToPrevious(this.lastSaccadeData.angleToScreen, angleToScreen);
        const angleToPreviousInvalidityTime = (fixationOne.timestamp - fixationOne.fixationDuration) - this.lastSaccadeData.timestamp;

        return {
            timestamp,
            duration,
            distance,
            angleToScreen,
            angleToPrevious,
            angleToPreviousInvalidityTime,
            gazeData: fixationTwo,
            originGazeData: fixationOne
        };
    }

    /**
     * Calculates the angle to the horizontal screen axis.
     * @param x1 x-coordinate of the first point.
     * @param y1 y-coordinate of the first point.
     * @param x2 x-coordinate of the second point. 
     * @param y2 y-coordinate of the second point. 
     * @returns the angle to the horizontal screen axis (in degrees between -180 and 180).
     */
    calculateAngleToScreen(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

    /**
     * Calculate angle to previous angle.
     * @param previousAngle The previous angle.
     * @param currentAngle The current angle.
     * @returns the angle to the previous angle (in degrees between -180 and 180).
     */
    calculateAngleToPrevious(angleOne: number, angleTwo: number): number {
        return (angleTwo - angleOne + 180) % 360 - 180;
    }

    /**
     * Calculates the distance between two points.
     * @param x1 x-coordinate of the first point.
     * @param y1 y-coordinate of the first point.
     * @param x2 x-coordinate of the second point. 
     * @param y2 y-coordinate of the second point. 
     * @returns the distance between two points.
     */
    calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    /**
     * Listeners should not be evaluated for the 'none' phase.
     * @param data The eye-tracker data to evaluate.
     * @returns false - no evaluation needed.
     */
    private processFixationPhaseNone(): boolean {
        // TODO Consider on invalid data to reset the last fixation point.
        return false;
    }

    /**
     * Listeners should not be evaluated for the 'progress' phase.
     * No changes in the saccade state.
     * @param data The eye-tracker data to evaluate.
     * @returns false - no evaluation needed.
     */
    private processFixationPhaseProgress(): boolean {
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
        if (this.endOfFirstFixation === null) this.endOfFirstFixation = this.lastfixationPoint;
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
	evaluateListener(data: GazeInteractionObjectSaccadeData, listener: GazeInteractionObjectSaccadeListener) {
        const { onSaccadeFrom, onSaccadeTo } = listener.settings;
        if (this.isInside(listener.element, data.originGazeData.x, data.originGazeData.y, listener.settings.bufferSize)) {
            onSaccadeFrom(this.createSaccadeEvent('saccadeFrom', listener, data));
        }
        if (this.isInside(listener.element, data.gazeData.x, data.gazeData.y, listener.settings.bufferSize)) {
            onSaccadeTo(this.createSaccadeEvent('saccadeTo', listener, data));
        }
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
		data: GazeInteractionObjectSaccadeData
	): GazeInteractionObjectSaccadeEvent {
		const { element, settings } = listener;
		return {
            ...data,
            type,
            target: element,
            settings
        };
    }
}