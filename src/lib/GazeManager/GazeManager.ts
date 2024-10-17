import { Emitter, EmitterWithFacade, type EventKey, type EventMap, type EventReceiver } from "$lib/Emitter/Emitter";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import type { GazeInputConfig } from "$lib/GazeInput/GazeInputConfig";
import type { ETHandlerMapping } from "$lib/GazeInput/GazeInputEvent";
import { GazeInputFacade } from "$lib/GazeInput/GazeInputFacade";
import { GazeInteractionObjectDwell } from "$lib/GazeInteraction/GazeInteractionObjectDwell";
import type { GazeInteractionObjectDwellEvents } from "$lib/GazeInteraction/GazeInteractionObjectDwell.event";
import { GazeInteractionObjectFixation } from "$lib/GazeInteraction/GazeInteractionObjectFixation";
import type { GazeInteractionObjectFixationEvents } from "$lib/GazeInteraction/GazeInteractionObjectFixation.event";
import { GazeInteractionObjectIntersect } from "$lib/GazeInteraction/GazeInteractionObjectIntersect";
import { GazeInteractionObjectSaccade } from "$lib/GazeInteraction/GazeInteractionObjectSaccade";
import type { GazeInteractionObjectSaccadeEvents } from "$lib/GazeInteraction/GazeInteractionObjectSaccade.event";
import { GazeInteractionObjectValidation } from "$lib/GazeInteraction/GazeInteractionObjectValidation";
import type { GazeInteractionObjectValidationEvents } from "$lib/GazeInteraction/GazeInteractionObjectValidation.event";
import { GazeInteractionScreenFixation } from "$lib/GazeInteraction/GazeInteractionScreenFixation";
import type { GazeInteractionScreenFixationEvent, GazeInteractionScreenFixationEvents } from "$lib/GazeInteraction/GazeInteractionScreenFixation.event";
import { GazeInteractionScreenSaccade } from "$lib/GazeInteraction/GazeInteractionScreenSaccade";

import type { GazeInteractionScreenSaccadeEvent, GazeInteractionScreenSaccadeEvents } from "$lib/GazeInteraction/GazeInteractionScreenSaccadeEvent";
import type { GazeWindowCalibratorConfigMouseEventFields, GazeWindowCalibratorConfigWindowFields } from "$lib/GazeWindowCalibrator/GazeWindowCalibratorConfig";

// Manager class that routes event registration to the correct Emitter
export class EmitterGroup<T extends EventMap> {
    // A mapping of event names to their respective emitters
    private emitterMap: Record<EventKey<T>, Emitter<T> | EmitterWithFacade<T>>;

    // Initialize the manager with emitters and their associated events
    constructor(emitterMap: Record<string, Emitter<T> | EmitterWithFacade<T>>) {
        this.emitterMap = emitterMap;
    }

    /**
     * links an event handler for the specified event, automatically routing
     * to the correct emitter.
     * @param eventName - The name of the event (e.g., 'fixationEnd', 'dwell').
     * @param fn - The event handler function.
     * @param priority - The priority of the handler (default: 0).
     */
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>, priority: number = 0): void {
        const emitter = this.getEmitter(eventName);
        if (emitter) {
            emitter.on(eventName, fn, priority);
        } else {
            throw new Error(`No emitter found for event '${eventName}'`);
        }
    }

    /**
     * Unlinks an event handler for the specified event.
     * @param eventName - The name of the event.
     * @param fn - The event handler function to remove.
     */
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        const emitter = this.getEmitter(eventName);
        if (emitter) {
            emitter.off(eventName, fn);
        } else {
            throw new Error(`No emitter found for event '${eventName}'`);
        }
    }

    /**
     * Finds the correct emitter for the given event name.
     * @param eventName - The name of the event.
     * @returns The emitter responsible for the event, or undefined if none exists.
     */
    private getEmitter<K extends EventKey<T>>(eventName: K): Emitter<T> | undefined {
        return this.emitterMap[eventName];
    }
}

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
    ETHandlerMapping
> {
    input: GazeInputFacade;
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

    linkData: (data: GazeDataPoint) => void = (data) => {
        this.fixation.evaluate(data);
        this.dwell.evaluate(data);
        this.validation.evaluate(data);
        this.intersect.evaluate(data);
    }

    linkFixation: (data: GazeInteractionScreenFixationEvent) => void = (data) => {
        this.saccade.evaluate(data);
        this.fixationObject.evaluate(data);
    }

    linkSaccade: (data: GazeInteractionScreenSaccadeEvent) => void = (data) => {
        this.saccadeObject.evaluate(data);
    }


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
            fixationObjectEnd: fixationObject,
            fixationObjectStart: fixationObject,
            saccadeObjectTo: saccadeObject,
            saccadeObjectFrom: saccadeObject,
            validation: validation,
            intersect: intersect,
            data: input as EmitterWithFacade<ETHandlerMapping>,
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
        this.input = input;

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
    }

    connect() {
       this.input.on('data', this.linkData.bind(this));
       this.fixation.on('fixationStart', this.linkFixation.bind(this));
       this.fixation.on('fixationEnd', this.linkFixation.bind(this));
       this.saccade.on('saccade', this.linkSaccade.bind(this));
       this.input.connect();
    }

    disconnect() {
        this.input.off('data', this.linkData);
        this.fixation.off('fixationEnd', this.linkFixation);
        this.saccade.off('saccade', this.linkSaccade);
        this.input.disconnect();
    }

    calibrate() {
        this.input.calibrate();
    }

    setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields) {
        this.input.setWindowCalibration(mouseEvent, window);
    }

    createInput(input: GazeInputConfig) {this.input.createInput(input);}

    register({interaction, element, settings}: GazeManagerRegistration) {
        this.registrationMap[interaction].register(element, settings);
    }

    unregister({interaction, element}: Omit<GazeManagerRegistration, 'settings'>) {
        this.registrationMap[interaction].unregister(element);
    }
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
