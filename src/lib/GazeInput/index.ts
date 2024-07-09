import { GazeInputDummy } from './GazeInputDummy';
import { GazeInputError } from './GazeInputError';
import type { GazeInputConfig } from './GazeInputConfig';
import type { GazeInput } from './GazeInput';
import { GazeInputBridge } from './GazeInputBridge';

/**
 * Create an instance of an eye tracking input.
 * @param type - The type of the adapter, one of GazeInputType}.
 * @returns An instance of the adapter.
 * @category Core
 * @example const adapter = createGazeInput('gazepoint');
 * @example createGazeInput('dummy').config = { x: 0.5, y: 0.5 }.connect();
 */
export const createGazeInput = <T extends GazeInputConfig>(
	config: T
): GazeInput<T> => {
	switch (config.tracker) {
		case 'dummy':
			return new GazeInputDummy(config) as unknown as GazeInput<T>;
		case 'opengaze':
			return new GazeInputBridge(config) as unknown as GazeInput<T>;
		case 'smi':
			return new GazeInputBridge(config) as unknown as GazeInput<T>;
		case 'eyelogic':
			return new GazeInputBridge(config) as unknown as GazeInput<T>;
		default:
			// @ts-expect-error - In case of unsupported input type, throw an error and give a hint.
			throw new GazeInputError(`Unsupported input type: ${config.type}`);
	}
};