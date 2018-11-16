/// <reference no-default-lib="true"/>

enum ConsolePriority {
    Debug = 0,
    Log = 1,
    Warning = 2,
    Error = 3,
    Silent = 4
}

/**
 * Reading and writing data to the console output.
 */
//% weight=12 color=#002050 icon="\uf120"
//% advanced=true
namespace console {
    type Listener = (priority: ConsolePriority, text: string) => void;

    /**
     * Minimum priority to send messages to listeners
     */
    export let minPriority = ConsolePriority.Log;

    //% whenUsed
    const listeners: Listener[] = [
        function (priority: ConsolePriority, text: string) { control.__log(priority, text); }
    ];

    export function add(priority: ConsolePriority, text: string) {
        if (priority < minPriority) return;
        // add new line
        text += "\n";
        // send to listeners
        for (let i = 0; i < listeners.length; ++i)
            listeners[i](priority, text);
    }

    export function debug(text: string) {
        this.add(ConsolePriority.Debug, text);
    }

    export function warning(text: string) {
        this.add(ConsolePriority.Warning, text);
    }

    export function error(text: string) {
        this.add(ConsolePriority.Error, text);
    }

    /**
     * Write a line of text to the console output.
     * @param value to send
     */
    //% weight=90
    //% help=console/log blockGap=8
    //% blockId=console_log block="console|log %text"
    //% text.shadowOptions.toString=true
    export function log(text: string): void {
        add(ConsolePriority.Log, text);
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
    export function addListener(listener: (priority: ConsolePriority, text: string) => void) {
        if (!listener) return;
        listeners.push(listener);
    }

    /**
     * Removes a listener
     * @param listener 
     */
    //%
    export function removeListener(listener: (priority: ConsolePriority, text: string) => void) {
        if (!listener) return;
        const i = listeners.indexOf(listener);
        if (i > -1)
            listeners.splice(i, 1);
    }
}