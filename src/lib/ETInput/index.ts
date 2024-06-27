import { ETInputDummy } from './ETInputDummy';
import { ETInputError } from './ETInputError';
import type { ETInputConfig } from './ETInputConfig';
import type { ETInput } from './ETInput';
import { ETInputBridge } from './ETInputBridge';

/**
 * Create an instance of an eye tracking input.
 * @param type - The type of the adapter, one of ETInputType}.
 * @returns An instance of the adapter.
 * @category Core
 * @example const adapter = createETInput('gazepoint');
 * @example createETInput('dummy').config = { x: 0.5, y: 0.5 }.connect();
 */
export const createETInput = <T extends ETInputConfig>(
	config: T
): ETInput<T> => {
	switch (config.type) {
		case 'dummy':
			return new ETInputDummy(config) as unknown as ETInput<T>;
		case 'gazepoint':
			return new ETInputBridge(config) as unknown as ETInput<T>;
		default:
			// @ts-expect-error - In case of unsupported input type, throw an error and give a hint.
			throw new ETInputError(`Unsupported input type: ${config.type}`);
	}
};