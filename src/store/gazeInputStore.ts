/**
 * Svelte store containing the gaze input instance.
 */
import { writable } from 'svelte/store';
import type { GazeInputConfig } from '$lib/GazeInput/GazeInputConfig';
import { GazeManager } from '$lib/GazeManager/GazeManager';
import { addDwellEvent, addFixationEvent, addIntersectEvent, addPointEvent, addSaccadeEvent, addValidationEvent } from "./sceneStores";

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
            gazeManager.disconnect();
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

gazeManagerStore.subscribe((gazeManager) => {
    if (gazeManager === null) {
        return;
    }
    gazeManager.on("data", addPointEvent);
    gazeManager.on("dwell", addDwellEvent);
    gazeManager.on("fixationObjectStart", addFixationEvent);
    gazeManager.on("fixationObjectEnd", addFixationEvent);
    gazeManager.on("saccadeObjectTo", addSaccadeEvent);
    gazeManager.on("saccadeObjectFrom", addSaccadeEvent);
    gazeManager.on("validation", addValidationEvent);
    gazeManager.on("intersect", addIntersectEvent);
});