# Data Structures Reference

This reference documents all data structures, interfaces, and payloads used throughout DevelexCore. Understanding these structures is essential for effectively processing gaze data, handling events, and configuring interactions.

## Core Data Types

### GazeDataPoint

The fundamental data structure that contains eye tracking information.

```typescript
interface GazeDataPoint {
  // Base gaze data from GazeDataPayload
  type: 'gaze';                // Event type identifier
  deviceId: string;            // Device sample ID
  xL: number;                  // Left eye X coordinate
  yL: number;                  // Left eye Y coordinate
  validityL: boolean;          // Left eye data validity
  pupilDiameterL: number;      // Left pupil diameter
  xR: number;                  // Right eye X coordinate
  yR: number;                  // Right eye Y coordinate
  validityR: boolean;          // Right eye data validity
  pupilDiameterR: number;      // Right pupil diameter
  deviceTimestamp: string;     // Device timestamp (ISO 8601)
  timestamp: string;           // Application timestamp (ISO 8601)

  // Extended properties added to GazeDataPoint
  sessionId: string;           // Unique session identifier
  parseValidity: boolean;      // Data parsing success
  x: number;                   // Averaged X coordinate (window pixels)
  y: number;                   // Averaged Y coordinate (window pixels)
  xLScreenRelative: number;    // Left eye X (0-1 screen range)
  yLScreenRelative: number;    // Left eye Y (0-1 screen range)
  xRScreenRelative: number;    // Right eye X (0-1 screen range)
  yRScreenRelative: number;    // Right eye Y (0-1 screen range)
}
```

**Usage Example:**
```typescript
gazeManager.on('inputData', (data: GazeDataPoint) => {
  // Check if data is valid
  if (data.validityL || data.validityR) {
    // Use averaged coordinates for best results
    const avgX = (data.xL + data.xR) / 2;
    const avgY = (data.yL + data.yR) / 2;

    // Update gaze cursor position
    gazeCursor.style.left = `${avgX}px`;
    gazeCursor.style.top = `${avgY}px`;
  }
});
```

### FixationDataPoint

This interface represents detected eye fixation events with duration and position information.

```typescript
interface FixationDataPoint {
  // Base fixation data from FixationDataPayload
  type: 'fixationStart' | 'fixationEnd';  // Event type
  deviceId: string;                       // Device fixation ID
  timestamp: string;                      // Application timestamp (ISO 8601)
  deviceTimestamp: string;                // Device timestamp (ISO 8601)
  duration: number;                       // Fixation duration in milliseconds
  x: number;                              // Fixation X coordinate (window pixels)
  y: number;                              // Fixation Y coordinate (window pixels)

  // Extended properties added to FixationDataPoint
  sessionId: string;                      // Session identifier
  parseValidity: boolean;                 // Data validity
  xScreenRelative: number;                // X coordinate (0-1 screen range)
  yScreenRelative: number;                // Y coordinate (0-1 screen range)
  fixationId: number;                     // Unique fixation identifier
}
```

## Event Structures

### Base Event Interface

All interaction events extend this base interface:

```typescript
interface GazeInteractionEvent {
  type: string;        // Event type identifier
  sessionId: string;   // Unique session ID
  timestamp: string;   // ISO 8601 timestamp
}
```

### Dwell Events

**GazeInteractionObjectDwellEvent:**
```typescript
interface GazeInteractionObjectDwellEvent extends GazeInteractionEvent {
  type: 'dwellProgress' | 'dwellFinish' | 'dwellCancel';
  duration: number;           // Time elapsed in dwell
  target: [Element];          // Target element(s)
  settings: GazeInteractionDwellSettingsType;    // Original settings
  gazeData: GazeDataPoint;    // Current gaze data
}
```

### Fixation Events

**GazeInteractionObjectFixationEvent:**
```typescript
interface GazeInteractionObjectFixationEvent extends Omit<FixationDataPoint, 'type'> {
  type: 'fixationObjectStart' | 'fixationObjectEnd' | 'fixationObjectProgress';
  fixationId: number;         // Fixation identifier
  duration: number;           // Fixation duration
  target: Element[];          // Target element(s)
  settings: GazeInteractionObjectFixationSettings[]; // Original settings
}
```

### Validation Events

**GazeInteractionObjectValidationEvent:**
```typescript
interface GazeInteractionObjectValidationEvent extends GazeInteractionEvent {
  type: 'validation';
  validationDuration: number;     // Test duration (ms)
  isValid: boolean;              // Validation result
  allDataPointsCount: number;    // Total samples collected
  validDataPointsCount: number;  // Valid samples count
  validDataPointsPercentage: number; // Validity percentage
  accuracy: number;              // Average accuracy (pixels)
  precision: number;             // Precision measurement (pixels)
  gazeDataPoints: GazeDataPoint[]; // All collected samples
}
```

### Saccade Events

