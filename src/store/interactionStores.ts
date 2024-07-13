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
import { addDwellEvent, addFixationEvent, addPointEvent, addSaccadeEvent } from "./sceneStores";

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
    
    if (isConnect) {
        gazeInput.on("data", addPointEvent);
    } else {
        gazeInput.off("data", addPointEvent);
    }
}

get(dwellObjectStore).on("dwell", (event) => addDwellEvent(event));
get(fixationObjectStore).on("fixationSetEnd", (event) => addFixationEvent(event));
get(fixationObjectStore).on("fixationSetStart", (event) => addFixationEvent(event));
get(saccadeObjectStore).on("saccadeSetTo", (event) => addSaccadeEvent(event));
get(saccadeObjectStore).on("saccadeSetFrom", (event) => addSaccadeEvent(event));