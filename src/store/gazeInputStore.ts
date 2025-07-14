/**
 * Svelte store containing the gaze input instance.
 */
import { writable, get } from 'svelte/store';
import type { GazeInputConfig } from '$lib/GazeInput/GazeInputConfig';
import { GazeManager } from '$lib/GazeManager/GazeManager';
import { addDwellEvent, addFixationEvent, addIntersectEvent, addPointEvent, addSaccadeEvent, addValidationEvent, sceneErrorStore } from "./sceneStores";

/**
 * The gaze input store.
 */
export const gazeManagerStore = writable<GazeManager>(new GazeManager());


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
    gazeManagerStore.update((gazeManager) => {
        if (gazeManager !== null) {
            gazeManager.close();
        }
        if (input !== null) {
            gazeManager.createInput(input.inputConfig);
            gazeManager.setWindowCalibration(input.mouseEvent, input.window);
        } else {
            gazeManager.input = null;
        }
        return gazeManager;
    });
};

get(gazeManagerStore).on("inputData", addPointEvent);
get(gazeManagerStore).on("dwell", addDwellEvent);
get(gazeManagerStore).on("fixationObjectStart", addFixationEvent);
get(gazeManagerStore).on("fixationObjectEnd", addFixationEvent);
get(gazeManagerStore).on("saccadeObjectTo", addSaccadeEvent);
get(gazeManagerStore).on("saccadeObjectFrom", addSaccadeEvent);
get(gazeManagerStore).on("validation", addValidationEvent);
get(gazeManagerStore).on("intersect", addIntersectEvent);
get(gazeManagerStore).on("inputError", (error) => {
    sceneErrorStore.update((buffer) => {
        buffer.push(error);
        return buffer;
    });
});