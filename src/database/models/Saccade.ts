import type { GazeInteractionObjectSetSaccadeEvent } from "$lib/GazeInteraction/GazeInteractionObject/GazeInteractionObjectSet/GazeInteractionObjectSetSaccadeEvent";

export type Saccade = Omit<GazeInteractionObjectSetSaccadeEvent, 'target' | 'settings'> & {
    aoi: string; // stringified Array of AOI labels, split by ';' (e.g. 'AOI1;AOI2')
    id?: number;
}