/**
 * Type that defines the structure of the configuration object that is passed to the ETWindowCalibrator class.
 * @property event - The pointer move event.
 * @property windowScreenWidth - window.screen.width
 * @property windowScreenHeight - window.screen.height
 */
export type ETWindowCalibratorConfig = {
    event: MouseEvent; //The pointer move event.
    windowScreenWidth: number; //window.screen.width
    windowScreenHeight: number; //window.screen.height
};