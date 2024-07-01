import { writable } from 'svelte/store';
import { GazeDataCircularBuffer } from '$lib/GazeData/GazeDataCircularBuffer';
import type { GazeInputMessage } from '$lib/GazeInput/GazeInputEvent';

export const scenePointDataStore = writable<GazeDataCircularBuffer>(new GazeDataCircularBuffer(300));

export const sceneStateStore = writable<GazeInputMessage[]>([]);