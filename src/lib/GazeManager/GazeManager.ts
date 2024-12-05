import { EmitterGroup } from "$lib/Emitter/Emitter";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInput } from "$lib/GazeInput/GazeInput";
import type { GazeInputConfig } from "$lib/GazeInput/GazeInputConfig";
import type { GazeInputEvents } from "$lib/GazeInput/GazeInputEvent";
import { GazeInputFacade } from "$lib/GazeInput/GazeInputFacade";
import { GazeInteractionObjectDwell } from "$lib/GazeInteraction/GazeInteractionObjectDwell";
import type { GazeInteractionObjectDwellEvents } from "$lib/GazeInteraction/GazeInteractionObjectDwell.event";
import { GazeInteractionObjectFixation } from "$lib/GazeInteraction/GazeInteractionObjectFixation";
import type { GazeInteractionObjectFixationEvents } from "$lib/GazeInteraction/GazeInteractionObjectFixation.event";
import { GazeInteractionObjectIntersect } from "$lib/GazeInteraction/GazeInteractionObjectIntersect";
import type { GazeInteractionObjectIntersectEvents } from "$lib/GazeInteraction/GazeInteractionObjectIntersect.event";
import { GazeInteractionObjectSaccade } from "$lib/GazeInteraction/GazeInteractionObjectSaccade";
import type { GazeInteractionObjectSaccadeEvents } from "$lib/GazeInteraction/GazeInteractionObjectSaccade.event";
import { GazeInteractionObjectValidation } from "$lib/GazeInteraction/GazeInteractionObjectValidation";
import type { GazeInteractionObjectValidationEvents } from "$lib/GazeInteraction/GazeInteractionObjectValidation.event";
import { GazeInteractionScreenFixation } from "$lib/GazeInteraction/GazeInteractionScreenFixation";
import type { GazeInteractionScreenFixationEvent, GazeInteractionScreenFixationEvents } from "$lib/GazeInteraction/GazeInteractionScreenFixation.event";
import { GazeInteractionScreenSaccade } from "$lib/GazeInteraction/GazeInteractionScreenSaccade";

