import { Emitter, type EventMap } from '../Emitter/Emitter.js';

/**
 * Event map for TimedCircularBuffer events.
 */
export interface TimedCircularBufferEventMap<T> extends EventMap {
    /**
     * Snapshot of the most recent `snapshotCount` items, emitted every `snapshotInterval` milliseconds.
     */
    snapshot: {
        items: ReadonlyArray<T>;
        /** Total number of snapshot iterations emitted so far */
        iteration: number;
    };

    /**
     * All new items received since the previous `update` emission, emitted every `updateInterval` milliseconds
     * or earlier if the volume of new items would otherwise overflow the internal buffer.
     */
    update: {
        items: ReadonlyArray<T>;
        /** true if emitted early to avoid overflow */
        overflow: boolean;
    };
}

/**
 * A memory-efficient circular buffer that schedules two independent timers:
 *  • snapshotTimer – emits the last `snapshotCount` items at `snapshotInterval` (fast).
 *  • updateTimer   – emits all items that arrived since the previous update at `updateInterval` (slow).
 *
 *  If the number of new items exceeds the buffer capacity before the next {@link update} event is due,
 *  an early update is triggered to guarantee that no data is lost. Timers are implemented with chained
 *  `setTimeout` calls – **no `setInterval` is used** – which minimises idle memory retained by the runtime.
 *
 *  @template T  Type of the stored items.
 */
export class TimedCircularBuffer<T> extends Emitter<TimedCircularBufferEventMap<T>> {
    private readonly buffer: T[];
    private readonly size: number;

    private pointer = 0;               // Next write index
    private filled = false;            // Has the buffer wrapped at least once?

    // Tracking for `update` events
    private updateStart = 0;           // Index of the first un-emitted item
    private newItemCount = 0;          // Number of new items since last update

    private snapshotIteration = 0;     // How many snapshots have fired so far

    private snapshotTimeout: ReturnType<typeof setTimeout> | null = null;
    private updateTimeout:   ReturnType<typeof setTimeout> | null = null;

    constructor(
        /** Maximum number of elements kept in memory */            size: number,
        /** How many recent elements to include in a snapshot */    private readonly snapshotCount: number,
        /** Interval (ms) between snapshot events */                private readonly snapshotInterval: number,
        /** Interval (ms) between update events */                  private readonly updateInterval: number,
    ) {
        super();
        if (size <= 0) throw new Error('Buffer size must be greater than 0');
        if (snapshotCount <= 0) throw new Error('snapshotCount must be greater than 0');
        if (snapshotInterval <= 0) throw new Error('snapshotInterval must be greater than 0');
        if (updateInterval <= 0) throw new Error('updateInterval must be greater than 0');

        this.buffer = new Array<T>(size);
        this.size   = size;

        // Kick-off timers lazily – they start only after the first push(),
        // which avoids needless wake-ups when the buffer is unused.
    }

    /** true once the buffer has wrapped at least once (i.e. is completely full). */
    get isFull(): boolean {
        return this.filled;
    }

    /** Push a new item into the buffer. May trigger an early {@link update} event. */
    push(item: T): void {
        // Lazy-start timers only when data begins to flow.
        if (!this.snapshotTimeout && !this.updateTimeout) {
            this.scheduleSnapshot();
            this.scheduleUpdate();
        }

        // Write item
        this.buffer[this.pointer] = item;

        // Overflow protection – if we are about to overwrite updateStart, flush first.
        if (this.newItemCount === this.size) {
            // This means every slot in the buffer holds a yet-to-be-emitted item.
            this.fireUpdate(true /* overflow */);
        }

        this.pointer = (this.pointer + 1) % this.size;
        if (this.pointer === 0 && !this.filled) this.filled = true;

        this.newItemCount++;
    }

    /** Disposes of the buffer, clearing timers and listeners. */
    dispose(): void {
        if (this.snapshotTimeout) {
            clearTimeout(this.snapshotTimeout);
            this.snapshotTimeout = null;
        }
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }
        this.clear();
    }

    /* —————————————————————————————————————————— Private helpers —————————————————————————————————————————— */

    /** Schedule next snapshot using chained `setTimeout`. */
    private scheduleSnapshot(): void {
        this.snapshotTimeout = setTimeout(() => {
            this.fireSnapshot();
            this.scheduleSnapshot();
        }, this.snapshotInterval);
    }

    /** Schedule next update using chained `setTimeout`. */
    private scheduleUpdate(): void {
        this.updateTimeout = setTimeout(() => {
            this.fireUpdate(false /* overflow */);
            this.scheduleUpdate();
        }, this.updateInterval);
    }

    /** Emit the `snapshot` event. */
    private fireSnapshot(): void {
        const totalLen = this.filled ? this.size : this.pointer;
        if (totalLen === 0) return; // Nothing to emit yet

        const count = Math.min(this.snapshotCount, totalLen);
        const start = (this.pointer - count + this.size) % this.size;

        const out = new Array<T>(count);
        for (let i = 0; i < count; i++) {
            out[i] = this.buffer[(start + i) % this.size];
        }

        this.snapshotIteration++;
        this.emit<'snapshot'>('snapshot', { items: out, iteration: this.snapshotIteration });
    }

    /** Emit the `update` event and reset accounting counters. */
    private fireUpdate(overflow: boolean): void {
        if (this.newItemCount === 0) return; // No new items – nothing to emit

        const out = new Array<T>(this.newItemCount);
        for (let i = 0; i < this.newItemCount; i++) {
            out[i] = this.buffer[(this.updateStart + i) % this.size];
        }

        this.emit<'update'>('update', { items: out, overflow });

        // Reset counters
        this.updateStart = this.pointer;
        this.newItemCount = 0;

        // If an overflow triggered the update early, restart the timer so the next
        // interval counts from now rather than from the previous scheduled point.
        if (overflow && this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.scheduleUpdate();
        }
    }
}
