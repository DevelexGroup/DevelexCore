/**
 * Svelte store containing the gaze input instance.
 */
import { writable } from 'svelte/store';
import { createETInput } from '$lib';
import { ETInput } from '$lib/ETInput/ETInput';
import type { ETInputConfig } from '$lib/ETInput/ETInputConfig';

/**
 * The gaze input store.
 */
export const gazeInputStore = writable<ETInput<ETInputConfig> | null>(null);


interface Input {
    inputConfig: ETInputConfig;
    mouseEvent: MouseEvent;
    window: Window;
}

/**
 * Set the gaze input instance.
 * @param input - The gaze input instance.
 */
export const setGazeInput = (input: Input | null) => {
    if (input !== null) {
        const etInput = createETInput(input.inputConfig);
        etInput.setWindowCalibration(input.mouseEvent, input.window);
        gazeInputStore.set(etInput);
        // call a method on the instance of 

    } else {
        gazeInputStore.set(null);
    }
};