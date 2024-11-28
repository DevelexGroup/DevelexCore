# develex-core

A comprehensive TypeScript/JavaScript library for eye tracking integration and gaze-based interactions in web applications. Part of the develex ecosystem, primarily focused on gaze data processing for dyslexia interventions.

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
3. Proceed to the testing website with develex-core

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

The package is published to the GitLab package registry. To publish the package, you
need to set the `CI_JOB_TOKEN` environment variable and run the `npm publish` command.

```bash
set CI_JOB_TOKEN=<your-token>
npm publish
```

## Using the package

To use the package, you need to set the GitLab package registry and pass the token to
the npm configuration.

```bash
npm config set -- //gitlab.ics.muni.cz/:_authToken=<your-token>
```

```bash
npm config set @473783:registry=https://gitlab.ics.muni.cz/api/v4/projects/7015/
packages/npm/
```

```bash
npm i @473783/develex-core
```
