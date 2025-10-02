# DevelexCore

A TypeScript/JavaScript SDK for integrating eye tracking and gaze-based interactions into web applications. It is part of the develex ecosystem and focuses on gaze data processing for dyslexia interventions and gaze based interactions in web applications.

## Quick Start

```bash
npm install develex-js-sdk
```

```javascript
import { GazeManager } from 'develex-js-sdk';

// Create the gaze manager, which serves as the main entry point for all gaze functionality
const gazeManager = new GazeManager();

// Configure and connect to an eye tracker
gazeManager.createInput({
  tracker: 'gazepoint',
  uri: 'ws://localhost:4242',
  fixationDetection: 'device'
});
await gazeManager.connect();
await gazeManager.subscribe();
await gazeManager.start();

// Calibrate window coordinates (essential for proper gaze tracking)
await gazeManager.setWindowCalibration(
  { clientX: 100, clientY: 100, screenX: 150, screenY: 200 },
  { screen: { width: 1920, height: 1080 } }
);

// Register elements for gaze interaction
gazeManager.register({
  interaction: 'dwell',
  element: document.getElementById('myButton'),
  settings: {
    dwellTime: 1000,
    bufferSize: 100,
    toleranceTime: 150,
    onDwellProgress: (event) => {},
    onDwellFinish: (event) => console.log('User dwelled on button!'),
    onDwellCancel: (event) => {}
  }
});
```

## Documentation

- [Getting Started Guide](./docs/getting-started.md) - Setup instructions and basic usage
- [GazeManager Reference](./docs/gaze-manager-reference.md) - API documentation for the main GazeManager class
- [Data Structures Reference](./docs/data-structures-reference.md) - Interface and type definitions
- [Interaction Types Guide](./docs/interaction-types-guide.md) - Available gaze interaction types

## Core Features

### Multi-Device Support
- **GazePoint** - Professional eye tracking devices
- **EyeLogic** - Consumer-grade eye trackers
- **ASEE** - Advanced eye tracking systems
- **Dummy Input** - Testing and development

### Gaze Interaction Types
- **Fixation Detection** - Identifies when gaze stabilises on elements
- **Saccade Tracking** - Monitors rapid eye movements between points
- **Dwell Time** - Tracks how long gaze remains on elements
- **Intersection Detection** - Real-time gaze-element intersection
- **Validation** - Accuracy and precision measurements

### Technical Features
- **Real-time Processing** - Processes gaze data as it arrives, with configurable detection algorithms
- **Window Calibration** - Maps screen coordinates to browser window coordinates
- **Fixation Analysis** - Implements fixation detection algorithms for gaze analysis
- **Event-Driven Architecture** - Uses an event system for handling gaze interactions

## Architecture

The SDK is built around the **GazeManager** class, which provides a unified interface for all gaze functionality. The main components include:

- **GazeManager** - Main class that coordinates all gaze operations and provides the primary API
- **GazeInput** - Handles communication with different eye tracking devices
- **GazeInteraction** - Contains modules for detecting various types of gaze interactions
- **GazeFixationDetector** - Implements algorithms for detecting eye fixations
- **GazeWindowCalibrator** - Manages coordinate system calibration between screen and browser window

Most applications only need to use the **GazeManager** class, which provides a simplified interface for common operations.

## Testing

A separate testing interface exists for validating eye tracker functionality. To use it:

1. Start your eye tracking controller software (such as GazePoint Control)
2. Start the develex-bridge application
3. Visit the testing website to validate that everything works correctly

Note: This testing interface is separate from the main SDK and includes additional components for demonstration purposes.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Publishing

The package publishes to npm automatically when changes are pushed to the main branch. You can also publish manually:

```bash
npm publish
```

## License

This project is part of the develex ecosystem. See the main develex repository for licensing information.

## Related Projects

- [develex-bridge](https://github.com/develex/develex-bridge) - Bridge service for eye tracker communication
