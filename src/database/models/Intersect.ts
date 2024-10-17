import type { GazeInteractionObjectIntersectEvent } from "$lib/GazeInteraction/GazeInteractionObjectIntersect.event";

export type Intersect = Omit<GazeInteractionObjectIntersectEvent, 'target' | 'settings'> & {
    aoi: string; // stringified Array of AOI labels, split by ';' (e.g. 'AOI1;AOI2')
    id?: number;
}