import { createISO8601Timestamp } from "$lib/utils/timeUtils";

/**
 * Type that defines the structure of the configuration object that is passed to the GazeWindowCalibrator class.
 * @property event - The pointer move event.
 * @property windowScreenWidth - window.screen.width
 * @property windowScreenHeight - window.screen.height
 * @property windowScreenLeft - left edge of the monitor on the virtual desktop
 * @property windowScreenTop - top edge of the monitor on the virtual desktop
 */
export type GazeWindowCalibratorConfig = {
    timestamp: string; // ISO 8601 timestamp to track when the calibration was made
    clientX: number; //event.clientX
    clientY: number; //event.clientY
    screenX: number; //event.screenX
    screenY: number; //event.screenY
    windowScreenWidth: number; //window.screen.width
    windowScreenHeight: number; //window.screen.height
    windowScreenLeft?: number; //window.screen.availLeft
    windowScreenTop?: number; //window.screen.availTop
};

/**
 * Type that defines the structure of the configuration object that is passed to the GazeWindowCalibrator class.
 * It is a MouseEvent type, but for testing purposes, it is defined as such.
 */
export interface GazeWindowCalibratorConfigMouseEventFields {
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
}

/**
 * Type that defines the structure of the configuration object that is passed to the GazeWindowCalibrator class.
 * It is a Window type, but for testing purposes, it is defined as such.
 */
export interface GazeWindowCalibratorConfigWindowFields {
    screen: {
        width: number;
        height: number;
        availLeft?: number;
        availTop?: number;
    };
}

export const createGazeWindowCalibrator = (
    event: GazeWindowCalibratorConfigMouseEventFields,
    window: GazeWindowCalibratorConfigWindowFields
): GazeWindowCalibratorConfig => {
    const globalScreen = (globalThis as { screen?: { availLeft?: number; availTop?: number } }).screen;
    return {
        timestamp: createISO8601Timestamp(),
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        windowScreenWidth: window.screen.width,
        windowScreenHeight: window.screen.height,
        windowScreenLeft: window.screen.availLeft ?? globalScreen?.availLeft ?? 0,
        windowScreenTop: window.screen.availTop ?? globalScreen?.availTop ?? 0
    };
}