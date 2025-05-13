import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createISO8601Timestamp,
  getDifferenceInMilliseconds,
  getISO8601TimestampFromUnix,
  getUnixTimestampFromISO8601
} from './timeUtils';

describe('timeUtils', () => {
  // Create a fixed mock date for testing
  const mockDateString = '2023-01-01T12:00:00.123Z';

  beforeEach(() => {
    // Use vi.useFakeTimers to control Date.now
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDateString));
    
    // Mock toISOString to return a fixed date
    vi.spyOn(Date.prototype, 'toISOString').mockImplementation(() => mockDateString);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('createISO8601Timestamp', () => {
    it('returns the current date and time in ISO 8601 format', () => {
      const timestamp = createISO8601Timestamp();
      expect(timestamp).toBe(mockDateString);
      // Ensure it contains milliseconds precision
      expect(timestamp).toMatch(/\.\d{3}Z$/);
    });
  });

  describe('getDifferenceInMilliseconds', () => {
    it('returns the difference between two timestamps in milliseconds', () => {
      const timestamp1 = '2023-01-01T12:00:00.000Z';
      const timestamp2 = '2023-01-01T12:00:01.500Z';
      const diff = getDifferenceInMilliseconds(timestamp1, timestamp2);
      expect(diff).toBe(-1500); // timestamp1 is 1.5 seconds before timestamp2
    });

    it('handles timestamps with millisecond precision', () => {
      const timestamp1 = '2023-01-01T12:00:00.123Z';
      const timestamp2 = '2023-01-01T12:00:00.456Z';
      const diff = getDifferenceInMilliseconds(timestamp1, timestamp2);
      expect(diff).toBe(-333); // 456ms - 123ms = 333ms
    });

    it('handles negative differences correctly', () => {
      const timestamp1 = '2023-01-01T12:00:01.000Z';
      const timestamp2 = '2023-01-01T12:00:00.000Z';
      const diff = getDifferenceInMilliseconds(timestamp1, timestamp2);
      expect(diff).toBe(1000); // timestamp1 is 1 second after timestamp2
    });

    it('returns 0 for identical timestamps', () => {
      const timestamp = '2023-01-01T12:00:00.000Z';
      const diff = getDifferenceInMilliseconds(timestamp, timestamp);
      expect(diff).toBe(0);
    });
  });

  describe('getISO8601TimestampFromUnix', () => {
    it('converts millisecond timestamp to ISO 8601 format', () => {
      // For this test, we need to restore the real toISOString
      vi.restoreAllMocks();
      
      // Jan 1, 2023, 12:00:00.123 UTC
      const unixTimestamp = 1672574400123;
      const isoTimestamp = getISO8601TimestampFromUnix(unixTimestamp);
      expect(isoTimestamp).toBe('2023-01-01T12:00:00.123Z');
    });

    it('handles timestamps with whole seconds correctly', () => {
      // For this test, we need to restore the real toISOString
      vi.restoreAllMocks();
      
      const unixTimestamp = 1672574400000; // Exactly noon
      const isoTimestamp = getISO8601TimestampFromUnix(unixTimestamp);
      expect(isoTimestamp).toBe('2023-01-01T12:00:00.000Z');
      // Ensure it still includes milliseconds precision even for whole seconds
      expect(isoTimestamp).toMatch(/\.000Z$/);
    });

    it('handles very large timestamps correctly (preventing invalid dates)', () => {
      // For this test, we need to restore the real toISOString
      vi.restoreAllMocks();
      
      // Use a large but valid timestamp (Jan 1, 2100)
      const largeTimestamp = 4102444800000; // Year 2100
      const isoTimestamp = getISO8601TimestampFromUnix(largeTimestamp);
      // Check that it's a valid future date
      expect(isoTimestamp).toBe('2100-01-01T00:00:00.000Z');
      expect(isoTimestamp).not.toContain('+057277'); // Make sure we don't get the invalid date we saw
    });

    it('handles zero timestamp correctly', () => {
      // For this test, we need to restore the real toISOString
      vi.restoreAllMocks();
      
      const unixTimestamp = 0; // Unix epoch
      const isoTimestamp = getISO8601TimestampFromUnix(unixTimestamp);
      expect(isoTimestamp).toBe('1970-01-01T00:00:00.000Z');
    });
  });

  describe('getUnixTimestampFromISO8601', () => {
    it('converts ISO 8601 timestamp to milliseconds', () => {
      const isoTimestamp = '2023-01-01T12:00:00.123Z';
      const unixTimestamp = getUnixTimestampFromISO8601(isoTimestamp);
      expect(unixTimestamp).toBe(1672574400123);
    });

    it('handles timestamps without milliseconds by treating them as .000', () => {
      const isoTimestamp = '2023-01-01T12:00:00Z';
      const unixTimestamp = getUnixTimestampFromISO8601(isoTimestamp);
      expect(unixTimestamp).toBe(1672574400000);
    });
  });

  describe('Round-trip conversion tests', () => {
    it('converting from Unix to ISO and back preserves the original timestamp', () => {
      // For this test, we need to restore the real toISOString
      vi.restoreAllMocks();
      
      const originalUnixTimestamp = 1672574400123;
      const isoTimestamp = getISO8601TimestampFromUnix(originalUnixTimestamp);
      const roundTripUnixTimestamp = getUnixTimestampFromISO8601(isoTimestamp);
      expect(roundTripUnixTimestamp).toBe(originalUnixTimestamp);
    });

    it('converting from ISO to Unix and back preserves the original timestamp', () => {
      // For this test, we need to restore the real toISOString
      vi.restoreAllMocks();
      
      const originalIsoTimestamp = '2023-01-01T12:00:00.123Z';
      const unixTimestamp = getUnixTimestampFromISO8601(originalIsoTimestamp);
      const roundTripIsoTimestamp = getISO8601TimestampFromUnix(unixTimestamp);
      expect(roundTripIsoTimestamp).toBe(originalIsoTimestamp);
    });
  });
}); 