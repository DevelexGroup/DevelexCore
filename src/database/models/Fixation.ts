import type { GazeInteractionObjectSetFixationEvent } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetFixationEvent";

export type Fixation = Omit<GazeInteractionObjectSetFixationEvent, 'target' | 'settings'> & {
    aoi: string; // stringified Array of AOI labels, split by ';' (e.g. 'AOI1;AOI2')
    id?: number;
}