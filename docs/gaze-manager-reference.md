# GazeManager API Reference

The `GazeManager` class is the main component of DevelexCore that provides an API for eye tracking integration. It handles hardware communication, data processing, and interaction management to create a unified interface for gaze-based applications in JavaScript runtime.

## Overview

The GazeManager serves as the primary interface for integrating eye tracking capabilities into web applications. It provides an API that handles:

- **Hardware Integration**: Connection to multiple eye tracking devices through the Develex Bridge
- **Performance Optimisation**: Efficient data processing using Web Workers and optimised algorithms
- **Coordinate Management**: Precise mapping of screen coordinates to DOM elements through calibration
- **Interaction Framework**: Complete detection system for fixation, saccade, dwell, validation, and intersection events
- **Element Management**: Registration system for gaze-enabled HTML elements

## Constructor

```typescript
new GazeManager()
```

Creates a new GazeManager instance with all interaction objects initialised and ready to use.

## Properties

### `input: GazeInput<GazeInputConfig> | null` (read-only)
The current gaze input instance, or `null` if no input is configured.

### `inputInstance: GazeInput<GazeInputConfig>` (read-only)
The current gaze input instance. Throws an error if no input is set.

### `windowCalibration: GazeWindowCalibratorConfig | null` (read-only)
The current window calibration configuration, or `null` if not calibrated.

### `lastStatus: ReceiveResponsePayload | null` (read-only)
The last received status from the gaze input.

### `registrationMap: object` (read-only)
A mapping of interaction types to their respective interaction objects:
- `'fixation'` → `GazeInteractionObjectFixation`
- `'saccade'` → `GazeInteractionObjectSaccade`
- `'dwell'` → `GazeInteractionObjectDwell`
- `'validation'` → `GazeInteractionObjectValidation`
- `'intersect'` → `GazeInteractionObjectIntersect`

## Methods

### Input Management

#### `createInput(input: GazeInputConfig): void`
Configures the gaze input with the specified configuration. For hardware trackers, this creates a Web Worker that handles WebSocket communication with the Develex Bridge.

```typescript
// Hardware tracker (requires the Develex Bridge to be running)
gazeManager.createInput({
    tracker: 'gazepoint',
    uri: 'ws://localhost:4242',  // WebSocket URI for the Bridge server
    fixationDetection: 'device'  // Use the eye tracker's built-in fixation detection
});

// Dummy tracker (for development and testing)
gazeManager.createInput({
    tracker: 'dummy',
    fixationDetection: 'idt',
    frequency: 60,
    precisionMinimalError: 2,
    precisionDecayRate: 0.1,
    precisionMaximumError: 10
});
```

