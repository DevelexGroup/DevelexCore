/**
 * Returns the current date and time in ISO 8601 format.
 * @returns {string} The current date and time in ISO 8601 format.
 * @example
 * const timestamp = createISO8601Timestamp();
 * console.log(timestamp); // Output: "2024-01-01T00:00:00.000Z"
 */
export const createISO8601Timestamp = () => {
	return new Date().toISOString();
}