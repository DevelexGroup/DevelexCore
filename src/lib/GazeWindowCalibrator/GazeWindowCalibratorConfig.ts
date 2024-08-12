/**
 * Type that defines the structure of the configuration object that is passed to the GazeWindowCalibrator class.
 * @property event - The pointer move event.
 * @property windowScreenWidth - window.screen.width
 * @property windowScreenHeight - window.screen.height
 */
export type GazeWindowCalibratorConfig = {
    clientX: number; //event.clientX
    clientY: number; //event.clientY
    screenX: number; //event.screenX
    screenY: number; //event.screenY
    windowScreenWidth: number; //window.screen.width
    windowScreenHeight: number; //window.screen.height
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
    };
}

export const createGazeWindowCalibrator = (
    event: GazeWindowCalibratorConfigMouseEventFields,
    window: GazeWindowCalibratorConfigWindowFields
): GazeWindowCalibratorConfig => {
    return {
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        windowScreenWidth: window.screen.width,
        windowScreenHeight: window.screen.height
    };
}