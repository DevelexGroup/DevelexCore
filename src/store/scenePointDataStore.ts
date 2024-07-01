import { writable } from 'svelte/store';
import type { GazeDataPoint } from '$lib/GazeData/GazeData';

export const scenePointDataStore = writable<GazeDataPoint[]>([]);