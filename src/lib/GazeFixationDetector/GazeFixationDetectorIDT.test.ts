import { describe, it, expect } from 'vitest';
import { GazeFixationDetectorIDT } from './GazeFixationDetectorIDT';
import type { GazeDataPoint, FixationDataPoint } from '$lib/GazeData/GazeData';

const makeISO = (t: number) => new Date(t).toISOString();

function makeGazePoint(overrides: Partial<GazeDataPoint> = {}): GazeDataPoint {
  const base: GazeDataPoint = {
    type: 'gaze',
    deviceId: 'dev-1',
    xL: 100,
    yL: 100,
    validityL: true,
    pupilDiameterL: 3,
    xR: 100,
    yR: 100,
    validityR: true,
    pupilDiameterR: 3,
    deviceTimestamp: makeISO(Date.now()),
    timestamp: makeISO(Date.now()),
    sessionId: 's-1',
    parseValidity: true,
    x: 100,
    y: 100,
    xLScreenRelative: 0.5,
    yLScreenRelative: 0.5,
    xRScreenRelative: 0.5,
    yRScreenRelative: 0.5,
  };
  return { ...base, ...overrides };
}

describe('GazeFixationDetectorIDT - null and state handling', () => {
  it('starts a fixation after min duration and ends on null break', () => {
    const start = Date.now();
    const idt = new GazeFixationDetectorIDT(60 /* ms */, 100 /* deg big tolerance */, 0.7, 96);

    const events: FixationDataPoint[] = [];
    idt.on('fixationStart', (e) => events.push(e));
    idt.on('fixationEnd', (e) => events.push(e));

    // 4 samples 20ms apart at same location to surpass 60ms
    for (let i = 0; i < 4; i++) {
      const t = start + i * 20;
      idt.processGazePoint(
        makeGazePoint({ timestamp: makeISO(t), deviceTimestamp: makeISO(t), x: 100, y: 100, xL: 100, yL: 100, xR: 100, yR: 100 })
      );
    }

    // Should have emitted a fixationStart once
    expect(events.length >= 1).toBe(true);
    expect(events[0].type).toBe('fixationStart');

    // One more valid sample during fixation
    const t5 = start + 80;
    idt.processGazePoint(
      makeGazePoint({ timestamp: makeISO(t5), deviceTimestamp: makeISO(t5), x: 100, y: 100, xL: 100, yL: 100, xR: 100, yR: 100 })
    );

    // Null sample breaks the stream -> should emit fixationEnd
    // @ts-expect-error testing null resilience
    idt.processGazePoint(null);

    const types = events.map((e) => e.type);
    expect(types).toContain('fixationStart');
    expect(types).toContain('fixationEnd');
    const startEvt = events.find((e) => e.type === 'fixationStart')!;
    const endEvt = events.find((e) => e.type === 'fixationEnd')!;
    expect(startEvt.fixationId).toBe(endEvt.fixationId);
  });

  it('ends fixation when dispersion breaks (big jump)', () => {
    const start = Date.now();
    // Very small dispersion tolerance -> identical points ok, jump will end fixation
    const idt = new GazeFixationDetectorIDT(60 /* ms */, 0.000001 /* deg tiny tolerance */, 0.7, 96);

    const events: FixationDataPoint[] = [];
    idt.on('fixationStart', (e) => events.push(e));
    idt.on('fixationEnd', (e) => events.push(e));

    for (let i = 0; i < 4; i++) {
      const t = start + i * 20;
      idt.processGazePoint(
        makeGazePoint({ timestamp: makeISO(t), deviceTimestamp: makeISO(t), x: 200, y: 200, xL: 200, yL: 200, xR: 200, yR: 200 })
      );
    }

    expect(events.some((e) => e.type === 'fixationStart')).toBe(true);

    // Big jump breaks dispersion -> should emit fixationEnd
    const tBreak = start + 100;
    idt.processGazePoint(
      makeGazePoint({ timestamp: makeISO(tBreak), deviceTimestamp: makeISO(tBreak), x: 2000, y: 2000, xL: 2000, yL: 2000, xR: 2000, yR: 2000 })
    );

    expect(events.some((e) => e.type === 'fixationEnd')).toBe(true);
  });

  it('ignores samples where both eyes invalid', () => {
    const start = Date.now();
    const idt = new GazeFixationDetectorIDT(60, 100, 0.7, 96);
    let emitted = false;
    idt.on('fixationStart', () => (emitted = true));
    idt.on('fixationEnd', () => (emitted = true));

    const invalid = makeGazePoint({
      validityL: false,
      validityR: false,
      timestamp: makeISO(start),
      deviceTimestamp: makeISO(start),
    });
    idt.processGazePoint(invalid);
    expect(emitted).toBe(false);
  });

  it('ignores non-finite x/y samples', () => {
    const start = Date.now();
    const idt = new GazeFixationDetectorIDT(60, 100, 0.7, 96);
    let emitted = false;
    idt.on('fixationStart', () => (emitted = true));
    idt.on('fixationEnd', () => (emitted = true));

    const bad = makeGazePoint({ x: Number.NaN, y: Number.POSITIVE_INFINITY, timestamp: makeISO(start), deviceTimestamp: makeISO(start) });
    idt.processGazePoint(bad);
    expect(emitted).toBe(false);
  });

  it('null without active fixation does not emit', () => {
    const idt = new GazeFixationDetectorIDT(60, 100, 0.7, 96);
    let emitted = false;
    idt.on('fixationStart', () => (emitted = true));
    idt.on('fixationEnd', () => (emitted = true));
    // @ts-expect-error testing null resilience
    idt.processGazePoint(null);
    expect(emitted).toBe(false);
  });

  it('one eye invalid samples can still form a fixation', () => {
    const start = Date.now();
    const idt = new GazeFixationDetectorIDT(60, 100, 0.7, 96);

    const events: FixationDataPoint[] = [];
    idt.on('fixationStart', (e) => events.push(e));
    idt.on('fixationEnd', (e) => events.push(e));

    for (let i = 0; i < 4; i++) {
      const t = start + i * 20;
      idt.processGazePoint(
        makeGazePoint({
          validityL: false,
          validityR: true,
          x: 150,
          y: 160,
          xL: 0, // ignored by validity in app logic, but detector averages blindly; still ok
          yL: 0,
          xR: 150,
          yR: 160,
          timestamp: makeISO(t),
          deviceTimestamp: makeISO(t),
        })
      );
    }

    expect(events.some((e) => e.type === 'fixationStart')).toBe(true);
  });

  it('produces two separate fixations with incrementing IDs', () => {
    const start = Date.now();
    const idt = new GazeFixationDetectorIDT(60, 100, 0.7, 96);

    const events: FixationDataPoint[] = [];
    idt.on('fixationStart', (e) => events.push(e));
    idt.on('fixationEnd', (e) => events.push(e));

    for (let i = 0; i < 4; i++) {
      const t = start + i * 20;
      idt.processGazePoint(
        makeGazePoint({ timestamp: makeISO(t), deviceTimestamp: makeISO(t), x: 300, y: 300, xL: 300, yL: 300, xR: 300, yR: 300 })
      );
    }
    // Break by null sample (stream gap)
    // @ts-expect-error testing null resilience
    idt.processGazePoint(null);

    // Second fixation cluster
    for (let i = 0; i < 4; i++) {
      const t = start + 200 + i * 20;
      idt.processGazePoint(
        makeGazePoint({ timestamp: makeISO(t), deviceTimestamp: makeISO(t), x: 400, y: 400, xL: 400, yL: 400, xR: 400, yR: 400 })
      );
    }

    // Close second fixation as well
    // @ts-expect-error testing null resilience
    idt.processGazePoint(null);

    const starts = events.filter((e) => e.type === 'fixationStart');
    const ends = events.filter((e) => e.type === 'fixationEnd');
    expect(starts.length).toBeGreaterThanOrEqual(2);
    expect(ends.length).toBeGreaterThanOrEqual(2);
    expect(starts[0].fixationId).toBe(1);
    expect(ends[0].fixationId).toBe(1);
    expect(starts[1].fixationId).toBe(2);
    expect(ends[1].fixationId).toBe(2);
  });
});


