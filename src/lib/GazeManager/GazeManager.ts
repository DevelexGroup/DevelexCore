import type { Emitter, EventKey, EventMap, EventReceiver } from "$lib/Emitter/Emitter";
import type { GazeDataPoint } from "$lib/GazeData/GazeData";
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
    fixationEmitter: GazeInteractionScreenFixation;
    fixationObjectEmitter: GazeInteractionObjectFixation;
    saccadeEmitter: GazeInteractionScreenSaccade;
    saccadeObjectEmitter: GazeInteractionObjectSaccade;
    dwellEmitter: GazeInteractionObjectDwell;
    validationEmitter: GazeInteractionObjectValidation;

    linkData: (data: GazeDataPoint) => void = (data) => {
        this.fixationEmitter.evaluate(data);
        this.dwellEmitter.evaluate(data);
        this.validationEmitter.evaluate(data);
    }

    linkFixation: (data: GazeInteractionScreenFixationEvent) => void = (data) => {
        this.saccadeEmitter.evaluate(data);
        this.fixationObjectEmitter.evaluate(data);
    }

    linkSaccade: (data: GazeInteractionScreenSaccadeEvent) => void = (data) => {
        this.saccadeObjectEmitter.evaluate(data);
    }


    constructor(input: GazeInput<GazeInputConfig>) {
        const dwellEmitter = new GazeInteractionObjectDwell();
        const fixationEmitter = new GazeInteractionScreenFixation();
        const fixationObjectEmitter = new GazeInteractionObjectFixation();
        const saccadeEmitter = new GazeInteractionScreenSaccade();
        const saccadeObjectEmitter = new GazeInteractionObjectSaccade();
        const validationEmitter = new GazeInteractionObjectValidation();
        super({
            fixationObjectStart: fixationEmitter,
            dwellProgress: dwellEmitter,
        });
        this.input = input;
        this.fixationEmitter = fixationEmitter;
        this.fixationObjectEmitter = fixationObjectEmitter;
        this.saccadeEmitter = saccadeEmitter;
        this.saccadeObjectEmitter = saccadeObjectEmitter;
        this.dwellEmitter = dwellEmitter;
        this.validationEmitter = validationEmitter;
    }

    connect() {
       this.input.on('data', this.linkData.bind(this));
       this.fixationEmitter.on('fixationEnd', this.linkFixation.bind(this));
       this.saccadeEmitter.on('saccade', this.linkSaccade.bind(this));
       this.input.connect();
    }

    disconnect() {
        this.input.off('data', this.linkData);
        this.fixationEmitter.off('fixationEnd', this.linkFixation);
        this.saccadeEmitter.off('saccade', this.linkSaccade);
        this.input.disconnect();
    }
}