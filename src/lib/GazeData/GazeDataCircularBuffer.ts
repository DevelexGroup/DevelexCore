import type {GazeDataPoint} from "./GazeData.js";

export class GazeDataCircularBuffer {
    buffer: GazeDataPoint[];
    readonly size: number;
    pointer: number;
    iteration: number = 0;
    onIterationCallback: (buffer: GazeDataPoint[]) => void;

    constructor(size: number, onIterationCallback: (buffer: GazeDataPoint[]) => void = () => {}) {
        this.buffer = new Array(size);
        this.size = size;
        this.pointer = 0;
        this.iteration = 0;
        this.onIterationCallback = onIterationCallback;
    }

    get isFull() {
        return this.iteration > 0;
    }

    push(item: GazeDataPoint) {
        this.buffer[this.pointer] = item;
        this.pointer = (this.pointer + 1) % this.size;
        if (this.pointer === 0) {
            this.onIterationCallback(this.buffer);
            this.iteration++;
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

    toReverseArray(): GazeDataPoint[] {
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
                result[this.pointer - 1 - i] = this.buffer[i];
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