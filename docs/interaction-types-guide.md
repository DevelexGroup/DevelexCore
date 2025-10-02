# Interaction Types Guide

This guide covers all gaze interaction types available in DevelexCore, from basic dwell interactions to advanced saccade detection. These interactions work with `GazeManager` but can also be used independently for specialized use cases.

## Overview

DevelexCore provides **5 core interaction types** that detect different patterns in eye movement data:

| Interaction Type | Purpose | Use Case |
|------------------|---------|----------|
| **Dwell** | Time-based hovering | "Click" by looking |
| **Fixation** | Eye stabilization | Visual feedback |
| **Saccade** | Rapid eye movements | Navigation patterns |
| **Validation** | Custom validation | Quality assessment |
| **Intersection** | Area detection | Hover states |

## Architecture

### Integration with GazeManager (Recommended)

```typescript
import { GazeManager } from 'develex-js-sdk';

const gazeManager = new GazeManager();
// Configure input, connect, calibrate...

// Register elements for interactions
gazeManager.register({
  interaction: 'dwell',
  element: document.getElementById('button'),
  settings: {
    dwellTime: 1000,
    onDwellFinish: () => console.log('Activated!')
  }
});

// Listen to events
gazeManager.on('dwellFinish', (event) => {
  // Handle interaction
});
```

**Benefits of GazeManager integration:**
- Automatic data routing and processing
- Built-in window calibration
- Coordinated event handling
- Simplified API

### Standalone Usage

For advanced scenarios that require more control:

```typescript
import { GazeInteractionObjectDwell, GazeInteractionObjectValidation } from 'develex-js-sdk';

// Create interaction instance
const dwellInteraction = new GazeInteractionObjectDwell();

// Register element manually
dwellInteraction.register(buttonElement, {
  dwellTime: 1000,
  onDwellFinish: (event) => {
    console.log('Dwell completed!');
  }
});

// Process gaze data manually
function processGazeData(gazeData) {
  dwellInteraction.evaluate(gazeData);
}

// Listen to events
dwellInteraction.on('dwellFinish', (event) => {
  // Handle interaction
});
```

## Interaction Types

### 1. Dwell Interaction

**Purpose:** Detects when a user maintains gaze on an element for a specified duration.

**Key Settings:**
```typescript
interface GazeInteractionDwellSettingsType {
  dwellTime: number;        // Required gaze duration (ms)
  bufferSize: number;       // Element expansion (pixels)
  toleranceTime: number;    // Allowed gaze excursions (ms)
  onDwellProgress: (event: GazeInteractionObjectDwellEvent) => void;
  onDwellFinish: (event: GazeInteractionObjectDwellEvent) => void;
  onDwellCancel: (event: GazeInteractionObjectDwellEvent) => void;
}
```

**Use Cases:**
- **Accessibility:** Enables "clicking" by looking for users with motor impairments
- **Gaming:** Allows menu selection without physical input
- **Presentations:** Enables advancing slides with sustained attention

**Example:**
```typescript
gazeManager.register({
  interaction: 'dwell',
  element: document.getElementById('menu-item'),
  settings: {
    dwellTime: 800,        // 800ms to activate
    toleranceTime: 200,    // Allow brief eye movements
    onDwellFinish: () => {
      // Trigger menu action
      selectMenuItem();
    }
  }
});
```

**Standalone Usage:**
```typescript
const dwell = new GazeInteractionObjectDwell();

dwell.register(element, {
  dwellTime: 1000,
  toleranceTime: 150,
  bufferSize: 50,  // Expand hit area
  onDwellFinish: handleActivation
});

function onGazeData(data) {
  dwell.evaluate(data);
}
```

### 2. Fixation Interaction

**Purpose:** Detect when eyes stabilise on a specific point (fixation events).

**Key Settings:**
```typescript
interface GazeInteractionObjectFixationSettings {
  bufferSize: number;  // Hit area expansion (pixels)
  fixationObjectStart: (event: GazeInteractionObjectFixationEvent) => void;
  fixationObjectEnd: (event: GazeInteractionObjectFixationEvent) => void;
  fixationObjectProgress: (event: GazeInteractionObjectFixationEvent) => void;
}
```

**Use Cases:**
- **Visual Feedback:** Show "focused" state when looking at elements
- **Reading Analysis:** Track which content receives attention
- **User Testing:** Measure visual engagement

**Example:**
```typescript
gazeManager.register({
  interaction: 'fixation',
  element: document.querySelector('.focusable'),
  settings: {
    fixationObjectStart: (event) => {
      element.classList.add('gaze-focused');
    },
    fixationObjectEnd: (event) => {
      element.classList.remove('gaze-focused');
    }
  }
});
```

### 3. Saccade Interaction

**Purpose:** Detect rapid eye movements between fixation points.

**Key Settings:**
```typescript
interface GazeInteractionObjectSaccadeSettings {
  bufferSize: number;
  saccadeObjectFrom: (event: GazeInteractionObjectSaccadeEvent) => void;  // Leaving element
  saccadeObjectTo: (event: GazeInteractionObjectSaccadeEvent) => void;    // Entering element
}
```

**Use Cases:**
- **Navigation Analysis:** Track reading patterns and flow
- **Attention Mapping:** Understand visual search behaviour
- **Interface Design:** Optimize layout based on eye movement patterns

