export type EventMap = Record<string, object>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (params: T) => void;

/**
 * Abstract class representing an event emitter with orderCategory support.
 * OrderCategory is a number that determines the order in which event handlers are executed.
 * It is crucial for the correct execution of advanced gaze interaction logic.
 * @template T - The event map type.
 */
export abstract class Emitter<T extends EventMap> {
    /**
     * Object storing event handlers for each event.
     */
    handlers: {
        [K in keyof T]?: Array<{
            fn: EventReceiver<T[K]>,
            priority: number
        }>;
    } = {};

    /**
     * Checks if the gaze interaction has any listeners.
     * It can be used for optimization purposes.
     * @returns True if the gaze interaction has listeners, false otherwise.
     */
    hasListeners(): boolean {
        return Object.keys(this.handlers).length > 0;
    }

    /**
     * Registers an event handler for the specified event.
     * @param eventName - The name of the event.
     * @param fn - The event handler function.
     * @param priority - The priority category (higher number means higher priority).
     */
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>, priority: number = 0): void {
        const handler = { fn, priority };
        this.handlers[eventName] = (this.handlers[eventName] || []);
        this.handlers[eventName].push(handler);
        // Sort handlers by priority
        this.handlers[eventName].sort((a, b) => b.priority - a.priority);
    }

    /**
     * Unregisters an event handler for the specified event.
     * @param eventName - The name of the event.
     * @param fn - The event handler function.
     */
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        if (this.handlers[eventName]) {
            this.handlers[eventName] = this.handlers[eventName].filter(handler => handler.fn !== fn);
        }
    }

    /**
     * Emits an event with the specified name and parameters.
     * Event handlers are executed in descending order of priority.
     * @param eventName - The name of the event to emit.
     * @param params - The parameters to pass to the event handlers.
     */
    emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
        if (this.handlers[eventName]) {
            this.handlers[eventName].forEach(handler => handler.fn(params));
        }
    }
}
