enum JDConsoleMode {
    //% block="off"
    Off = 0,
    //% block="logger"
    Logger = 1,
    //% block="listen"
    Listen = 2
}

namespace jacdac {
    const enum JDConsolePacketType {
        Message
    }

    /**
     * Console logging driver. The driver has 3 exclusive states: off, logging or listening.
     */
    //% fixedInstances
    export class ConsoleService extends Broadcast {
        private _lastListenerTime: number;

        static BROADCAST_TIMEOUT = 2000;

        constructor() {
            super("log", jacdac.LOGGER_DEVICE_CLASS, 2);
            this.controlData[0] = JDConsoleMode.Off;
            this.controlData[1] = console.minPriority; // TODO this may get outdated
            console.addListener((priority, text) => this.broadcast(priority, text));
        }

        /**
         * Sets the console service mode
         * @param mode 
         */
        //% blockId=jdconsolesetmode block="set %service mode to %mode"
        //% group="Console"
        setConsoleMode(consoleMode: JDConsoleMode) {
            this.start();
            if (this.consoleMode != consoleMode) {
                this.controlData[0] = consoleMode;
                this.supressLog = this.consoleMode == JDConsoleMode.Logger;
                this.priority = this.consoleMode == JDConsoleMode.Logger ? ConsolePriority.Error : ConsolePriority.Log;
                this.log(`mode ${this.consoleMode}`);
            }
        }

        get consoleMode(): JDConsoleMode {
            return this.controlData[0];
        }

        get priority(): ConsolePriority {
            this.controlData[1] = console.minPriority;
            return this.controlData[1];
        }

        set priority(value: ConsolePriority) {
            this.controlData[1] = value;
            console.minPriority = value; // keep in sync
        }

        handleServiceInformation(device: JDDevice, serviceInfo: JDServiceInformation): number {
            const data = serviceInfo.data;
            const consoleMode = data[0];
            const priority = data[1];

            if (consoleMode == JDConsoleMode.Listen) {
                // if a listener enters the bus, automatically start broadcasting
                if (this.consoleMode != JDConsoleMode.Listen)
                    this.setConsoleMode(JDConsoleMode.Logger);
                // update priority if needed
                if (priority < this.priority) // update priority
                    this.priority = priority;
                this._lastListenerTime = control.millis();
            }
            return jacdac.DEVICE_OK;
        }

        handlePacket(packet: JDPacket): number {
            // received packet, ignore unless in listening mode
            if (this.consoleMode != JDConsoleMode.Listen)
                return jacdac.DEVICE_OK;

            const data = packet.data;
            const type: JDConsolePacketType.Message = data[0];
            switch (type) {
                case JDConsolePacketType.Message:
                    const priority = data[1];
                    // shortcut
                    if (priority < this.priority)
                        return jacdac.DEVICE_OK;

                    // send message to console
                    const device = jacdac.JACDAC.instance.getRemoteDevice(packet.device_address);
                    const deviceName = device ? device.device_name : `${toHex8(packet.device_address)}`;
                    const str = data.slice(2).toString();
                    console.add(priority, `${deviceName}> ${str}`);
                    break;
                default:
                    break;
            }

            return jacdac.DEVICE_OK;
        }

        private broadcast(priority: ConsolePriority, str: string) {
            if (this.consoleMode != JDConsoleMode.Logger)
                return;

            // no one listening -- or disconnected?
            if (!jacdac.JACDAC.instance.bus.isConnected()
                || control.millis() - this._lastListenerTime > ConsoleService.BROADCAST_TIMEOUT) {
                this.setConsoleMode(JDConsoleMode.Off);
                return;
            }

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, jacdac.JD_SERIAL_MAX_PAYLOAD_SIZE - 2);
                const buf = control.createBuffer(txLength + 2);
                buf[0] = JDConsolePacketType.Message;
                buf[1] = priority;
                for (let i = 0; i < txLength; i++)
                    buf[i + 2] = str.charCodeAt(i + cursor);
                this.sendPacket(buf);
                cursor += txLength;
            }
        }
    }

    //% fixedInstance whenUsed block="console service"
    export const consoleService = new ConsoleService();
}