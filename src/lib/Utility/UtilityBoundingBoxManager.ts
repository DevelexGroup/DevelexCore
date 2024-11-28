export class UtilityBoundingBoxManager {
    private static instance: UtilityBoundingBoxManager;

    private buffer: Float32Array; // Shared buffer for all bounding boxes
    private referenceCount = new Map<Element, number>(); // Tracks how many classes registered each element
    private elementOrder: Element[] = []; // Maintains insertion order for reallocation
    private isObserving = false;
    private checkerForCurrentValues = new Float32Array(8); // Preallocate for current values

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

    private updateBoundingBox(element: Element): void {
        const index = this.elementOrder.indexOf(element);
        if (index === -1) return; // Element not found

        const bufferIndex = index * 8; // Calculate buffer index
        const rect = element.getBoundingClientRect();
        this.buffer[bufferIndex] = rect.x;
        this.buffer[bufferIndex + 1] = rect.y;
        this.buffer[bufferIndex + 2] = rect.width;
        this.buffer[bufferIndex + 3] = rect.height;
        this.buffer[bufferIndex + 4] = rect.top;
        this.buffer[bufferIndex + 5] = rect.left;
        this.buffer[bufferIndex + 6] = rect.right;
        this.buffer[bufferIndex + 7] = rect.bottom;
    }

    public unregister(element: Element): void {
        const currentCount = this.referenceCount.get(element) || 0;

        if (currentCount <= 1) {
            // Remove the element entirely
            this.referenceCount.delete(element);
            const index = this.elementOrder.indexOf(element);

            if (index !== -1) {
                this.elementOrder.splice(index, 1);
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

    /**
     * Instead of directly accessing the element boundingBoxRect
     * @param element 
     * @returns 
     */
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
        const bufferIndex = this.getBufferIndex(element);
        if (bufferIndex === -1) throw new Error("No element registered for bb watching");
        return {
            x: this.buffer[bufferIndex],
            y: this.buffer[bufferIndex + 1],
            width: this.buffer[bufferIndex + 2],
            height: this.buffer[bufferIndex + 3],
            top: this.buffer[bufferIndex + 4],
            left: this.buffer[bufferIndex + 5],
            right: this.buffer[bufferIndex + 6],
            bottom: this.buffer[bufferIndex + 7]
        };
    }

    private startObserving(): void {
        this.isObserving = true;
        const currentValues = this.checkerForCurrentValues;
        let animationFrameId: number;

        const observe = () => {
            if (!this.isObserving) return;
            const buffer = this.buffer;
            const elementOrder = this.elementOrder;
            let i = elementOrder.length; // Start from the end for quick access
            // Iterate over elementOrder to update bounding boxes
            const changedIndices = []; // Array to store indices of changed elements

            while (i--) {
                const bufferIndex = i * 8; // Calculate buffer index
                const rect = elementOrder[i].getBoundingClientRect();

                // Retrieve previous values from the buffer
                const prevValues = buffer.subarray(bufferIndex, bufferIndex + 8);

                // Populate `currentValues` in place
                currentValues[0] = rect.x;
                currentValues[1] = rect.y;
                currentValues[2] = rect.width;
                currentValues[3] = rect.height;
                currentValues[4] = rect.top;
                currentValues[5] = rect.left;
                currentValues[6] = rect.right;
                currentValues[7] = rect.bottom;

/*                 // Check if any value has changed
                let isChanged = false;
                for (let j = 0; j < 8; j++) {
                    if (currentValues[j] !== prevValues[j]) {
                        isChanged = true;
                        break; // Stop further comparison for this element
                    }
                } */

                const isChanged = 
                currentValues[0] !== prevValues[0] ||
                currentValues[1] !== prevValues[1] ||
                currentValues[2] !== prevValues[2] ||
                currentValues[3] !== prevValues[3] ||
                currentValues[4] !== prevValues[4] ||
                currentValues[5] !== prevValues[5] ||
                currentValues[6] !== prevValues[6] ||
                currentValues[7] !== prevValues[7];

                // If changed, record the index and update the buffer
                if (isChanged) {
                    changedIndices.push(i); // Record the index of the changed element
                    buffer.set(currentValues, bufferIndex); // Update the buffer
                }
            }

            // Use `changedIndices` to know which elements have changed
            if (changedIndices.length > 0) {
                console.log("Changed indices:", changedIndices);
            }

            animationFrameId = requestAnimationFrame(observe);
        };

        animationFrameId = requestAnimationFrame(observe);
        
        // Add cleanup to stopObserving
        this.stopObserving = () => {
            this.isObserving = false;
            cancelAnimationFrame(animationFrameId);
        };
    }

    getElementBoundingBox(element: HTMLElement): {
        x: number;
        y: number;
        width: number;
        height: number;
    } {
        let x = 0;
        let y = 0;
        let currentElement: HTMLElement | null = element;
    
        // Traverse up the DOM tree to calculate the position relative to the document
        while (currentElement) {
            x += currentElement.offsetLeft;
            y += currentElement.offsetTop;
            currentElement = currentElement.offsetParent as HTMLElement;
        }
    
        return {
            x,
            y,
            width: element.offsetWidth,
            height: element.offsetHeight
        };
    }
    

    private stopObserving(): void {
        this.isObserving = false;
    }

    private getBufferIndex(element: Element): number {
        const index = this.elementOrder.indexOf(element);
        return index !== -1 ? index * 8 : -1;
    }
    

    public isPointInside(element: Element, x: number, y: number, bufferSize: number): boolean {
        const bufferIndex = this.getBufferIndex(element);
        if (bufferIndex === -1) return false; // Element not registered
        return x >= this.buffer[bufferIndex + 5] - bufferSize &&
               x <= this.buffer[bufferIndex + 6] + bufferSize &&
               y >= this.buffer[bufferIndex + 4] - bufferSize &&
               y <= this.buffer[bufferIndex + 7] + bufferSize;
    }

    private reallocateBuffer(): void {
        const newBuffer = new Float32Array(this.elementOrder.length * 8);

        this.elementOrder.forEach((element, i) => {
            const bufferIndex = i * 8; // New buffer index
            const oldIndex = i * 8; // Old buffer index

            if (oldIndex < this.buffer.length) {
                newBuffer.set(this.buffer.subarray(oldIndex, oldIndex + 8), bufferIndex);
            }
        });

        this.buffer = newBuffer; // Replace the old buffer
    }
}
