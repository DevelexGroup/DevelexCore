/**
 * Returns the current date and time in ISO 8601 format.
 * All timestamp functions in this library consistently use milliseconds for numerical timestamps.
 * 
 * @returns {string} The current date and time in ISO 8601 format.
 * @example
 * const timestamp = createISO8601Timestamp();
 * console.log(timestamp); // Output: "2024-01-01T00:00:00.000Z"
 */
export const createISO8601Timestamp = () => {
	return new Date().toISOString();
}

/**
 * Returns difference between two ISO 8601 timestamps in milliseconds.
 * @param timestamp1 - The first timestamp in ISO 8601 format.
 * @param timestamp2 - The second timestamp in ISO 8601 format.
 * @returns {number} The difference between the two timestamps in milliseconds.
 */
export const getDifferenceInMilliseconds = (timestamp1: string, timestamp2: string) => {
	const time1 = Date.parse(timestamp1);
	const time2 = Date.parse(timestamp2);
	return time1 - time2;
}

/**
 * Returns the ISO 8601 timestamp from a timestamp in milliseconds.
 * 
 * IMPORTANT: This expects input in milliseconds (e.g., from Date.now()),
 * NOT seconds as in traditional Unix timestamps.
 * 
 * @param unixTimestamp - The timestamp in milliseconds (e.g., from Date.now()).
 * @returns {string} The ISO 8601 timestamp.
 */
export const getISO8601TimestampFromUnix = (unixTimestamp: number) => {
	// Date.now() returns timestamp in milliseconds, so we don't need to multiply by 1000
	// This fixes the issue with invalid dates like +057277-01-08
	return new Date(unixTimestamp).toISOString();
}

/**
 * Returns the timestamp in milliseconds from an ISO 8601 timestamp.
 * 
 * IMPORTANT: This returns milliseconds, NOT seconds as in traditional Unix timestamps.
 * 
 * @param iso8601Timestamp - The ISO 8601 timestamp.
 * @returns {number} The timestamp in milliseconds.
 */
export const getUnixTimestampFromISO8601 = (iso8601Timestamp: string) => {
	return Date.parse(iso8601Timestamp);
}
