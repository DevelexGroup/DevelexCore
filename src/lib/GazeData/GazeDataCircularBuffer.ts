import type {GazeDataPoint} from "./GazeData.js";

export class GazeDataCircularBuffer {
    buffer: GazeDataPoint[];
    readonly size: number;
    pointer: number;
    isFull: boolean;
    constructor(size: number) {
        this.buffer = new Array(size);
        this.size = size;
        this.pointer = 0;
        this.isFull = false;
    }

    push(item: GazeDataPoint) {
        this.buffer[this.pointer] = item;
        this.pointer = (this.pointer + 1) % this.size;
        if (!this.isFull && this.pointer === 0) {
            this.isFull = true;
        }
    }

    toArray(): GazeDataPoint[] {
        const result = new Array(this.isFull ? this.size : this.pointer);

        if (this.isFull) {
            for (let i = this.pointer, j = 0; i < this.size; i++, j++) {
                result[j] = this.buffer[i];
            }
            for (let i = 0, j = this.size - this.pointer; i < this.pointer; i++, j++) {
                result[j] = this.buffer[i];
            }
        } else {
            for (let i = 0; i < this.pointer; i++) {
                result[i] = this.buffer[i];
            }
        }

        return result;
    }

    /**
     * Returns the buffer from 0 to pointer.
     * Used for saving the buffer to the database.
     */
    fromZeroToPointer(): GazeDataPoint[] {
        const len = this.pointer === 0 ? this.size : this.pointer;
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = this.buffer[i];
        }
        return result;
    }
}