import type { GazeInteractionScreenSaccadeEvent, GazeInteractionScreenSaccadeEvents } from "$lib/GazeInteraction/GazeInteractionScreenSaccade.event";
import type { GazeWindowCalibratorConfig, GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";

/**
 * Manager class for gaze interaction.
 * This class connects the input generator (e.g., eye-tracker) with the gaze interaction logic.
 * It routes gaze data to the correct interaction logic, such as fixation, saccade, dwell, or validation.
 * It also manages the registration and unregistration of elements for gaze interaction.
 * 
 * @example
 * const gazeManager = new GazeManager();
 * gazeManager.createInput({ type: 'webgazer' });
 * gazeManager.connect();
 * gazeManager.register({
 *    interaction: 'fixation',
 *    element: document.body,
 *    settings: {
 *      bufferSize: 1000,
 *      fixationObjectStart: () => {},
 *      fixationObjectEnd: () => {},
 *      fixationObjectProgress: () => {}
 * }
 * });
 * gazeManager.on('fixationObjectEnd', (event) => {
 *   console.log(event);
 * });
 */
export class GazeManager extends EmitterGroup<
    GazeInteractionScreenFixationEvents &
    GazeInteractionScreenSaccadeEvents &
    GazeInteractionObjectSaccadeEvents &
    GazeInteractionObjectFixationEvents &
    GazeInteractionObjectDwellEvents &
    GazeInteractionObjectValidationEvents &
    GazeInteractionObjectIntersectEvents &
    GazeInputEvents
> {
    _input: GazeInputFacade;
    fixation: GazeInteractionScreenFixation;
    fixationObject: GazeInteractionObjectFixation;
    saccade: GazeInteractionScreenSaccade;
    saccadeObject: GazeInteractionObjectSaccade;
    dwell: GazeInteractionObjectDwell;
    validation: GazeInteractionObjectValidation;
    intersect: GazeInteractionObjectIntersect;
    /**
     * A mapping of interaction types to their respective interaction objects.
     * Applicable only to GazeInteractionObject instances.
     */
    registrationMap: {
        'fixation': GazeInteractionObjectFixation,
        'saccade': GazeInteractionObjectSaccade,
        'dwell': GazeInteractionObjectDwell,
        'validation': GazeInteractionObjectValidation,
        'intersect': GazeInteractionObjectIntersect
    }

    private boundLinkData: (data: GazeDataPoint) => void;
    private boundLinkFixation: (data: GazeInteractionScreenFixationEvent) => void;
    private boundLinkSaccade: (data: GazeInteractionScreenSaccadeEvent) => void;

    constructor() {
        const dwell = new GazeInteractionObjectDwell();
        const fixation = new GazeInteractionScreenFixation();
        const fixationObject = new GazeInteractionObjectFixation();
        const saccade = new GazeInteractionScreenSaccade();
        const saccadeObject = new GazeInteractionObjectSaccade();
        const validation = new GazeInteractionObjectValidation();
        const intersect = new GazeInteractionObjectIntersect();
        const input = new GazeInputFacade();

        /**
         * Mapping of event names to their respective emitters.
         * This is used to route events to the correct emitter.
         */
        const eventMapping = {
            dwell: dwell,
            dwellProgress: dwell,
            dwellFinish: dwell,
            dwellCancel: dwell,
            fixation: fixation,
            fixationStart: fixation,
            fixationEnd: fixation,
            fixationProgress: fixation,
            fixationObjectEnd: fixationObject,
            fixationObjectStart: fixationObject,
            fixationObjectProgress: fixationObject,
            saccadeObjectTo: saccadeObject,
            saccadeObjectFrom: saccadeObject,
            validation: validation,
            intersect: intersect,
            data: input,
            state: input,
            connect: input,
            emit: input,
            error: input,
            windowCalibrated: input,
            windowCalibrationContested: input,
            calibrated: input,
        };

        /**
         * Initialize the manager with the input and interaction objects.
         */
        super({...eventMapping});

        /**
         * Store the input and interaction objects for later use.
         */
        this.fixation = fixation;
        this.fixationObject = fixationObject;
        this.saccade = saccade;
        this.saccadeObject = saccadeObject;
        this.dwell = dwell;
        this.validation = validation;
        this.intersect = intersect;
        this._input = input;

        /**
         * Mapping of interaction types to their respective interaction objects
         * to register and unregister HTML elements for gaze interaction.
         */
        this.registrationMap = {
            'fixation': fixationObject,
            'saccade': saccadeObject,
            dwell,
            validation,
            intersect
        }

        this.boundLinkData = this.linkData.bind(this);
        this.boundLinkFixation = this.linkFixation.bind(this);
        this.boundLinkSaccade = this.linkSaccade.bind(this);
        
        this.link();
    }

    private linkData(data: GazeDataPoint): void {
        this.fixation.evaluate(data);
        this.dwell.evaluate(data);
        this.intersect.evaluate(data);
        this.validation.evaluate(data);
    }

    private linkFixation(data: GazeInteractionScreenFixationEvent): void {
        this.fixationObject.evaluate(data);
        this.saccade.evaluate(data);
    }

    private linkSaccade(data: GazeInteractionScreenSaccadeEvent): void {
        this.saccadeObject.evaluate(data);
    }

    private link() {
        this._input.on('data', this.boundLinkData);
        this.fixation.on('fixationStart', this.boundLinkFixation);
        this.fixation.on('fixationEnd', this.boundLinkFixation);
        this.saccade.on('saccade', this.boundLinkSaccade);
    }

    async connect() {
       return this._input.connect();
    }

    async disconnect() {
        return this._input.disconnect();
    }

    async calibrate() {
        return this._input.calibrate();
    }

    async setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields) {
        return this._input.setWindowCalibration(mouseEvent, window);
    }

    createInput(input: GazeInputConfig) {this._input.createInput(input);}

    async start() {return this._input.start();}

    async stop() {return this._input.stop();}

    register({interaction, element, settings}: GazeManagerRegistration) {
        this.registrationMap[interaction].register(element, settings);
    }

    unregister({interaction, element}: Omit<GazeManagerRegistration, 'settings'>) {
        this.registrationMap[interaction].unregister(element);
    }

    /**
     * Get the current input.
     * @returns The current input or null if no input is set.
     * @readonly
     */
    get input(): GazeInput<GazeInputConfig> | null {return this._input.input;}

    /**
     * Get the current input instance.
     * @returns The current input instance or null if no input is set.
     * @readonly
     * @throws Error if no input is set.
     */ 
    get inputInstance(): GazeInput<GazeInputConfig> {return this._input.inputInstance;}

    /**
	 * Get the current connected state.
	 * @returns True if connected, false otherwise.
	 * @readonly
	 * @emits connect - When the connected state changes.
	 * @emits state - When the connected state changes.
	 */
    get isConnected(): boolean { return this._input.isConnected; }

    	/**
	 * Get the current device calibration state.
	 * @returns True if calibrated, false otherwise.
	 * @readonly
	 * @emits calibrated - When the device calibration state changes.
	 * @emits state - When the device calibration state changes.
	 */ 
    get isDeviceCalibrated(): boolean { return this._input.isDeviceCalibrated; }

    /**
	 * Get the current window calibration state.
	 * @returns True if calibrated, false otherwise.
	 * @readonly
	 * @emits windowCalibrated - When the window calibration state changes.
	 * @emits state - When the window calibration state changes.
	 */
    get isWindowCalibrated(): boolean { return this._input.isWindowCalibrated; }

    /**
     * Get the window calibration values.
     * @returns The window calibration values or null if no window calibration is set.
     * @readonly
     */
    get windowCalibration(): GazeWindowCalibratorConfig | null { return this._input.windowCalibration; }

    /**
	 * Get the current emitting state.
	 * @returns True if emitting, false otherwise.
	 * @readonly
	 * @emits emit - When the emitting state changes.
	 * @emits state - When the emitting state changes.
	 */
    get isEmitting(): boolean { return this._input.isEmitting; }

    set input(input: GazeInput<GazeInputConfig> | null) {this._input.input = input;}
}

export type GazeManagerRegistration = {
    interaction: 'fixation',
    element: Element,
    settings: Partial<GazeInteractionObjectFixation['defaultSettings']>
} | {
    interaction: 'saccade',
    element: Element,
    settings: Partial<GazeInteractionObjectSaccade['defaultSettings']>
} | {
    interaction: 'dwell',
    element: Element,
    settings: Partial<GazeInteractionObjectDwell['defaultSettings']>
} | {
    interaction: 'validation',
    element: Element,
    settings: Partial<GazeInteractionObjectValidation['defaultSettings']>
} | {
    interaction: 'intersect',
    element: Element,
    settings: Partial<GazeInteractionObjectIntersect['defaultSettings']>
}