**Example:**
```typescript
gazeManager.register({
  interaction: 'saccade',
  element: document.querySelector('.content-area'),
  settings: {
    saccadeObjectTo: (event) => {
      // User looked at this area
      trackAttention(event.originFixation, event.targetFixation);
    }
  }
});
```

### 4. Validation Interaction

**Purpose:** Assess gaze tracking quality and accuracy over time.

**Key Settings:**
```typescript
interface GazeInteractionObjectValidationSettings {
  accuracyTolerance: number;  // Acceptable accuracy (pixels)
  validationDuration: number; // Test duration (ms)
  onValidation: (event: GazeInteractionObjectValidationEvent) => void;
}
```

**Use Cases:**
- **Quality Assurance:** Verify eye tracker calibration
- **Adaptive Interfaces:** Adjust sensitivity based on tracking quality
- **Research:** Collect accuracy/precision metrics

**Example:**
```typescript
const validation = new GazeInteractionObjectValidation();

validation.validate(calibrationTarget, {
  accuracyTolerance: 50,    // 50px accuracy required
  validationDuration: 2000, // 2 second test
  onValidation: (event) => {
    if (event.isValid) {
      console.log(`Accuracy: ${event.accuracy}px, Precision: ${event.precision}px`);
    } else {
      console.log('Calibration needs adjustment');
    }
  }
});
```

### 5. Intersection Interaction

**Purpose:** Detect when gaze intersects with defined areas.

**Key Settings:**
```typescript
interface GazeInteractionObjectIntersectSettingsType {
  bufferSize: number;  // Hit area expansion (pixels)
  onIntersect: (event: GazeInteractionObjectIntersectEvent) => void;
}
```

**Use Cases:**
- **Hover States:** Visual feedback for any gazed-at area
- **Heat Mapping:** Track attention across entire interface
- **Dynamic Content:** Show/hide content based on gaze location

**Example:**
```typescript
gazeManager.register({
  interaction: 'intersect',
  element: document.querySelector('.heatmap-area'),
  settings: {
    bufferSize: 100,  // Large detection area
    onIntersect: (event) => {
      // Track attention to this region
      recordHeatmapData(event.gazeData);
    }
  }
});
```

## Fixation Detection Methods

Two fixation detection approaches are available:

### Device Fixation Detection
```typescript
// Use hardware-based fixation detection
gazeManager.createInput({
  tracker: 'gazepoint',
  fixationDetection: 'device'  // Hardware handles fixation detection
});
```

### IDT Algorithm (Web Worker)
```typescript
// Use software-based fixation detection
gazeManager.createInput({
  tracker: 'dummy',
  fixationDetection: 'idt'  // IDT algorithm in Web Worker
});
```

**Choose based on:**
- **Device:** More accurate, less CPU usage, but requires capable hardware
- **IDT:** Consistent across trackers, customizable parameters, higher CPU usage

## Best Practices

### Performance Optimization
- Use appropriate `bufferSize` values (50-200px typically)
- Consider `toleranceTime` for dwell interactions to reduce false negatives
- Monitor fixation detection method performance for your use case

### Accessibility Considerations
- Provide visual feedback for all interaction states
- Allow sufficient `dwellTime` for users with varying abilities
- Consider combining interaction types for robust detection

### Error Handling
- Listen for validation events to detect tracking quality issues
- Implement fallback interaction methods
- Monitor gaze data validity (`validityL`, `validityR`)

## Complete Example

```typescript
import { GazeManager } from 'develex-js-sdk';

const gazeManager = new GazeManager();

// Configure input
gazeManager.createInput({
  tracker: 'gazepoint',
  uri: 'ws://localhost:4242',
  fixationDetection: 'device'
});

// Connect and calibrate
await gazeManager.connect();
await gazeManager.subscribe();
await gazeManager.start();
await gazeManager.setWindowCalibration(mouseEvent, screenInfo);

// Register multiple interaction types
const button = document.getElementById('action-button');
const content = document.querySelector('.content');

// Dwell for activation
gazeManager.register({
  interaction: 'dwell',
  element: button,
  settings: {
    dwellTime: 1000,
    toleranceTime: 200,
    onDwellFinish: () => button.click()
  }
});

// Fixation for visual feedback
gazeManager.register({
  interaction: 'fixation',
  element: content,
  settings: {
    fixationObjectStart: () => content.classList.add('focused'),
    fixationObjectEnd: () => content.classList.remove('focused')
  }
});

// Saccade for navigation tracking
gazeManager.register({
  interaction: 'saccade',
  element: content,
  settings: {
    saccadeObjectTo: (event) => {
      trackReadingPattern(event.originFixation, event.targetFixation);
    }
  }
});

// Handle events
gazeManager.on('dwellFinish', (event) => {
  console.log('Element activated:', event.target[0]);
});
```

## When to Use Standalone Interactions

Although GazeManager integration is recommended, consider standalone usage when:

- **Custom Data Processing:** You need to preprocess or filter gaze data
- **Multiple Data Sources:** You are combining eye tracking with other inputs
- **Performance Critical:** You need minimal overhead for specific use cases
- **Research/Prototyping:** You are testing interaction concepts independently

For most production applications, use **GazeManager integration** for the best experience and maintainability.
