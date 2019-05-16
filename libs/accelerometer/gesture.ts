namespace input {
    /**
     * Registers a custom gesture recognizer
     * @param id 
     * @param update true if gesture detected
     * @param handler 
     */
    export function onCustomGesture(
        id: number, 
        update: () => boolean, 
        handler: () => void) {
        if (!update || !handler) return;

        input.acceleration(Dimension.X); // turn on accelerometer
        const evid = DAL.ACCELEROMETER_EVT_2G + 1 + (id | 0);
        control.onEvent(DAL.DEVICE_ID_GESTURE, evid, handler);
        let sigma = 0;
        control.onIdle(function() {
            if (sigma > 0) {
                sigma--;
            } else if(update()) {
                sigma = 6;
                control.raiseEvent(DAL.DEVICE_ID_GESTURE, evid);
            }
        })
    }
}