**How it works:**
- **Hardware Trackers**: Creates a `GazeInputBridge` instance that spawns a Web Worker
- **Web Worker**: Establishes WebSocket connection to the Develex Bridge (C# server application)
- **Bridge Server**: Manages eye tracker hardware (GazePoint TCP, EyeLogic/ASEE native APIs)
- **Data Processing**: Raw gaze data is processed in the worker thread for performance
- **Coordinate Translation**: Window calibration is applied in the worker before sending to main thread

**Bridge Message Protocol:**
- **Commands**: `connect`, `subscribe`, `start`, `stop` sent to bridge
- **Responses**: Bridge replies with `response` containing status and correlation ID
- **Gaze Data**: Bridge broadcasts `gaze` messages with eye coordinates, validity, pupil data
- **Fixation Data**: Bridge sends `fixationStart`/`fixationEnd` messages when detected

#### `connect(): Promise<this>`
Sends a `connect` command to the Bridge server to establish communication with the eye tracker hardware.

**Process:**
1. **Hardware Trackers**: Sends `connect` command with tracker type config to Bridge server
2. **Bridge Server**: Creates appropriate eye tracker instance and establishes hardware connection
3. **Eye Tracker**: Initializes TCP connection (GazePoint) or native API (EyeLogic/ASEE)
4. **Dummy Tracker**: Sets up mouse event listeners and internal state
5. **Status Update**: Emits `inputState` event with connection status

#### `disconnect(): Promise<this>`
Sends a `disconnect` command to the Bridge server to terminate eye tracker connection.

#### `subscribe(): Promise<this>`
Sends a `subscribe` command to the Bridge server to begin receiving gaze data stream.

#### `unsubscribe(): Promise<this>`
Sends an `unsubscribe` command to the Bridge server to stop receiving gaze data.

#### `start(): Promise<this>`
Sends a `start` command to the Bridge server to begin gaze data collection from the eye tracker.

**For Hardware Trackers:**
- Sends `start` command to Bridge server
- Bridge server initiates data collection on eye tracker hardware
- Eye tracker streams raw gaze data to Bridge via TCP/UDP or native API
- Bridge parses and converts data to JSON format
- Bridge broadcasts JSON via WebSocket to Web Worker
- Web Worker applies window calibration and sends processed data to main thread

**For Dummy Tracker:**
- Starts interval timer for gaze data generation
- Uses mouse position as base coordinate with precision simulation

#### `stop(): Promise<this>`
Sends a stop command to halt gaze data collection from the eye tracker.

#### `open(): Promise<this>`
Opens the WebSocket connection to the Bridge server. This is typically called internally by the system.

#### `close(): Promise<this>`
Closes the WebSocket connection to the Bridge server.

#### `status(): Promise<this>`
Gets the current status of the gaze input device.

### Calibration

#### `calibrate(): Promise<this>`
Starts the eye tracker's built-in calibration process.

#### `setWindowCalibration(mouseEvent: GazeWindowCalibratorConfigMouseEventFields, window: GazeWindowCalibratorConfigWindowFields): Promise<this>`
Sets up window calibration to map screen coordinates to window pixel coordinates. This is essential for proper gaze tracking because eye trackers report screen-relative coordinates (0-1), whereas your web application exists within a browser window.

```typescript
await gazeManager.setWindowCalibration(
    { clientX: 100, clientY: 100, screenX: 150, screenY: 200 },
    { screen: { width: 1920, height: 1080 } }
);
```

**How it works:**
1. **Mouse Click Data**: Uses `clientX`/`clientY` (window-relative) and `screenX`/`screenY` (screen-absolute) coordinates
2. **Offset Calculation**: Calculates window position offset: `clientX - screenX`, `clientY - screenY`
3. **Worker Setup**: For hardware trackers, sends calibration data to Web Worker
4. **Coordinate Translation**: All future gaze data is automatically converted from screen coordinates to window pixel coordinates
5. **DOM Compatibility**: Ensures gaze coordinates align with HTML elements for proper intersection detection

**Why Mouse Click is Required:**
- Browsers do not provide a `window.screenPosition` API
- Mouse events provide both coordinate systems needed for calibration
- Dynamic window placement requires real-time measurement

### Detailed Technical Explanation

Window calibration needs a mouse click event because it provides **two types of coordinates**:

- **`clientX`/`clientY`**: Where the click happened **inside your browser window** (relative to viewport)
- **`screenX`/`screenY`**: Where the click happened **on the entire screen** (absolute screen position)

The difference between these coordinates (`clientX - screenX`, `clientY - screenY`) tells us exactly where your browser window is positioned on the screen.

**The Math Behind Calibration:**
```javascript
// When you get screen-relative gaze coordinates (0-1 range):
const gazeX = 0.5; // Middle of screen

// Calibration converts them to window pixel coordinates:
// windowX = (gazeX * screenWidth) + offset
const windowX = (gazeX * 1920) + (100 - 150); // = 960 - 50 = 910px

// Now gaze coordinates align with DOM elements!
```

**Why Not Other Methods:**
- **No API to query window position**: Browsers do not provide `window.screenPosition`
- **Dynamic window placement**: Users can drag windows, use multiple monitors, or resize windows
- **Screen coordinate requirement**: Eye trackers report screen-relative coordinates (0-1), not window-relative
- **Real mouse event needed**: Only genuine mouse/touch events provide both coordinate systems

**When to Recalibrate:**
- When your application window is resized or moved
- When switching between different displays or screen configurations
- If gaze tracking seems inaccurate or offset
- After any window position changes

**Calibration Data**: The calibration settings are stored in the `windowCalibration` property and can be reused across sessions.

## Configuration Options

### Complete Tracker Configurations

```typescript
// GazePoint configuration
const gazepointConfig: GazeInputConfigGazePoint = {
    tracker: 'gazepoint',
    uri: 'ws://localhost:4242',  // Bridge WebSocket server
    fixationDetection: 'device'  // Use hardware fixation detection
};

// EyeLogic configuration
const eyelogicConfig: GazeInputConfigEyeLogic = {
    tracker: 'eyelogic',
    uri: 'ws://localhost:4242',
    fixationDetection: 'idt'     // Use IDT algorithm for fixation detection
};

// ASEE configuration
const aseeConfig: GazeInputConfigAsee = {
    tracker: 'asee',
    uri: 'ws://localhost:4242',
    fixationDetection: 'idt'
};

// Dummy tracker configuration
const dummyConfig: GazeInputConfigDummy = {
    tracker: 'dummy',
    fixationDetection: 'idt',
    frequency: 60,
    precisionMinimalError: 2,
    precisionDecayRate: 0.1,
    precisionMaximumError: 10
};
```

### Complete Interaction Settings

```typescript
// Dwell interaction settings
const dwellSettings: Partial<GazeInteractionObjectDwell['defaultSettings']> = {
    dwellTime: 1000,        // Time to trigger (ms)
    toleranceTime: 150,     // Allowed gaze excursion time (ms)
    bufferSize: 100,        // Data buffer size
    onDwellProgress: (event) => {
      // Progress callback - called during dwell
    },
    onDwellFinish: (event) => {
      // Completion callback - called when dwell completes
    },
    onDwellCancel: (event) => {
      // Cancellation callback - called when dwell is interrupted
    }
};

// Fixation interaction settings
const fixationSettings: Partial<GazeInteractionObjectFixation['defaultSettings']> = {
    bufferSize: 1000,
    fixationObjectStart: (event) => {
      // Called when fixation begins on element
    },
    fixationObjectEnd: (event) => {
      // Called when fixation ends on element
    },
    fixationObjectProgress: (event) => {
      // Called during fixation on element
    }
};

// Saccade interaction settings
const saccadeSettings: Partial<GazeInteractionObjectSaccade['defaultSettings']> = {
    // Saccade-specific settings
};

// Validation interaction settings
const validationSettings: Partial<GazeInteractionObjectValidation['defaultSettings']> = {
    // Validation-specific settings
};

// Intersection interaction settings
const intersectSettings: Partial<GazeInteractionObjectIntersect['defaultSettings']> = {
    // Intersection-specific settings
};
```

### Element Registration

#### `register(registration: GazeManagerRegistration): void`
Registers an HTML element for gaze interaction.

```typescript
gazeManager.register({
    interaction: 'dwell',
    element: document.getElementById('myButton'),
    settings: {
      dwellTime: 1000,
      onDwellFinish: (event) => console.log('Dwell completed')
    }
});
```

#### `unregister(registration: Omit<GazeManagerRegistration, 'settings'>): void`
Unregisters an HTML element from gaze interaction.

```typescript
gazeManager.unregister({
    interaction: 'dwell',
    element: document.getElementById('myButton')
});
```

## Events

The GazeManager extends `EmitterGroup` and emits the following events:

### Input Events
- `inputData` - Raw gaze data received from the input device
- `inputState` - Input device state changes (connected, disconnected, calibrating, etc.)
- `inputMessage` - Messages from the input device
- `inputError` - Errors from the input device
- `inputFixationStart` - Fixation started (from input device)
- `inputFixationEnd` - Fixation ended (from input device)

### Calibration Events
- `windowCalibrated` - Window calibration completed
- `windowCalibrationContested` - Window calibration was contested
- `calibrated` - Eye tracker calibration completed

### Dwell Events
- `dwell` - Dwell interaction started
- `dwellProgress` - Dwell interaction in progress
- `dwellFinish` - Dwell interaction completed
- `dwellCancel` - Dwell interaction cancelled

### Fixation Events
- `fixationObjectStart` - Fixation started on an element
- `fixationObjectEnd` - Fixation ended on an element
- `fixationObjectProgress` - Fixation in progress on an element

### Saccade Events
- `saccadeObjectTo` - Saccade movement to an element
- `saccadeObjectFrom` - Saccade movement from an element

### Other Events
- `validation` - Validation interaction events
- `intersect` - Intersection interaction events

## Event Usage

```typescript
// Listen to gaze data
gazeManager.on('inputData', (gazeData) => {
    console.log('Gaze position:', gazeData.x, gazeData.y);
});

// Listen to dwell events
gazeManager.on('dwellFinish', (event) => {
    console.log('Dwell completed on element');
});

// Listen to fixation events
gazeManager.on('fixationObjectEnd', (event) => {
    console.log('Fixation ended on element');
});

// Listen to errors
gazeManager.on('inputError', (error) => {
    console.error('Gaze input error:', error);
});
```

## Types

### `GazeManagerRegistration`

Union type for element registration:

```typescript
type GazeManagerRegistration = {
    interaction: 'fixation',
    element: Element,
    settings: Partial<GazeInteractionObjectFixationSettings>
} | {
    interaction: 'saccade',
    element: Element,
    settings: Partial<GazeInteractionObjectSaccadeSettings>
} | {
    interaction: 'dwell',
    element: Element,
    settings: Partial<GazeInteractionDwellSettingsType>
} | {
    interaction: 'validation',
    element: Element,
    settings: Partial<GazeInteractionObjectValidationSettings>
} | {
    interaction: 'intersect',
    element: Element,
    settings: Partial<GazeInteractionObjectIntersectSettingsType>
}
```

## Complete Example

### Hardware Tracker with Develex Bridge

```typescript
import { GazeManager } from 'develex-js-sdk';

// Create manager
const gazeManager = new GazeManager();

// Configure hardware tracker (requires Develex Bridge running)
gazeManager.createInput({
    tracker: 'gazepoint',
    uri: 'ws://localhost:4242',  // Bridge WebSocket server
    fixationDetection: 'device'  // Use hardware fixation detection
});

// Connect to eye tracker via Bridge server
await gazeManager.connect();

// Subscribe to gaze data stream from Bridge
await gazeManager.subscribe();

// Start eye tracker data collection
await gazeManager.start();

// Calibrate window coordinates (essential for proper tracking)
await gazeManager.setWindowCalibration(
    { clientX: 100, clientY: 100, screenX: 150, screenY: 200 },
    { screen: { width: 1920, height: 1080 } }
);

// Register elements for gaze interaction
gazeManager.register({
    interaction: 'dwell',
    element: document.getElementById('button'),
    settings: {
      dwellTime: 1000,
      bufferSize: 100,
      toleranceTime: 150,
      onDwellProgress: (event) => console.log('Dwell progress'),
      onDwellFinish: (event) => console.log('Dwell finished'),
      onDwellCancel: (event) => console.log('Dwell cancelled')
    }
});

// Listen to processed gaze data (coordinates are already window-calibrated)
gazeManager.on('inputData', (data) => {
    console.log('Gaze position:', data.x, data.y); // These are window pixel coordinates
});

// Listen to interaction events
gazeManager.on('dwellFinish', (event) => {
    console.log('User dwelled on element!');
});

// Cleanup
await gazeManager.stop();
await gazeManager.disconnect();
gazeManager.removeAllListeners();
```

### Development with Dummy Tracker

```typescript
import { GazeManager } from 'develex-js-sdk';

// Create manager
const gazeManager = new GazeManager();

// Configure dummy tracker (no Bridge required)
gazeManager.createInput({
    tracker: 'dummy',
    fixationDetection: 'idt',
    frequency: 60,
    precisionMinimalError: 2,
    precisionDecayRate: 0.1,
    precisionMaximumError: 10
});

// Connect (sets up mouse event listeners)
await gazeManager.connect();

// Subscribe and start (begins gaze data generation)
await gazeManager.subscribe();
await gazeManager.start();

// Calibrate window coordinates
await gazeManager.setWindowCalibration(
    { clientX: 100, clientY: 100, screenX: 150, screenY: 200 },
    { screen: { width: 1920, height: 1080 } }
);

// Register elements
gazeManager.register({
    interaction: 'dwell',
    element: document.getElementById('button'),
    settings: {
      dwellTime: 1000,
      bufferSize: 100,
      toleranceTime: 150,
      onDwellFinish: (event) => console.log('Dwell completed!')
    }
});

// Listen to gaze data (follows mouse movement with precision simulation)
gazeManager.on('inputData', (data) => {
    console.log('Simulated gaze:', data.x, data.y);
});
```

## Error Handling

The GazeManager provides error handling through events:

```typescript
gazeManager.on('inputError', (error) => {
    console.error('Gaze input error:', error);
    // Handle connection errors, calibration failures, etc.
});

gazeManager.on('inputState', (state) => {
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
    }
});
```

## Notes

### Performance Considerations
- **Web Worker Processing**: Hardware trackers use Web Workers for gaze data processing to avoid blocking the main thread
- **Coordinate Translation**: Window calibration is applied in the worker thread for optimal performance
- **Event Batching**: Gaze data events are processed efficiently through the event system

### Architecture Details
- **Hardware Trackers**: Use `GazeInputBridge` which spawns a Web Worker for WebSocket communication
- **Dummy Tracker**: Runs entirely in the main thread using mouse events and timers
- **Data Flow**: Raw gaze data → Web Worker → Window calibration → Main thread → Interaction handlers
- **Event Routing**: GazeManager automatically routes data to appropriate interaction objects

### Best Practices
- **Window Calibration**: Always calibrate after window resize or position changes
- **Error Handling**: Listen to `inputError` and `inputState` events for robust error handling
- **Cleanup**: Always call `removeAllListeners()` when the manager is no longer needed
- **Performance**: For heavy gaze data processing, consider moving logic to Web Workers
- **Testing**: Use dummy tracker for development and testing without hardware

### Technical Implementation
- **Bridge Architecture**: C# Windows Forms application managing eye tracker hardware
- **WebSocket Protocol**: JSON-based communication with correlation IDs and initiator tracking
- **Data Flow**: Eye Tracker → TCP/UDP/Native API → Bridge parsing → JSON WebSocket → Web Worker
- **Coordinate Systems**: Screen-relative (0-1) gaze data → Window pixel coordinates via window calibration
- **Fixation Detection**: Hardware detection (Bridge) or IDT algorithm (Web Worker)
- **Event System**: Built on custom `EmitterGroup` for efficient event handling
