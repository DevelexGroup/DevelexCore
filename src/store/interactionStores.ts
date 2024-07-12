import { get, readable, type Readable } from "svelte/store";
import {
  GazeInteractionScreenFixation,
  GazeInteractionScreenSaccade,
  GazeInteractionObjectDwell,
  GazeInteractionObjectSetFixation,
  GazeInteractionObjectSetSaccade,
  type GazeInputConfig
} from "$lib";
import { gazeInputStore } from "./gazeInputStore";
import { isGazeInputWithFixations, type GazeInput } from "$lib/GazeInput/GazeInput";

// Type for the classes used to create stores
type GazeInteractionClass<T> = new () => T;

// Helper function to create readable stores
const createReadableStore = <T>(Class: GazeInteractionClass<T>): Readable<T> => readable(new Class());

// Initializing readable stores
export const fixationInteractionStore = createReadableStore(GazeInteractionScreenFixation);
export const saccadeInteractionStore = createReadableStore(GazeInteractionScreenSaccade);
export const fixationObjectStore = createReadableStore(GazeInteractionObjectSetFixation);
export const saccadeObjectStore = createReadableStore(GazeInteractionObjectSetSaccade);
export const dwellObjectStore = createReadableStore(GazeInteractionObjectDwell);

gazeInputStore.subscribe((gazeInput) => {
    if (gazeInput) {
        gazeInput.on("connect", (event) => manageConnect(gazeInput, event.value));
    }
});

const manageConnect = (gazeInput: GazeInput<GazeInputConfig>, isConnect: boolean) => {
    const phase = isConnect ? "connect" : "disconnect";

    if (isGazeInputWithFixations(gazeInput)) {
        get(fixationInteractionStore)[phase](gazeInput)
        get(saccadeInteractionStore)[phase](get(fixationInteractionStore))
        get(fixationObjectStore)[phase](get(fixationInteractionStore))
        get(saccadeObjectStore)[phase](get(saccadeInteractionStore))
    }
    
    get(dwellObjectStore)[phase](gazeInput);
}

