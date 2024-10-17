export type EventMap = Record<string, object>;
export type EventKey<T extends EventMap> = Extract<keyof T, string>;
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

    clear(): void {
        this.handlers = {};
    }
}

export abstract class EmitterWithFacade<T extends EventMap> extends Emitter<T> {
    internalEmitter: Emitter<T> | null = null;

    /**
     * Set or replace the internal emitter instance.
     * Reattaches all preserved handlers to the new emitter.
     * @param newEmitter - The new emitter instance.
     */
    setEmitter(newEmitter: Emitter<T> | null): void {
        if (this.internalEmitter) {
            this.internalEmitter.clear();  // Clear the old emitter
        }
        this.internalEmitter = newEmitter;

        // Reattach all handlers to the new internal emitter
        if (this.internalEmitter) {
            for (const eventName in this.handlers) {
                this.handlers[eventName]?.forEach(handler => {
                    this.internalEmitter?.on(eventName as EventKey<T>, handler.fn, handler.priority);
                });
            }
        }
    }

    /**
     * Registers an event handler in both the facade and internal emitter if set.
     * @param eventName - The name of the event.
     * @param fn - The event handler function.
     * @param priority - Priority level of the handler.
     */
    override on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>, priority: number = 0): void {
        super.on(eventName, fn, priority);  // Register in facade
        if (this.internalEmitter) {
            this.internalEmitter.on(eventName, fn, priority);  // Register in internal emitter
        }
    }

    /**
     * Unregisters an event handler in both the facade and internal emitter.
     * @param eventName - The name of the event.
     * @param fn - The event handler function to remove.
     */
    override off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        super.off(eventName, fn);  // Remove from facade
        if (this.internalEmitter) {
            this.internalEmitter.off(eventName, fn);  // Remove from internal emitter
        }
    }

    /**
     * Emits the event. If the internal emitter is set, the event is emitted through it.
     * Otherwise, the facade emits the event.
     * @param eventName - The name of the event.
     * @param params - Parameters to pass to the event handlers.
     */
    override emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
        if (this.internalEmitter) {
            this.internalEmitter.emit(eventName, params);  // Emit through internal emitter
        } else {
            super.emit(eventName, params);  // Emit through facade
        }
    }

    /**
     * Checks if there are any listeners registered in either the facade or the internal emitter.
     * @returns True if any listeners are registered, false otherwise.
     */
    override hasListeners(): boolean {
        return super.hasListeners() || (this.internalEmitter?.hasListeners() ?? false);
    }

    /**
     * Clears all event handlers from the facade and the internal emitter.
     */
    override clear(): void {
        super.clear();  // Clear facade handlers
        if (this.internalEmitter) {
            this.internalEmitter.clear();  // Clear internal emitter handlers
        }
    }
}