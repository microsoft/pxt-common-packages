// Auto-generated. Do not edit.
declare namespace _wifi {

    /** Get ID used in events. */
    //% shim=_wifi::eventID
    function eventID(): int32;

    /** Start a WiFi network scan. */
    //% shim=_wifi::scanStart
    function scanStart(): void;

    /** Get the results of the scan if any. */
    //% shim=_wifi::scanResults
    function scanResults(): Buffer;

    /** Initiate connection. */
    //% shim=_wifi::connect
    function connect(ssid: string, pass: string): int32;

    /** Initiate disconnection. */
    //% shim=_wifi::disconnect
    function disconnect(): int32;

    /** Check if connected. */
    //% shim=_wifi::isConnected
    function isConnected(): boolean;
}

// Auto-generated. Do not edit. Really.
