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

/**
 * Returns difference between two ISO 8601 timestamps in milliseconds.
 * @param timestamp1 - The first timestamp.
 * @param timestamp2 - The second timestamp.
 * @returns {number} The difference between the two timestamps in milliseconds.
 */
export const getDifferenceInMilliseconds = (timestamp1: string, timestamp2: string) => {
	const time1 = Date.parse(timestamp1);
	const time2 = Date.parse(timestamp2);
	return time1 - time2;
}

/**
 * Returns the ISO 8601 timestamp from UNIX timestamp.
 * @param unixTimestamp - The UNIX timestamp.
 * @returns {string} The ISO 8601 timestamp.
 */
export const getISO8601TimestampFromUnix = (unixTimestamp: number) => {
	return new Date(unixTimestamp * 1000).toISOString();
}

/**
 * Returns the UNIX timestamp from ISO 8601 timestamp.
 * @param iso8601Timestamp - The ISO 8601 timestamp.
 * @returns {number} The UNIX timestamp.
 */
export const getUnixTimestampFromISO8601 = (iso8601Timestamp: string) => {
	return Date.parse(iso8601Timestamp) / 1000;
}
