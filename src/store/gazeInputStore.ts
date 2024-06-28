/**
 * Svelte store containing the gaze input instance.
 */
import { writable } from 'svelte/store';
import { createETInput } from '$lib';
import { ETInput } from '$lib/ETInput/ETInput';
import type { ETInputConfig } from '$lib/ETInput/ETInputConfig';

/**
 * The gaze input store.
 */
export const gazeInputStore = writable<ETInput<ETInputConfig> | null>(null);

/**
 * Set the gaze input instance.
 * @param input - The gaze input instance.
 */
export const setGazeInput = (input: ETInputConfig | null) => {
    if (input !== null) return gazeInputStore.set(createETInput(input));
    gazeInputStore.set(input);
};