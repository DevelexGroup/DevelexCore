import type { GazeInteractionObjectFixationEvent } from "$lib/GazeInteraction/GazeInteractionObjectFixation.event";

export type Fixation = Omit<GazeInteractionObjectFixationEvent, 'target' | 'settings'> & {
    aoi: string; // stringified Array of AOI labels, split by ';' (e.g. 'AOI1;AOI2')
    id?: number;
}