/**
 * Svelte store containing the gaze input instance.
 */
import { writable } from 'svelte/store';
import { createGazeInput } from '$lib';
import { GazeInput } from '$lib/GazeInput/GazeInput';
import type { GazeInputConfig } from '$lib/GazeInput/GazeInputConfig';

/**
 * The gaze input store.
 */
export const gazeInputStore = writable<GazeInput<GazeInputConfig> | null>(null);


interface Input {
    inputConfig: GazeInputConfig;
    mouseEvent: MouseEvent;
    window: Window;
}

/**
 * Set the gaze input instance.
 * @param input - The gaze input instance.
 */
export const setGazeInput = (input: Input | null) => {
    gazeInputStore.update((gazeInput) => {
        if (gazeInput) {
            gazeInput.disconnect();
        }
        if (input !== null) {
            const GazeInput = createGazeInput(input.inputConfig);
            GazeInput.setWindowCalibration(input.mouseEvent, input.window);
            return GazeInput;
        }
        return null;
    });
};