**GazeInteractionObjectSaccadeEvent:**
```typescript
interface GazeInteractionObjectSaccadeEvent extends GazeInteractionEvent {
  type: 'saccadeObjectTo' | 'saccadeObjectFrom';
  duration: number;              // Saccade duration (ms)
  distance: number;              // Movement distance (pixels)
  angleToScreen: number;         // Angle to horizontal (degrees)
  angleToPrevious?: number;      // Angle to previous saccade
  originFixation: FixationDataPoint;  // Starting fixation
  targetFixation: FixationDataPoint;  // Ending fixation
  target: Element[];             // Target element(s)
  settings: GazeInteractionObjectSaccadeSettings[];   // Original settings
}
```

### Intersection Events

**GazeInteractionObjectIntersectEvent:**
```typescript
interface GazeInteractionObjectIntersectEvent extends GazeInteractionEvent {
  type: 'intersect';
  target: Element[];            // Intersected element(s)
  settings: GazeInteractionObjectIntersectSettingsType[]; // Original settings
  gazeData: GazeDataPoint;     // Current gaze data
}
```

## Response and Status Structures

### Bridge Response

**TrackerStatus:**
```typescript
interface TrackerStatus {
  status:
    | 'trackerDisconnected'
    | 'trackerConnected'
    | 'trackerConnecting'
    | 'trackerCalibrating'
    | 'trackerEmitting';
  calibration: string | null; // Last calibration time (ISO date-time)
}
```

**CommandType:**
```typescript
type CommandType =
  | 'subscribe'
  | 'unsubscribe'
  | 'connect'
  | 'disconnect'
  | 'calibrate'
  | 'start'
  | 'stop'
  | 'response'
  | 'status';
```

**ResponseStatus:**
```typescript
interface ResponseStatus {
  to: CommandType;           // Command this responds to
  status: 'resolved' | 'rejected' | 'processing';
  message: string;           // Status message
}
```

**ReceiveResponsePayload:**
```typescript
interface ReceiveResponsePayload {
  type: 'response';
  correlationId: number;       // Request correlation ID
  initiatorId: string;         // Request initiator
  timestamp: string;           // Response timestamp
  tracker: TrackerStatus;      // Eye tracker status information
  response: ResponseStatus;    // Response status information
}
```

### Error Events

**ReceiveErrorPayload:**
```typescript
interface ReceiveErrorPayload {
  type: 'error';
  content: string;        // Error description
  timestamp: string;      // ISO 8601 timestamp
}
```

## Configuration Interfaces

### Window Calibration Types

**GazeWindowCalibratorConfig:**
```typescript
interface GazeWindowCalibratorConfig {
  timestamp: string;           // ISO 8601 timestamp
  clientX: number;             // Mouse client X coordinate
  clientY: number;             // Mouse client Y coordinate
  screenX: number;             // Mouse screen X coordinate
  screenY: number;             // Mouse screen Y coordinate
  windowScreenWidth: number;   // Window screen width
  windowScreenHeight: number;  // Window screen height
}
```

**GazeWindowCalibratorConfigMouseEventFields:**
```typescript
interface GazeWindowCalibratorConfigMouseEventFields {
  clientX: number;             // Mouse client X coordinate
  clientY: number;             // Mouse client Y coordinate
  screenX: number;             // Mouse screen X coordinate
  screenY: number;             // Mouse screen Y coordinate
}
```

**Note**: These properties can be obtained directly from a native `MouseEvent` object.

**GazeWindowCalibratorConfigWindowFields:**
```typescript
interface GazeWindowCalibratorConfigWindowFields {
  screen: {
    width: number;             // Screen width in pixels
    height: number;            // Screen height in pixels
  };
}
```

**Note**: These properties can be obtained directly from a native `window.screen`.

### Tracker Configuration

**GazeInputConfigGazePoint:**
```typescript
interface GazeInputConfigGazePoint {
  tracker: 'gazepoint';
  uri: string;                    // Bridge WebSocket URI
  fixationDetection: 'none' | 'device' | 'idt';
}
```

**GazeInputConfigEyeLogic:**
```typescript
interface GazeInputConfigEyeLogic {
  tracker: 'eyelogic';
  uri: string;
  fixationDetection: 'none' | 'idt' | 'device';
}
```

**GazeInputConfigAsee:**
```typescript
interface GazeInputConfigAsee {
  tracker: 'asee';
  uri: string;
  fixationDetection: 'none' | 'idt';
}
```

**GazeInputConfigDummy:**
```typescript
interface GazeInputConfigDummy {
  tracker: 'dummy';
  fixationDetection: 'idt';
  frequency: number;              // Data emission frequency (Hz)
  precisionMinimalError: number;  // Minimum tracking error (pixels)
  precisionDecayRate: number;     // Precision degradation rate
  precisionMaximumError: number;  // Maximum tracking error (pixels)
}
```

## Data Processing Patterns

### Data Validation

```typescript
function isValidGazeData(data: GazeDataPoint): boolean {
  // Check if either eye has valid data
  return data.validityL || data.validityR;
}

function getBestGazePosition(data: GazeDataPoint): { x: number; y: number } | null {
  if (!isValidGazeData(data)) return null;

  // Use averaged position for best accuracy
  if (data.validityL && data.validityR) {
    return {
      x: (data.xL + data.xR) / 2,
      y: (data.yL + data.yR) / 2
    };
  }

  // Use valid eye data
  if (data.validityL) return { x: data.xL, y: data.yL };
  if (data.validityR) return { x: data.xR, y: data.yR };

  return null;
}
```

