# Getting Started with DevelexCore

DevelexCore is a JavaScript SDK that enables eye tracking capabilities in web applications. This guide explains how to integrate it into your application, covering basic setup procedures, configuration options, and common usage patterns.

## Prerequisites

Before using DevelexCore, you need to set up the following components:

### 1. Eye Tracking Hardware

For production applications, you need an eye tracking device:

- **GazePoint** - Professional eye tracking systems
- **EyeLogic** - Consumer-grade eye trackers
- **ASEE** - Advanced eye tracking platforms

For development and testing, you can use the built-in dummy tracker, which simulates gaze data based on mouse position. In that case, you can skip these steps.

### 2. Eye Tracker Software

Install and configure the companion software for your eye tracking device:

- **GazePoint Control** for GazePoint devices
- **EyeLogic software** for EyeLogic devices
- **ASEE platform** for ASEE devices

### 3. Develex Bridge (Required for Hardware Trackers)

For hardware eye trackers, you need the Develex Bridge application running on your system:

**Download**: Get the latest version from the [releases page](https://develex-docs-197fe5.gitlab-pages.ics.muni.cz/bridge/releases).

**Installation**: The Develex Bridge is a standalone application that you download and run directly. It does not require npm installation.

**Starting the Bridge**:
1. Download and extract the bridge application
2. Run the executable file
3. The bridge starts a WebSocket server, typically on port 4242

The bridge serves as an intermediary between your eye tracker hardware and DevelexCore. It translates device-specific protocols into a unified API that DevelexCore can use.

**Note**: The dummy tracker for development does not require the bridge application.

## Installation

Install DevelexCore in your project using npm:

```bash
npm install develex-js-sdk
```

## Basic Concepts

### Eye Tracking Fundamentals

**Gaze Data**: Raw eye position coordinates (x, y) that the eye tracker captures, typically at 60+ Hz.

**Fixation**: When gaze stabilises on a specific point for a period of time, typically 100-300ms.

**Saccade**: Rapid eye movements that occur between fixation points.

**Dwell Time**: The duration that gaze remains on an element before triggering an action.

**Areas of Interest (AOI)**: Specific regions of your interface that you want to monitor for gaze activity.

### DevelexCore Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Eye Tracker   │ -> │  Develex Bridge  │ -> │  DevelexCore    │
│   Hardware      │    │  (WebSocket Server)│  │  SDK            │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────────────────────────────────────┤
│  • Register elements for gaze interactions                  │
│  • Handle gaze events (fixation, dwell, saccade)           │
│  • Process gaze data for custom logic                       │
│  • Window calibration for coordinate translation            │
└─────────────────────────────────────────────────────────────┘
```

### Window Calibration

Window calibration is essential for proper gaze tracking because eye trackers report coordinates relative to the entire screen (0-1 range), whereas your web application exists within a specific browser window. Without calibration, gaze coordinates will not align properly with your UI elements.

The calibration process typically occurs once per session and requires a mouse click to establish the coordinate transformation.

## Quick Start

### 1. Initialize GazeManager

```javascript
import { GazeManager } from 'develex-js-sdk';

// Create the gaze manager, which serves as the primary interface for all gaze functionality
const gazeManager = new GazeManager();
```

### 2. Configure Eye Tracker

Select your eye tracker type and create the input configuration:

```javascript
// For hardware eye trackers (requires the Develex Bridge to be running)
const gazepointConfig = {
    tracker: 'gazepoint',
    uri: 'ws://localhost:4242',  // WebSocket URI for the Bridge server
    fixationDetection: 'device'  // Use the eye tracker's built-in fixation detection
};

// For development and testing (no hardware required)
const dummyConfig = {
    tracker: 'dummy',
    fixationDetection: 'idt',     // Use the IDT algorithm for fixation detection
    frequency: 60,               // Gaze data emission frequency in Hz
    precisionMinimalError: 2,    // Minimum tracking error in pixels
    precisionDecayRate: 0.1,     // Rate at which precision degrades over time
    precisionMaximumError: 10    // Maximum tracking error limit
};

// Set up the input configuration
gazeManager.createInput(gazepointConfig); // or dummyConfig for testing
```

### 3. Connect and Start

```javascript
// Establish connection to the eye tracker
await gazeManager.connect();

// Subscribe to the gaze data stream
await gazeManager.subscribe();

// Begin receiving gaze data
await gazeManager.start();
```

### 4. Calibrate Window Coordinates

Before registering interactive elements, you must calibrate the window coordinates:

```javascript
// Calibrate window coordinates (required for proper gaze tracking)
// This maps screen coordinates (0-1) to your window's pixel coordinates
await gazeManager.setWindowCalibration(
    { clientX: 100, clientY: 100, screenX: 150, screenY: 200 },  // Mouse click coordinates
    { screen: { width: 1920, height: 1080 } }                    // Screen dimensions
);
```

This calibration is essential because eye trackers report coordinates relative to the entire screen (0-1 range), whereas your web application exists within a specific browser window. The calibration process maps these screen coordinates to your window's pixel coordinates, which ensures that gaze data aligns correctly with DOM elements.

### 5. Register Interactive Elements

```javascript
// Register a button for dwell interaction
const button = document.getElementById('myButton');
gazeManager.register({
    interaction: 'dwell',
    element: button,
    settings: {
      dwellTime: 1000,  // 1 second dwell time
      onDwellFinish: (event) => {
        console.log('Button activated by gaze!');
        button.click(); // Trigger the button action
      }
    }
});
```

### 6. Handle Gaze Events

```javascript
// Listen for raw gaze data
gazeManager.on('inputData', (gazeData) => {
    console.log('Gaze position:', gazeData.x, gazeData.y);
});

// Listen for fixation events
gazeManager.on('fixationObjectEnd', (event) => {
    console.log('Fixation ended on element');
});

// Listen for dwell events
gazeManager.on('dwellFinish', (event) => {
    console.log('Dwell completed');
});
```

## Common Interaction Patterns

### Dwell-Based Activation

This pattern works well for gaze based interactions in web applications where users activate elements by looking at them:

```javascript
const interactiveElements = document.querySelectorAll('.interactive');

// Register all elements for dwell interaction
interactiveElements.forEach(element => {
    gazeManager.register({
      interaction: 'dwell',
      element: element,
      settings: {
        dwellTime: 800,
        toleranceTime: 200, // Allow brief gaze excursions
        onDwellFinish: (event) => {
          // Trigger element activation
          element.dispatchEvent(new CustomEvent('gazeActivated'));
        }
      }
    });
});
```

**Note**: The `toleranceTime` setting allows brief gaze movements outside the element before the dwell interaction is cancelled.

### Fixation-Based Highlighting

This pattern provides visual feedback when users focus on elements:

```javascript
const focusableElements = document.querySelectorAll('.focusable');

focusableElements.forEach(element => {
    gazeManager.register({
      interaction: 'fixation',
      element: element,
      settings: {
        fixationObjectStart: (event) => {
          element.classList.add('gaze-focused');
        },
        fixationObjectEnd: (event) => {
          element.classList.remove('gaze-focused');
        }
      }
    });
});
```

For complete interaction configuration options, see the [GazeManager Reference](gaze-manager-reference.md#interaction-settings).

### Real-Time Gaze Cursor

This example creates a visual indicator that follows the user's gaze:

```javascript
// Create gaze cursor element
const gazeCursor = document.createElement('div');
gazeCursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: rgba(255, 0, 0, 0.7);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
`;
document.body.appendChild(gazeCursor);

// Update cursor position with gaze data
gazeManager.on('inputData', (data) => {
    // Note: data.x and data.y are in pixels after window calibration
    gazeCursor.style.left = `${data.x}px`;
    gazeCursor.style.top = `${data.y}px`;
});
```

## Configuration Options

### Additional Tracker Configurations

You can also configure other types of eye trackers:

```javascript
// EyeLogic configuration
const eyelogicConfig = {
    tracker: 'eyelogic',
    uri: 'ws://localhost:4242',
    fixationDetection: 'idt'
};

// ASEE configuration
const aseeConfig = {
    tracker: 'asee',
    uri: 'ws://localhost:4242',
    fixationDetection: 'idt'
};
```

For complete configuration options and advanced settings, see the [GazeManager Reference](gaze-manager-reference.md#configuration-options).

## Error Handling

```javascript
// Handle connection errors
gazeManager.on('inputError', (error) => {
    console.error('Eye tracker error:', error);
    // Implement reconnection logic or user notification
});

// Monitor connection state
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

## Advanced Calibration

### Eye Tracker Calibration

You can calibrate the eye tracker for accurate gaze tracking:

```javascript
// Start the eye tracker's built-in calibration process
await gazeManager.calibrate();
```

### Window Calibration Details

For a complete technical explanation of window calibration, see the [GazeManager Reference](gaze-manager-reference.md#window-calibration). The key points for getting started are:

**When to Recalibrate:**
- After any window resize or move
- When switching between displays
- If gaze tracking seems inaccurate

**Note**: Window calibration settings are stored in `gazeManager.windowCalibration` and persist across sessions.

## Cleanup

When you are finished using the gaze tracker, properly disconnect:

```javascript
// Stop data collection
await gazeManager.stop();

// Disconnect from the eye tracker
await gazeManager.disconnect();

// Clean up event listeners
gazeManager.removeAllListeners();
```

## Troubleshooting

### Common Issues

**Connection fails**: Ensure that your eye tracker software is running and that the Develex Bridge application is started (for hardware trackers). Also check that the bridge WebSocket server is accessible at the correct URI.

**Bridge not found**: Verify that you have downloaded the correct bridge version from the [releases page](https://develex-docs-197fe5.gitlab-pages.ics.muni.cz/bridge/releases). Note that the bridge is only required for hardware trackers - the dummy tracker works without it.

**No gaze data**: Check that the eye tracker is operating correctly and that the user is positioned properly. For hardware trackers, verify that the bridge is receiving data from the eye tracker hardware. For the dummy tracker, ensure that you are moving your mouse.

**Inaccurate tracking**: Perform window calibration first, then recalibrate the eye tracker if needed. Window calibration is essential for proper coordinate translation.

**Window calibration issues**: If gaze does not align with UI elements:
- Ensure that window calibration is performed after any window resize or move
- Check that the mouse click position and window dimensions are accurate
- Verify the calibration data in `gazeManager.windowCalibration`

**Performance issues**: Reduce buffer sizes or interaction complexity for smoother operation. If you do heavy processing on gaze data, consider moving it to a Web Worker.

**Missing fixation/dwell events**: Ensure that window calibration is set up correctly and that gaze coordinates are properly mapped to DOM elements.