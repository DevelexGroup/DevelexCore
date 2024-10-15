import type { Emitter, EventKey, EventMap, EventReceiver } from "$lib/Emitter/Emitter";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";
import { createGazeInput } from "$lib/GazeInput";
import type { GazeInput } from "$lib/GazeInput/GazeInput";
import type { GazeInputConfig } from "$lib/GazeInput/GazeInputConfig";
import type { ETHandlerMapping } from "$lib/GazeInput/GazeInputEvent";
import { GazeInteractionObjectDwell } from "$lib/GazeInteraction/GazeInteractionObjectDwell";
import type { GazeInteractionObjectDwellEvents } from "$lib/GazeInteraction/GazeInteractionObjectDwell.event";
import { GazeInteractionObjectFixation } from "$lib/GazeInteraction/GazeInteractionObjectFixation";
import type { GazeInteractionObjectFixationEvents } from "$lib/GazeInteraction/GazeInteractionObjectFixation.event";
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
    private emitterMap: Record<string, Emitter<T>> = {};

    // Initialize the manager with emitters and their associated events
    constructor(emitterMap: Record<string, Emitter<T>>) {
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
    ETHandlerMapping &
    GazeInteractionScreenFixationEvents &
    GazeInteractionScreenSaccadeEvents &
    GazeInteractionObjectSaccadeEvents &
    GazeInteractionObjectFixationEvents &
    GazeInteractionObjectDwellEvents &
    GazeInteractionObjectValidationEvents
> {
    input: GazeInput<GazeInputConfig>;
    fixation: GazeInteractionScreenFixation;
    fixationObject: GazeInteractionObjectFixation;
    saccade: GazeInteractionScreenSaccade;
    saccadeObject: GazeInteractionObjectSaccade;
    dwell: GazeInteractionObjectDwell;
    validation: GazeInteractionObjectValidation;

    linkData: (data: GazeDataPoint) => void = (data) => {
        this.fixation.evaluate(data);
        this.dwell.evaluate(data);
        this.validation.evaluate(data);
    }

    linkFixation: (data: GazeInteractionScreenFixationEvent) => void = (data) => {
        this.saccade.evaluate(data);
        this.fixationObject.evaluate(data);
    }

    linkSaccade: (data: GazeInteractionScreenSaccadeEvent) => void = (data) => {
        this.saccadeObject.evaluate(data);
    }


    constructor(config: GazeInputConfig) {
        const dwell = new GazeInteractionObjectDwell();
        const fixation = new GazeInteractionScreenFixation();
        const fixationObject = new GazeInteractionObjectFixation();
        const saccade = new GazeInteractionScreenSaccade();
        const saccadeObject = new GazeInteractionObjectSaccade();
        const validation = new GazeInteractionObjectValidation();
        const input = createGazeInput(config);
        super({
            data: input,
            connect: input,
            state: input,
            emit: input,
            dwell: dwell,
            dwellProgress: dwell,
            fixationObjectEnd: fixationObject,
            fixationObjectStart: fixationObject,
            saccadeObjectTo: saccadeObject,
            saccadeObjectFrom: saccadeObject,
            validation: validation,
        });
        this.input = input;
        this.fixation = fixation;
        this.fixationObject = fixationObject;
        this.saccade = saccade;
        this.saccadeObject = saccadeObject;
        this.dwell = dwell;
        this.validation = validation;
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

    start() {
        this.input.start();
    }

    stop() {
        this.input.stop();
    }

    calibrate() {
        this.input.calibrate();
    }

    setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields) {
        this.input.setWindowCalibration(mouseEvent, window);
    }

    createInput(input: GazeInputConfig) {
        if (this.input?.isConnected) {
            throw new Error('Cannot create input while another input is connected');
        }
        this.input = createGazeInput(input);
    }

    register({interaction, element, settings}: GazeManagerRegistration) {
        switch (interaction) {
            case 'fixation':
                this.fixationObject.register(element, settings);
                break;
            case 'saccade':
                this.saccadeObject.register(element, settings);
                break;
            case 'dwell':
                this.dwell.register(element, settings);
                break;
            case 'validation':
                this.validation.register(element, settings);
                break;
        }
    }

    unregister({interaction, element}: Omit<GazeManagerRegistration, 'settings'>) {
        switch (interaction) {
            case 'fixation':
                this.fixationObject.unregister(element);
                break;
            case 'saccade':
                this.saccadeObject.unregister(element);
                break;
            case 'dwell':
                this.dwell.unregister(element);
                break;
            case 'validation':
                this.validation.unregister(element);
                break;
        }
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
}