### Event Data Access

```typescript
function handleDwellEvent(event: GazeInteractionObjectDwellEvent) {
  const { target, duration, gazeData, settings } = event;

  // Access target element
  const element = target[0];

  // Check if dwell completed successfully
  if (event.type === 'dwellFinish') {
    console.log(`Dwell completed on ${element.id} after ${duration}ms`);
  }

  // Access current gaze position
  const currentPosition = { x: gazeData.x, y: gazeData.y };

  // Access original settings
  const dwellTime = settings.dwellTime;
}
```

### Response Handling

```typescript
gazeManager.on('inputState', (state: ReceiveResponsePayload) => {
  switch (state.tracker?.status) {
    case 'trackerConnected':
      console.log('Eye tracker connected');
      break;
    case 'trackerDisconnected':
      console.log('Eye tracker disconnected');
      break;
    case 'trackerCalibrating':
      console.log('Calibration in progress');
      break;
    case 'trackerEmitting':
      console.log('Tracker emitting gaze data');
      break;
  }
});
```

## Data Flow Architecture

### Data Transformation Pipeline

1. **Hardware → Bridge:** Raw eye tracker data (TCP/UDP/Native API)
2. **Bridge → WebSocket:** JSON serialization with metadata
3. **WebSocket → Worker:** WebSocket message parsing
4. **Worker → Calibration:** Screen coordinates → Window pixels
5. **Worker → Main Thread:** Processed gaze data and events
6. **Main Thread → Interactions:** Element-specific event generation

## Common Data Patterns

### Coordinate Systems

```typescript
// Screen-relative coordinates (0-1 range)
const screenCoords = {
  x: gazeData.xLScreenRelative,  // 0 = left edge, 1 = right edge
  y: gazeData.yLScreenRelative   // 0 = top edge, 1 = bottom edge
};

// Window pixel coordinates (after calibration)
const windowCoords = {
  x: gazeData.x,  // Actual pixel position in browser window
  y: gazeData.y
};

// Convert between coordinate systems
function screenToWindow(screenX: number, screenY: number, windowWidth: number, windowHeight: number) {
  return {
    x: screenX * windowWidth,
    y: screenY * windowHeight
  };
}
```

### Eye Data Handling

```typescript
function getReliableGazeData(data: GazeDataPoint) {
  const leftEye = { x: data.xL, y: data.yL, valid: data.validityL };
  const rightEye = { x: data.xR, y: data.yR, valid: data.validityR };

  // Strategy 1: Use averaged position if both eyes valid
  if (leftEye.valid && rightEye.valid) {
    return {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
      confidence: 'high'
    };
  }

  // Strategy 2: Use single valid eye
  if (leftEye.valid) return { ...leftEye, confidence: 'medium' };
  if (rightEye.valid) return { ...rightEye, confidence: 'medium' };

  // Strategy 3: No valid data
  return null;
}
```

### Event-Driven Processing

```typescript
class GazeDataProcessor {
  private gazeHistory: GazeDataPoint[] = [];
  private readonly maxHistorySize = 100;

  processGazeData(data: GazeDataPoint) {
    // Store in history for trend analysis
    this.gazeHistory.push(data);
    if (this.gazeHistory.length > this.maxHistorySize) {
      this.gazeHistory.shift();
    }

    // Calculate velocity (pixels per millisecond)
    const velocity = this.calculateVelocity(data);

    // Detect patterns
    if (velocity < 50) { // Slow movement = potential fixation
      this.detectFixation(data);
    }
  }

  private calculateVelocity(current: GazeDataPoint): number {
    if (this.gazeHistory.length < 2) return 0;

    const previous = this.gazeHistory[this.gazeHistory.length - 2];
    const timeDiff = new Date(current.timestamp).getTime() -
                     new Date(previous.timestamp).getTime();

    if (timeDiff === 0) return 0;

    const distance = Math.sqrt(
      Math.pow(current.x - previous.x, 2) +
      Math.pow(current.y - previous.y, 2)
    );

    return distance / timeDiff;
  }
}
```

## Error Handling

### Data Validation

```typescript
function validateGazeData(data: GazeDataPoint): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check coordinate bounds
  if (data.x < 0 || data.y < 0) {
    errors.push('Coordinates outside window bounds');
  }

  // Check timestamp validity
  if (!data.timestamp || !data.deviceTimestamp) {
    errors.push('Missing timestamp data');
  }

  // Check eye validity
  if (!data.validityL && !data.validityR) {
    errors.push('No valid eye data');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Response Error Handling

```typescript
gazeManager.on('inputError', (error: ReceiveErrorPayload) => {
  console.error(`Gaze input error at ${error.timestamp}: ${error.content}`);

  // Handle specific error types
  if (error.content.includes('connection')) {
    // Attempt reconnection
    attemptReconnection();
  } else if (error.content.includes('calibration')) {
    // Prompt for recalibration
    showCalibrationDialog();
  }
});
```
