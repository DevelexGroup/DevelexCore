# develex-js-sdk

A comprehensive TypeScript/JavaScript SDK for eye tracking integration and gaze-based interactions in web applications. Part of the develex ecosystem, primarily focused on gaze data processing for dyslexia interventions.

## Core Components

### Emitter

Base event emitter functionality used throughout the library. Provides core event handling capabilities for all gaze-related components.

### GazeManager

The main facade of the library that coordinates all gaze-related functionality. Provides a centralized way to manage eye tracking inputs, interactions, and calibration.

### GazeInput

Core functionality for handling eye tracking device inputs. Includes interfaces and implementations for different eye tracking devices (GazePoint, SMI, Eyelogic, and a dummy input for testing).

### GazeInteraction

Components and types for handling different types of gaze interactions:

- Fixation: Detects when a user's gaze stabilizes on an element
- Saccade: Detects rapid eye movements between fixation points
- Dwell: Tracks how long a user's gaze remains on an element
- Validation: Provides accuracy and precision measurements for gaze tracking
- Intersect: Detects when a user's gaze intersects with elements

### GazeIndicator

Visual feedback component for gaze position. Useful for debugging and providing user feedback.

### GazeWindowCalibrator

Utilities for calibrating gaze data to window coordinates.

### GazeFixationDetector

Utilities for detecting and analyzing fixations, including dispersion calculations and size conversions.

## Testing eye-trackers

We provide a testing webpage, built with GitLab Pages, for you to test functionality of your GazePoint, SMI and EyeLogic eye-tracker. To enable gaze data in a browser environment you have to:

1. Start your eye-tracking controller software (e.g., GazePoint Control)
2. Start develex-bridge
3. Proceed to the testing website with develex-js-sdk

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
```

or start the server and open the app in a new browser tab

```bash
npm run dev -- --open
```

## Publishing

The package is automatically published to the public npm registry via GitLab CI/CD when changes are pushed to the main branch. You can also publish manually:

```bash
npm publish
```

## Installation

Install the package from npm:

```bash
npm install develex-js-sdk
```

## Usage

Import the library in your project:

```javascript
import { GazeManager } from 'develex-js-sdk';

// Initialize the gaze manager
const gazeManager = new GazeManager();
```
