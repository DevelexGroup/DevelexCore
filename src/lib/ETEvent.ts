// export event type ETEventType = "connected" | "disconnected" | "gazeData";
// in form of enum


import type {GazeDataPoint} from "./ETGazeData/ETGazeData.ts";

/**
 * ETEventType is the TS type for the event types emitted by the classes that implement {@link ETAdapter} interface.
 * It is just a string literal type that can be used to check the type of the event.
 * @category Event
 */

export type ETEvent = typeof ET_EVENT_CONNECTED | typeof ET_EVENT_DATA | typeof ET_EVENT_MESSAGE;


/**
 * Constant for the event type emitted when the eye tracker is connected.
 */
export const ET_EVENT_CONNECTED = "connected";

/**
 * Constant for the event type emitted when the eye tracker sends new data.
 * See
 */
export const ET_EVENT_DATA = "data";

/**
 * Constant for the event type emitted when the eye tracker sends a message.
 */
export const ET_EVENT_MESSAGE = "message";

export type ETHandlerMapping = {
    [ET_EVENT_CONNECTED]: () => void;
    [ET_EVENT_DATA]: (data: GazeDataPoint) => void;
    [ET_EVENT_MESSAGE]: (msg: string) => void;
};

