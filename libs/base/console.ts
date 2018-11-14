/// <reference no-default-lib="true"/>

/**
 * Reading and writing data to the console output.
 */
//% weight=12 color=#002050 icon="\uf120"
//% advanced=true
namespace console {
    export enum LogPriority {
        Debug = 0,
        Log = 1,
        Warning = 2,
        Error = 3,
        Silent = 4
    }

    type Listener = (priority: LogPriority, text: string) => void;

    //% whenUsed
    const listeners: Listener[] = [function(priority: LogPriority, text: string) { control.__log(text); }];

    /**
     * Write a line of text to the console output.
     * @param value to send
     */
    //% weight=90
    //% help=console/log blockGap=8
    //% blockId=console_log block="console|log %text"
    //% text.shadowOptions.toString=true
    export function log(text: string): void {
        // pad text on the 32byte boundar
        text += "\r\n";
        // send to listeners
        for (let i = 0; i < listeners.length; ++i)
            listeners[i](LogPriority.Log, text);
    }

    /**
     * Write a name:value pair as a line of text to the console output.
     * @param name name of the value stream, eg: "x"
     * @param value to write
     */
    //% weight=88 blockGap=8
    //% help=console/log-value
    //% blockId=console_log_value block="console|log value %name|= %value"
    export function logValue(name: string, value: number): void {
        log(name ? `${name}: ${value}` : `${value}`)
    }

    /**
     * Adds a listener for the log messages
     * @param listener
     */
    //%
    export function addListener(listener: (priority: console.LogPriority, text: string) => void) {
        if (!listener) return;
        listeners.push(listener);
    }
}