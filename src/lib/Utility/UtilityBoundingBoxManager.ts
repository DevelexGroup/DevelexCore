export class UtilityBoundingBoxManager {
    private static instance: UtilityBoundingBoxManager;

    private buffer: Float32Array; // Shared buffer for all bounding boxes
    private elementMap = new Map<Element, number>(); // Maps elements to buffer index
    private referenceCount = new Map<Element, number>(); // Tracks how many classes registered each element
    private elementOrder: Element[] = []; // Maintains insertion order for reallocation
    private isObserving = false;

    private constructor() {
        this.buffer = new Float32Array(0); // Start with an empty buffer
    }

    public static getInstance(): UtilityBoundingBoxManager {
        if (!this.instance) {
            this.instance = new UtilityBoundingBoxManager();
        }
        return this.instance;
    }

    public register(element: Element): void {
        const currentCount = this.referenceCount.get(element) || 0;
        this.referenceCount.set(element, currentCount + 1);

        if (currentCount > 0) return; // Already registered, no need to reallocate

        // Add element to order array
        this.elementOrder.push(element);

        // Reallocate buffer
        this.reallocateBuffer();

        // Update bounding box data
        this.updateBoundingBox(element);

        // Start observing if not already running
        if (!this.isObserving) {
            this.startObserving();
        }
    }

    public unregister(element: Element): void {
        const currentCount = this.referenceCount.get(element) || 0;

        if (currentCount <= 1) {
            // Remove the element entirely
            this.referenceCount.delete(element);
            const index = this.elementMap.get(element);

            if (index !== undefined) {
                this.elementMap.delete(element);
                this.elementOrder = this.elementOrder.filter(e => e !== element);
                this.reallocateBuffer(); // Reallocate to remove the element
            }
        } else {
            // Decrement the reference count
            this.referenceCount.set(element, currentCount - 1);
        }

        // Stop observing if no elements are left
        if (this.referenceCount.size === 0) {
            this.stopObserving();
        }
    }

    public getBoundingBox(element: Element): {
        x: number;
        y: number;
        width: number,
        height: number,
        top: number,
        left: number,
        right: number,
        bottom: number,
    } | undefined {
        const index = this.elementMap.get(element);
        if (index === undefined) return undefined;

        return {
            x: this.buffer[index],       // x
            y: this.buffer[index + 1],   // y
            width: this.buffer[index + 2],   // width
            height: this.buffer[index + 3],   // height
            top: this.buffer[index + 4],   // top
            left: this.buffer[index + 5],   // left
            right: this.buffer[index + 6],   // right
            bottom: this.buffer[index + 7]    // bottom
        }
    }

    private updateBoundingBox(element: Element): void {
        const index = this.elementMap.get(element);
        if (index === undefined) return;

        const rect = element.getBoundingClientRect();
        this.buffer[index] = rect.x;
        this.buffer[index + 1] = rect.y;
        this.buffer[index + 2] = rect.width;
        this.buffer[index + 3] = rect.height;
        this.buffer[index + 4] = rect.top;
        this.buffer[index + 5] = rect.left;
        this.buffer[index + 6] = rect.right;
        this.buffer[index + 7] = rect.bottom;
    }

    private startObserving(): void {
        this.isObserving = true;

        const observe = () => {
            if (!this.isObserving) return;

            for (const element of this.elementMap.keys()) {
                this.updateBoundingBox(element);
            }

            requestAnimationFrame(observe);
        };

        requestAnimationFrame(observe);
    }

    private stopObserving(): void {
        this.isObserving = false;
    }

    public isPointInside(element: Element, x: number, y: number, bufferSize: number): boolean {
        const index = this.elementMap.get(element);
        if (index === undefined) return false; // Element not registered
    
        // Access the bounding box values directly from the buffer
        // For maximum performance, we avoid unnecessary variable assignments
        return (
            x >= this.buffer[index + 5] + bufferSize && // left
            x <= this.buffer[index + 6] + bufferSize && // right
            y >= this.buffer[index + 4] + bufferSize && // top
            y <= this.buffer[index + 7] + bufferSize   // bottom
        );
    }

    private reallocateBuffer(): void {
        // Allocate a new buffer with space for all current elements
        const newBuffer = new Float32Array(this.elementOrder.length * 8); // 8 slots per element

        // Copy existing data to the new buffer
        this.elementOrder.forEach((element, i) => {
            const index = i * 8;
            const oldIndex = this.elementMap.get(element);

            if (oldIndex !== undefined) {
                newBuffer.set(this.buffer.subarray(oldIndex, oldIndex + 8), index);
            }

            // Update the map with the new index
            this.elementMap.set(element, index);
        });

        // Replace the old buffer with the new one
        this.buffer = newBuffer;
    }
}
