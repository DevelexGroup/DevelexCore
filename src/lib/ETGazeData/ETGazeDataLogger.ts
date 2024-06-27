import {ETGazeDataCircularBuffer} from "./ETGazeDataCircularBuffer.js";
import {ETGazeDataDatabase} from "./ETGazeDataDatabase.js";
import type {ETGazeData} from "./ETGazeData.js";

export class ETGazeDataLogger {
    buffer: ETGazeDataCircularBuffer;
    db: ETGazeDataDatabase;
    get name(): string { return this.db.dbName; }
    get initialized(): boolean { return this.db.initialized; }

    constructor(dbName: string = 'ETGazeData_DB', bufferSize: number = 100) {
        this.buffer = new ETGazeDataCircularBuffer(bufferSize);
        this.db = new ETGazeDataDatabase(dbName);
        void this.db.init(); // TODO Error handling
    }

    /**
     * Adds a gaze data object to the buffer.
     * If the buffer is full, save whole circular buffer to database.
     * @param data
     */
    push(data: ETGazeData) {
        if (this.buffer.pointer === 0 && this.buffer.isFull) {
            void this.saveBufferToDatabase()
        }
        this.buffer.push(data);
    }

    /**
     * Saves the whole circular buffer to the database.
     * There is a risk for creating duplicate entries in the database if called from many places! TODO
     */
    async saveBufferToDatabase(): Promise<void> {
        const dataArray = this.buffer.fromZeroToPointer();
        if (dataArray.length === 0) return;
        await this.db.init();
        return new Promise((resolve, reject) => {
            this.db.add(dataArray).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    async getAll(): Promise<ETGazeData[]> {
        return new Promise((resolve, reject) => {
            this.saveBufferToDatabase().then(() => {
                this.db.getAll().then((data) => {
                    resolve(data);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

}