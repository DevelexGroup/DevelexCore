import type {ETGazeData} from "./GazeData.js";

export class ETGazeDataDatabase {
    readonly dbName: string;
    db: IDBDatabase | null = null;
    initialized: boolean = false;
    constructor(dbName: string) {
        this.dbName = dbName;
    }

    async init(): Promise<ETGazeDataDatabase> {

        return new Promise<ETGazeDataDatabase>((resolve, reject) => {
            if (this.initialized) resolve(this);
            const request = window.indexedDB.open(this.dbName, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.initialized = true;
                this.db = request.result;
                resolve(this);
            }
            request.onupgradeneeded = () => this.handleDatabaseUpgrade(request.result);
        });

    }

    private handleDatabaseUpgrade(database: IDBDatabase) {
        if (!database.objectStoreNames.contains("gazeData")) {
            const objectStore = database.createObjectStore("gazeData", { autoIncrement: true });
            objectStore.createIndex("fixID", "fixID");
        }
    }

    async add(dataArray: ETGazeData[] | ETGazeData): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.db) throw new Error("Database is not open.");
            if (!Array.isArray(dataArray)) dataArray = [dataArray];
            const transaction = this.db.transaction(["gazeData"], "readwrite");
            const objectStore = transaction.objectStore("gazeData");

            // Use a loop to add each item in the array
            dataArray.forEach((data) => {
                objectStore.add(data);
            });

            transaction.oncomplete = () => {
                console.info("ETGazeDataDatabase: add() success");
                resolve();
            }

            transaction.onerror = () => {
                console.warn("ETGazeDataDatabase: add() error:", transaction.error);
                reject(transaction.error);
            }
        });
    }


    async getAll(): Promise<ETGazeData[]> {

        return new Promise<ETGazeData[]>((resolve, reject) => {
            if (!this.db) throw new Error("Database is not open.");
            const transaction = this.db.transaction(["gazeData"], "readonly");
            const objectStore = transaction.objectStore("gazeData");
            const request = objectStore.getAll();

            request.onsuccess = () => {
                console.info("ETGazeDataDatabase: getAll() success");
                resolve(request.result);
            }

            request.onerror = () => {
                console.warn("ETGazeDataDatabase: getAll() error:", request.error);
                reject(request.error);
            }
        });

    }
}