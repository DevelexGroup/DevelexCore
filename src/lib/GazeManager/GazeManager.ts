import { EmitterGroup } from "$lib/Emitter/Emitter";
import type { FixationDataPoint, GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInput } from "$lib/GazeInput/GazeInput";
import type { ReceiveResponsePayload } from "$lib/GazeInput/GazeInputBridge.types";
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
 * await gazeManager.subscribe();
 * await gazeManager.connect();
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
    GazeInteractionScreenSaccadeEvents &
    GazeInteractionObjectSaccadeEvents &
    GazeInteractionObjectFixationEvents &
    GazeInteractionObjectDwellEvents &
    GazeInteractionObjectValidationEvents &
    GazeInteractionObjectIntersectEvents &
    GazeInputEvents
> {
    _input: GazeInputFacade;
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
    private boundLinkFixation: (data: FixationDataPoint) => void;
    private boundLinkSaccade: (data: GazeInteractionScreenSaccadeEvent) => void;

    constructor() {
        const dwell = new GazeInteractionObjectDwell();
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
            fixationObjectEnd: fixationObject,
            fixationObjectStart: fixationObject,
            fixationObjectProgress: fixationObject,
            saccadeObjectTo: saccadeObject,
            saccadeObjectFrom: saccadeObject,
            validation: validation,
            intersect: intersect,
            inputData: input,
            inputState: input,
            inputMessage: input,
            inputError: input,
            windowCalibrated: input,
            windowCalibrationContested: input,
            calibrated: input,
            inputFixationStart: input,
            inputFixationEnd: input,
        };

        /**
         * Initialize the manager with the input and interaction objects.
         */
        super({...eventMapping});

        /**
         * Store the input and interaction objects for later use.
         */
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
        this.dwell.evaluate(data);
        this.intersect.evaluate(data);
        this.validation.evaluate(data);
    }

    private linkFixation(data: FixationDataPoint): void {
        this.fixationObject.evaluate(data);
        this.saccade.evaluate(data);
    }

    private linkSaccade(data: GazeInteractionScreenSaccadeEvent): void {
        this.saccadeObject.evaluate(data);
    }

    private link() {
        this._input.on('inputData', this.boundLinkData);
        this._input.on('inputFixationStart', this.boundLinkFixation);
        this._input.on('inputFixationEnd', this.boundLinkFixation);
        this._input.on('inputFixationStart', (data: FixationDataPoint) => {
            console.log('inputFixationStart', data);
        });
        this._input.on('inputFixationEnd', (data: FixationDataPoint) => {
            console.log('inputFixationEnd', data);
        });
        this.saccade.on('saccade', this.boundLinkSaccade);
    }

    async subscribe() {
        return this._input.subscribe();
    }

    async unsubscribe() {
        return this._input.unsubscribe();
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

    async open() {
        return this._input.open();
    }

    async close() {
        return this._input.close();
    }

    async status() {
        return this._input.status();
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
     * Get the window calibration values.
     * @returns The window calibration values or null if no window calibration is set.
     * @readonly
     */
    get windowCalibration(): GazeWindowCalibratorConfig | null { return this._input.windowCalibration; }

    /**
     * Get the last status.
     * @returns The last status or null if no status is set.
     * @readonly
     */
    get lastStatus(): ReceiveResponsePayload | null { return this._input.lastStatus; }

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
